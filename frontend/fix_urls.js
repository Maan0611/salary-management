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

const files = walk('./src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  const regex = /(["`])https:\/\/salary-management-64wa\.onrender\.com(.*?)\1/g;
  
  if (regex.test(content)) {
    let newContent = content.replace(regex, "`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}$2`");
    fs.writeFileSync(f, newContent);
    console.log('Fixed ' + path.basename(f));
  }
});
