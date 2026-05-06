const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@gmail.com',
            password: '123456'
        });
        console.log('Login Success:', response.data);
    } catch (error) {
        console.error('Login Error:', error.response ? error.response.data : error.message);
    }
};

testLogin();
