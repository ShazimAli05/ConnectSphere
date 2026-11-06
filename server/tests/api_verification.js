const http = require('http');
const ioClient = require('socket.io-client');
const { app, server } = require('../server');

async function runTests() {
  console.log('=== STARTING CONNECTSPHERE AUTOMATED VERIFICATION SUITE ===\n');

  // Let server start
  await new Promise((r) => setTimeout(r, 1500));
  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}`;

  const request = async (endpoint, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health check test
    console.log('[TEST 1] Checking /api/health endpoint...');
    const health = await request('/api/health');
    if (health.status === 200 && health.body.status === 'online') {
      console.log('✓ PASS: Server is healthy & responsive.');
    } else {
      throw new Error(`Health check failed with status ${health.status}`);
    }

    // 2. Authentication: Login with seeded admin
    console.log('\n[TEST 2] Testing Admin Login...');
    const adminLogin = await request('/api/auth/login', 'POST', {
      loginIdentifier: 'admin@connectsphere.com',
      password: 'AdminPass123!',
    });

    if (adminLogin.status === 200 && adminLogin.body.token) {
      console.log(`✓ PASS: Admin logged in successfully as ${adminLogin.body.user.name} (${adminLogin.body.user.role}).`);
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }
    const adminToken = adminLogin.body.token;

    // 3. Authentication: Login with seeded user Alex
    console.log('\n[TEST 3] Testing User Login (Alex Morgan)...');
    const alexLogin = await request('/api/auth/login', 'POST', {
      loginIdentifier: 'alex@connectsphere.com',
      password: 'UserPass123!',
    });

    if (alexLogin.status === 200 && alexLogin.body.token) {
      console.log(`✓ PASS: Alex logged in successfully.`);
    } else {
      throw new Error(`Alex login failed: ${JSON.stringify(alexLogin.body)}`);
    }
    const alexToken = alexLogin.body.token;

    // 4. Invalid Login handling
    console.log('\n[TEST 4] Testing Invalid Credentials Handling...');
    const invalidLogin = await request('/api/auth/login', 'POST', {
      loginIdentifier: 'alex@connectsphere.com',
      password: 'WrongPassword123!',
    });

    if (invalidLogin.status === 401) {
      console.log('✓ PASS: Rejected invalid credentials with 401 Unauthorized.');
    } else {
      throw new Error(`Expected 401, got ${invalidLogin.status}`);
    }

    // 5. Protected Route Access (/api/auth/me)
    console.log('\n[TEST 5] Testing Protected Route /api/auth/me with Bearer token...');
    const meRes = await request('/api/auth/me', 'GET', null, alexToken);
    if (meRes.status === 200 && meRes.body.user.email === 'alex@connectsphere.com') {
      console.log(`✓ PASS: Verified token session for user ${meRes.body.user.name}.`);
    } else {
      throw new Error(`Session verification failed: ${JSON.stringify(meRes.body)}`);
    }

    // 6. User Conversations Retrieval
    console.log('\n[TEST 6] Testing /api/conversations retrieval...');
    const convRes = await request('/api/conversations', 'GET', null, alexToken);
    if (convRes.status === 200 && Array.isArray(convRes.body.conversations)) {
      console.log(`✓ PASS: Retrieved ${convRes.body.conversations.length} active conversations for Alex.`);
    } else {
      throw new Error(`Conversation fetch failed: ${JSON.stringify(convRes.body)}`);
    }

    const testConversation = convRes.body.conversations[0];
    if (!testConversation) {
      throw new Error('No test conversation found from seed.');
    }

    // 7. Message Retrieval for Conversation
    console.log(`\n[TEST 7] Testing message history for conversation: ${testConversation._id}...`);
    const msgRes = await request(`/api/messages/${testConversation._id}`, 'GET', null, alexToken);
    if (msgRes.status === 200 && Array.isArray(msgRes.body.messages)) {
      console.log(`✓ PASS: Retrieved ${msgRes.body.messages.length} messages in conversation.`);
    } else {
      throw new Error(`Messages fetch failed: ${JSON.stringify(msgRes.body)}`);
    }

    // 8. Send New Message via REST API
    console.log('\n[TEST 8] Sending new message into conversation...');
    const sendRes = await request(
      '/api/messages',
      'POST',
      {
        conversationId: testConversation._id,
        content: 'Automated test suite ping: verifying real-time integrity.',
        messageType: 'text',
      },
      alexToken
    );

    if (sendRes.status === 201 && sendRes.body.message) {
      console.log(`✓ PASS: Message persisted successfully with ID ${sendRes.body.message._id}.`);
    } else {
      throw new Error(`Message sending failed: ${JSON.stringify(sendRes.body)}`);
    }
    const createdMessageId = sendRes.body.message._id;

    // 9. Add Emoji Reaction to Message
    console.log('\n[TEST 9] Toggling emoji reaction on message...');
    const reactRes = await request(
      `/api/messages/${createdMessageId}/reactions`,
      'POST',
      { emoji: '🚀' },
      alexToken
    );

    if (reactRes.status === 200 && reactRes.body.message.reactions.length > 0) {
      console.log('✓ PASS: Emoji reaction registered.');
    } else {
      throw new Error(`Reaction failed: ${JSON.stringify(reactRes.body)}`);
    }

    // 10. Admin Dashboard Metrics (Authorized)
    console.log('\n[TEST 10] Testing Admin Metrics (/api/admin/dashboard)...');
    const adminDash = await request('/api/admin/dashboard', 'GET', null, adminToken);
    if (adminDash.status === 200 && adminDash.body.stats) {
      console.log(`✓ PASS: Admin KPIs verified (Total Users: ${adminDash.body.stats.totalUsers}, Total Messages: ${adminDash.body.stats.totalMessages}).`);
    } else {
      throw new Error(`Admin stats failed: ${JSON.stringify(adminDash.body)}`);
    }

    // 11. Role Authorization Security (Alex trying to access Admin dashboard)
    console.log('\n[TEST 11] Testing RBAC Security: Non-admin trying to access Admin Console...');
    const nonAdminAttempt = await request('/api/admin/dashboard', 'GET', null, alexToken);
    if (nonAdminAttempt.status === 403) {
      console.log('✓ PASS: Non-admin correctly blocked with 403 Forbidden.');
    } else {
      throw new Error(`Expected 403, got ${nonAdminAttempt.status}`);
    }

    // 12. Socket.IO Real-Time Connection
    console.log('\n[TEST 12] Testing Socket.IO Authentication & Real-Time Presence...');
    await new Promise((resolve, reject) => {
      const socket = ioClient(baseUrl, {
        auth: { token: alexToken },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log(`✓ PASS: Socket.IO connected with socket ID: ${socket.id}`);
      });

      socket.on('connected', (data) => {
        console.log(`✓ PASS: Socket authenticated successfully for userId: ${data.userId}`);
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (err) => {
        socket.disconnect();
        reject(new Error(`Socket connection error: ${err.message}`));
      });
    });

    console.log('\n======================================================');
    console.log('ALL 12 TEST SUITES PASSED WITH 100% SUCCESS RATE!');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    process.exit(1);
  }
}

runTests();
