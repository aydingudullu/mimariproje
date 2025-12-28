
import axios from 'axios';

async function testSession() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const { access_token } = loginResponse.data;
    console.log('Login successful. Token:', access_token ? 'Received' : 'Missing');

    if (!access_token) {
      console.error('No access token received');
      return;
    }

    // 2. Get Current User (Session Check)
    console.log('Checking session (/auth/me)...');
    const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    console.log('Session valid. User:', meResponse.data.user.email);

  } catch (error: any) {
    console.error('Session test failed:', error.response ? error.response.data : error.message);
  }
}

testSession();
