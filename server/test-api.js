const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';
let logOutput = "";

function log(str) {
  logOutput += str + "\n";
  console.log(str);
}

async function runTests() {
  log('--- Starting API Tests ---\n');
  let donorToken = '';
  const testEmail = `donor_${Date.now()}@example.com`;
  const validPassword = "password123";

  // TC-02
  try {
    log('[TC-02] Testing: Register valid new donor');
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: "Test Donor", email: testEmail, password: validPassword, role: "donor",
      phone: "1234567890", location: { address: "123 Test Street", coordinates: { lat: 10, lng: 20 } }
    });
    log(`Status: ${res.status}`);
    log(`Result: ${res.data.success ? 'Success' : 'Failed'}`);
    donorToken = res.data.token;
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  // TC-01
  try {
    log('\n[TC-01] Testing: Register duplicate donor');
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      name: "Test Donor 2", email: testEmail, password: validPassword, role: "donor", phone: "0987654321"
    });
    log(`Status: ${res.status}`);
    log(`Body: ${JSON.stringify(res.data)}`);
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  // TC-05
  try {
    log('\n[TC-05] Testing: Login with incorrect password');
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail, password: "wrongpassword456"
    });
    log(`Status: ${res.status}`);
    log(`Body: ${JSON.stringify(res.data)}`);
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  // TC-06
  try {
    log('\n[TC-06] Testing: Login with valid credentials');
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail, password: validPassword
    });
    log(`Status: ${res.status}`);
    log(`Result: ${res.data.success ? 'Success' : 'Failed'}`);
    // Optional: Refresh token from login
    donorToken = res.data.token;
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  // TC-07
  try {
    log('\n[TC-07] Testing: Get user profile with active JWT token');
    const res = await axios.get(`${BASE_URL}/auth/me`, {
       headers: { Authorization: `Bearer ${donorToken}` }
    });
    log(`Status: ${res.status}`);
    log(`Result: ${res.data.success ? 'Success User:' + res.data.user.email : 'Failed'}`);
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  // TC-03
  try {
    log('\n[TC-03] Testing: Create donation with expiry before prepared time');
    const res = await axios.post(`${BASE_URL}/food/create`, {
      foodType: "Cooked Meals", quantity: 50,
      preparedAt: new Date(Date.now() + 100000).toISOString(),
      expiryTime: new Date(Date.now()).toISOString(),
      pickupLocation: { address: "123 Test Street" }
    }, { headers: { Authorization: `Bearer ${donorToken}` } });
    log(`Status: ${res.status}`);
    log(`Body: ${JSON.stringify(res.data)}`);
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  // TC-08
  try {
    log('\n[TC-08] Testing: Create donation without Authorization header');
    const res = await axios.post(`${BASE_URL}/food/create`, {
      foodType: "Fresh Produce", quantity: 20,
      preparedAt: new Date(Date.now() - 10000).toISOString(),
      expiryTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      pickupLocation: { address: "123 Test Street", coordinates: { lat: 10, lng: 20 } },
      notes: "Please call upon arrival."
    }); // No headers block!
    log(`Status: ${res.status}`);
    log(`Body: ${JSON.stringify(res.data)}`);
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`); // Note: Express might return HTML here depending on middleware
  }

  // TC-04
  try {
    log('\n[TC-04] Testing: Create valid donation');
    const res = await axios.post(`${BASE_URL}/food/create`, {
      foodType: "Fresh Produce", quantity: 20,
      preparedAt: new Date(Date.now() - 10000).toISOString(),
      expiryTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      pickupLocation: { address: "123 Test Street", coordinates: { lat: 10, lng: 20 } },
      notes: "Please call upon arrival."
    }, { headers: { Authorization: `Bearer ${donorToken}` } });
    log(`Status: ${res.status}`);
    log(`Result: ${res.data.success ? 'Success' : 'Failed'}, Donation ID: ${res.data.donation?._id}`);
  } catch (err) {
    log(`Status: ${err.response?.status}`);
    log(`Body: ${JSON.stringify(err.response?.data || err.message)}`);
  }

  log('\n--- API Tests Finished ---');
  fs.writeFileSync('test_results.log', logOutput, 'utf8');
  process.exit();
}

runTests();
