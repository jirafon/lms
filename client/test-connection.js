// Test script to verify client-server connection
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testConnection() {
  try {
    console.log('🔍 Testing connection to server...');
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    
    // Test basic connection
    const response = await axios.get(`${API_BASE_URL}/user/profile`, {
      withCredentials: true
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', response.data);
    
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log('🔍 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Check if server is running
    try {
      await axios.get('http://localhost:3000');
      console.log('✅ Server is running on port 3000');
    } catch (serverError) {
      console.log('❌ Server is not running on port 3000');
      console.log('💡 Make sure to run: cd server && npm run dev');
    }
  }
}

testConnection(); 