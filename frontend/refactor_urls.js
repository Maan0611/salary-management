const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const srcDir = path.join(__dirname, 'src');
console.log('Crawling src directory:', srcDir);

const files = walk(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

files.forEach(f => {
  if (path.basename(f) === 'apiConfig.js') return;

  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  let localDeclFound = false;

  // Let's identify and clean local API_URL declarations in pages like ForgotPassword.jsx, Login.jsx, Salary.jsx
  // Pattern matches ForgotPassword.jsx / Salary.jsx format
  const declPattern1 = /const\s+API_URL\s*=\s*window\.location\.hostname\s*===\s*(["'])localhost\1\s*\?\s*(["'])http:\/\/localhost:5000\/api\2\s*:\s*(["'])https:\/\/salary-management-64wa\.onrender\.com\/api\3;?/g;
  if (declPattern1.test(content)) {
    content = content.replace(declPattern1, 'const API_URL = `${API_URL_BASE}/api`;');
    localDeclFound = true;
    changed = true;
  }

  // Pattern matches Login.jsx format
  const declPattern2 = /const\s+API_URL\s*=\s*window\.location\.hostname\s*===\s*(["'])localhost\1\s*\?\s*(["'])http:\/\/localhost:5000\/api\2\s*:\s*\`\$\{window\.location\.hostname\s*===\s*'localhost'\s*\?\s*'http:\/\/localhost:5000'\s*:\s*'https:\/\/salary-management-64wa\.onrender\.com'\}\/api\`;?/g;
  if (declPattern2.test(content)) {
    content = content.replace(declPattern2, 'const API_URL = `${API_URL_BASE}/api`;');
    localDeclFound = true;
    changed = true;
  }

  // Handle other variants of declaring local API_URL in a single line
  const declPattern3 = /const\s+API_URL\s*=\s*window\.location\.hostname\s*===\s*(["'])localhost\1\s*\?\s*(["'])http:\/\/localhost:5000\/api\2\s*:\s*(["'])https:\/\/salary-management-64wa\.onrender\.com\/api\3;?/g;

  // Replace any inline ternary string: `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}`
  const inlineTernaryPattern = /\$\{window\.location\.hostname\s*===\s*(['"])localhost\1\s*\?\s*(['"])http:\/\/localhost:5000\2\s*:\s*(['"])https:\/\/salary-management-64wa\.onrender\.com\3\}/g;
  if (inlineTernaryPattern.test(content)) {
    content = content.replace(inlineTernaryPattern, '${API_URL}');
    changed = true;
  }

  // Also catch files that might have been processed by the old fix_urls.js to have the inline ternary outside template string
  const rawTernaryPattern = /window\.location\.hostname\s*===\s*(['"])localhost\1\s*\?\s*(['"])http:\/\/localhost:5000\2\s*:\s*(['"])https:\/\/salary-management-64wa\.onrender\.com\3/g;
  if (rawTernaryPattern.test(content) && !localDeclFound) {
    content = content.replace(rawTernaryPattern, 'API_URL');
    changed = true;
  }

  if (changed) {
    // Determine the correct relative path to apiConfig
    // All files are in src/pages except any components.
    const fileDir = path.dirname(f);
    let relativeImportPath = '../apiConfig';
    if (path.basename(fileDir) === 'components') {
      relativeImportPath = '../apiConfig';
    } else if (fileDir.endsWith('pages')) {
      relativeImportPath = '../apiConfig';
    } else if (fileDir.endsWith('src')) {
      relativeImportPath = './apiConfig';
    }

    const importName = localDeclFound ? 'API_URL_BASE' : 'API_URL';
    const importStatement = `import ${importName} from "${relativeImportPath}";\n`;

    if (!content.includes('apiConfig')) {
      // Find the first line that is an import and insert it above or below it
      const match = content.match(/^import /m);
      if (match) {
        content = content.replace(/^import /m, `${importStatement}import `);
      } else {
        content = importStatement + content;
      }
      console.log(`- Added import ${importName} to ${path.basename(f)}`);
    } else {
      console.log(`- apiConfig import already exists in ${path.basename(f)}`);
    }

    fs.writeFileSync(f, content, 'utf8');
    console.log(`✅ Successfully refactored: ${path.basename(f)}`);
  }
});

console.log('Refactoring process complete!');
