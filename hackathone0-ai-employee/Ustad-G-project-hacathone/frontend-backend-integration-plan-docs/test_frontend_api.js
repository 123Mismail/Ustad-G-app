/**
 * End-to-End Integration Test for Frontend ↔ Backend API Flow
 * 
 * This script simulates the exact sequence of network requests 
 * made by the React Native frontend service layer.
 * 
 * Run with: node test_integration.js
 */

const API_BASE = 'http://localhost:8002/v1';
let authToken = '';
let userId = null;
let providerId = null;
let sessionId = 'test-session-' + Date.now();

// Utility for making HTTP requests
async function makeRequest(method, endpoint, body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error [${response.status}] ${endpoint}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runTests() {
  console.log('🚀 Starting Frontend-Backend API Integration Tests...\n');
  
  const testPhone = `+92300${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testPassword = 'TestPassword123!';

  try {
    // 1. Auth Flow - Register
    console.log(`[1/7] Registering new user (${testPhone})...`);
    const registerResponse = await makeRequest('POST', '/auth/register', {
      name: 'Integration Tester',
      phone: testPhone,
      email: `test${Date.now()}@example.com`,
      city: 'Karachi',
      area: 'Clifton',
      password: testPassword
    }, false);
    console.log('✅ Registration successful. User ID:', registerResponse.id);
    userId = registerResponse.id;

    // 2. Auth Flow - Login
    console.log(`\n[2/7] Logging in...`);
    const loginResponse = await makeRequest('POST', '/auth/login', {
      phone: testPhone,
      password: testPassword
    }, false);
    authToken = loginResponse.access_token;
    console.log('✅ Login successful. Token received.');

    // 3. Register FCM Push Token
    console.log(`\n[3/7] Registering FCM Device Token...`);
    await makeRequest('PATCH', '/users/me/token', {
      device_token: 'mock-expo-push-token-12345'
    });
    console.log('✅ Device token registered successfully.');

    // 4. AI Chat Interaction
    console.log(`\n[4/7] Simulating AI Chat...`);
    const chatResponse = await makeRequest('POST', '/chat', {
      session_id: sessionId,
      message: 'I need an electrician for wiring repair',
      user_phone: testPhone
    });
    console.log('✅ AI Chat responded. Agent:', chatResponse.agent || 'Orchestrator');
    console.log('   Reply snippet:', chatResponse.reply.substring(0, 50) + '...');

    // 5. Fetch Providers
    console.log(`\n[5/7] Fetching matching providers...`);
    const providersResponse = await makeRequest('GET', '/providers?city=Karachi');
    if (providersResponse.length > 0) {
      providerId = providersResponse[0].provider_id || providersResponse[0].id;
      console.log(`✅ Found ${providersResponse.length} providers. Selected Provider ID: ${providerId}`);
    } else {
      console.warn('⚠️ No providers found in database. Please run backend seed scripts.');
      // Fallback mock ID so the rest of the test can attempt to continue
      providerId = 'mock_provider_123';
    }

    // 6. Create Booking
    console.log(`\n[6/7] Creating a booking...`);
    const bookResponse = await makeRequest('POST', '/book', {
      session_id: sessionId,
      provider_id: String(providerId),
      user_name: 'Integration Tester'
    });
    console.log('✅ Booking created! Confirmation ID:', bookResponse.confirmation_id);

    // 7. Fetch Booking History
    console.log(`\n[7/7] Fetching booking history...`);
    const historyResponse = await makeRequest('GET', '/bookings');
    console.log(`✅ Retrieved ${historyResponse.length} bookings.`);
    const matchedBooking = historyResponse.find(b => b.confirmation_id === bookResponse.confirmation_id);
    if (matchedBooking) {
      console.log('✅ Verified booking exists in history.');
    } else {
      throw new Error('Booking was created but not found in history!');
    }

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error(error.message);
    process.exit(1);
  }
}

// Execute tests
runTests();
