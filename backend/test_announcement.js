const axios = require('axios');
const jwt = require('jsonwebtoken');
const FormData = require('form-data');

const SECRET = "mysecretkey";

async function test() {
  try {
    const token = jwt.sign({ id: 1, role: 'admin' }, SECRET, { expiresIn: '1h' });

    const form = new FormData();
    form.append('title', 'Test title');
    form.append('message', 'Test message');
    form.append('priority', 'Normal');
    form.append('target_type', 'All Employees');
    form.append('target_id', '');
    form.append('publish_date', '2026-04-30');
    form.append('expiry_date', '');

    console.log("Sending request...");
    const res = await axios.post('http://localhost:5000/api/announcements/create', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log("Response:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
