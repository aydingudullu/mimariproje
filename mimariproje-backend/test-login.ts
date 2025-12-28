
import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    console.log('Login successful:', response.data);
  } catch (error: any) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
  }
}

testLogin();
