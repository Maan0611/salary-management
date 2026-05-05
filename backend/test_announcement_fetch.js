const jwt = require('jsonwebtoken');

const SECRET = "mysecretkey";

async function test() {
  try {
    const token = jwt.sign({ id: 1, role: 'admin' }, SECRET, { expiresIn: '1h' });

    const formData = new FormData();
    formData.append('title', 'Test title');
    formData.append('message', 'Test message');
    formData.append('priority', 'Normal');
    formData.append('target_type', 'All Employees');
    formData.append('target_id', '');
    formData.append('publish_date', '2026-04-30');
    formData.append('expiry_date', '');

    console.log("Sending request...");
    const res = await fetch('http://localhost:5000/api/announcements/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
