/**
 * API Test Suite for User CRUD Operations and Authentication
 * 
 * This file tests all user and auth endpoints:
 * - Authentication: /auth/signup, /auth/signin, /auth/profile
 * - Users: GET /users, GET /users/:id, POST /users, PUT /users/:id, DELETE /users/:id
 * 
 * Run this file with: node test.js
 * Make sure the server is running: docker-compose up -d
 */

const BASE_URL = 'http://localhost:3000';
let createdUserId = null;
let authToken = null;
let testUserCredentials = {
  username: '',
  email: '',
  password: 'testpassword123'
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Helper function to make HTTP requests
 */
async function request(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`${colors.red}Request failed:${colors.reset}`, error.message);
    throw error;
  }
}

/**
 * Test logging helpers
 */
function logTest(testName) {
  console.log(`\n${colors.blue}${colors.bold}Testing: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.yellow}ℹ ${message}${colors.reset}`);
}

/**
 * Test 1: Health Check
 */
async function testHealthCheck() {
  logTest('Health Check');
  try {
    const { status, data } = await request('/health');
    
    if (status === 200 && data.status === 'ok' && data.db === 'connected') {
      logSuccess('Server and database are running');
      return true;
    } else {
      logError('Health check failed');
      return false;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: User Signup
 */
async function testUserSignup() {
  logTest('POST /auth/signup - User registration');
  try {
    const timestamp = Date.now();
    testUserCredentials.username = `test_user_${timestamp}`;
    testUserCredentials.email = `test${timestamp}@example.com`;

    const { status, data } = await request('/auth/signup', 'POST', testUserCredentials);
    
    if (status === 201 && data.success && data.data.user && data.data.token) {
      authToken = data.data.token;
      logSuccess(`User registered: ${data.data.user.username}`);
      logInfo(`Token received: ${data.data.token.substring(0, 20)}...`);
      return true;
    } else {
      logError('Failed to register user');
      return false;
    }
  } catch (error) {
    logError(`User signup failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: User Signin
 */
async function testUserSignin() {
  logTest('POST /auth/signin - User login');
  try {
    const { status, data } = await request('/auth/signin', 'POST', {
      login: testUserCredentials.email,
      password: testUserCredentials.password
    });
    
    if (status === 200 && data.success && data.data.user && data.data.token) {
      authToken = data.data.token; // Update token
      logSuccess(`User logged in: ${data.data.user.username}`);
      logInfo(`Token updated: ${data.data.token.substring(0, 20)}...`);
      return true;
    } else {
      logError('Failed to login user');
      return false;
    }
  } catch (error) {
    logError(`User signin failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: User Profile
 */
async function testUserProfile() {
  logTest('GET /auth/profile - Get user profile');
  try {
    if (!authToken) {
      logError('No auth token available for profile test');
      return false;
    }

    const { status, data } = await request('/auth/profile', 'GET', null, authToken);
    
    if (status === 200 && data.success && data.data.user) {
      logSuccess(`Profile retrieved: ${data.data.user.username}`);
      logInfo(`User details: ${JSON.stringify(data.data.user)}`);
      return true;
    } else {
      logError('Failed to get user profile');
      return false;
    }
  } catch (error) {
    logError(`Get profile failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Signup with Missing Fields
 */
async function testSignupMissingFields() {
  logTest('POST /auth/signup - Missing required fields (should return 400)');
  try {
    const { status, data } = await request('/auth/signup', 'POST', {
      username: 'onlyusername'
      // missing email and password
    });
    
    if (status === 400 && !data.success) {
      logSuccess('Correctly rejected signup with missing fields');
      return true;
    } else {
      logError('Did not validate required fields correctly');
      return false;
    }
  } catch (error) {
    logError(`Missing fields test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Signup with Invalid Email
 */
async function testSignupInvalidEmail() {
  logTest('POST /auth/signup - Invalid email format (should return 400)');
  try {
    const { status, data } = await request('/auth/signup', 'POST', {
      username: 'testuser123',
      email: 'invalid-email',
      password: 'password123'
    });
    
    if (status === 400 && !data.success) {
      logSuccess('Correctly rejected invalid email format');
      return true;
    } else {
      logError('Did not validate email format correctly');
      return false;
    }
  } catch (error) {
    logError(`Invalid email test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Signup with Weak Password
 */
async function testSignupWeakPassword() {
  logTest('POST /auth/signup - Weak password (should return 400)');
  try {
    const { status, data } = await request('/auth/signup', 'POST', {
      username: 'testuser456',
      email: 'test456@example.com',
      password: '123' // too short
    });
    
    if (status === 400 && !data.success) {
      logSuccess('Correctly rejected weak password');
      return true;
    } else {
      logError('Did not validate password strength correctly');
      return false;
    }
  } catch (error) {
    logError(`Weak password test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 8: Duplicate User Signup
 */
async function testDuplicateSignup() {
  logTest('POST /auth/signup - Duplicate user (should return 409)');
  try {
    const { status, data } = await request('/auth/signup', 'POST', testUserCredentials);
    
    if (status === 409 && !data.success) {
      logSuccess('Correctly rejected duplicate user registration');
      return true;
    } else {
      logError('Did not handle duplicate user correctly');
      return false;
    }
  } catch (error) {
    logError(`Duplicate signup test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 9: Signin with Invalid Credentials
 */
async function testSigninInvalidCredentials() {
  logTest('POST /auth/signin - Invalid credentials (should return 401)');
  try {
    const { status, data } = await request('/auth/signin', 'POST', {
      login: testUserCredentials.email,
      password: 'wrongpassword'
    });
    
    if (status === 401 && !data.success) {
      logSuccess('Correctly rejected invalid credentials');
      return true;
    } else {
      logError('Did not handle invalid credentials correctly');
      return false;
    }
  } catch (error) {
    logError(`Invalid credentials test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 10: Profile without Token
 */
async function testProfileWithoutToken() {
  logTest('GET /auth/profile - No token (should return 401)');
  try {
    const { status, data } = await request('/auth/profile');
    
    if (status === 401 && !data.success) {
      logSuccess('Correctly rejected request without token');
      return true;
    } else {
      logError('Did not require authentication correctly');
      return false;
    }
  } catch (error) {
    logError(`Profile without token test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 11: Get All Users
 */
async function testGetAllUsers() {
  logTest('GET /users - Get all users');
  try {
    const { status, data } = await request('/users');
    
    if (status === 200 && data.success && Array.isArray(data.data)) {
      logSuccess(`Retrieved ${data.count} users`);
      logInfo(`Sample user: ${JSON.stringify(data.data[0] || 'None')}`);
      return true;
    } else {
      logError('Failed to get all users');
      return false;
    }
  } catch (error) {
    logError(`Get all users failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 12: Get User by ID
 */
async function testGetUserById() {
  logTest('GET /users/:id - Get user by ID');
  try {
    const { status, data } = await request('/users/1');
    
    if (status === 200 && data.success && data.data) {
      logSuccess(`Retrieved user: ${data.data.username}`);
      logInfo(`User details: ${JSON.stringify(data.data)}`);
      return true;
    } else {
      logError('Failed to get user by ID');
      return false;
    }
  } catch (error) {
    logError(`Get user by ID failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 13: Get User by Invalid ID
 */
async function testGetUserByInvalidId() {
  logTest('GET /users/:id - Invalid ID (should return 400)');
  try {
    const { status, data } = await request('/users/invalid');
    
    if (status === 400 && !data.success) {
      logSuccess('Correctly rejected invalid ID');
      return true;
    } else {
      logError('Did not handle invalid ID correctly');
      return false;
    }
  } catch (error) {
    logError(`Invalid ID test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 14: Get Non-existent User
 */
async function testGetNonExistentUser() {
  logTest('GET /users/:id - Non-existent user (should return 404)');
  try {
    const { status, data } = await request('/users/99999');
    
    if (status === 404 && !data.success) {
      logSuccess('Correctly returned 404 for non-existent user');
      return true;
    } else {
      logError('Did not handle non-existent user correctly');
      return false;
    }
  } catch (error) {
    logError(`Non-existent user test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 15: Create New User
 */
async function testCreateUser() {
  logTest('POST /users - Create new user');
  try {
    const timestamp = Date.now();
    const newUser = {
      username: `test_user_${timestamp}`,
      email: `test${timestamp}@example.com`
    };

    const { status, data } = await request('/users', 'POST', newUser);
    
    if (status === 201 && data.success && data.data) {
      createdUserId = data.data.id;
      logSuccess(`Created user: ${data.data.username} (ID: ${createdUserId})`);
      logInfo(`User details: ${JSON.stringify(data.data)}`);
      return true;
    } else {
      logError('Failed to create user');
      return false;
    }
  } catch (error) {
    logError(`Create user failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 16: Create User with Missing Fields
 */
async function testCreateUserMissingFields() {
  logTest('POST /users - Missing required fields (should return 400)');
  try {
    const { status, data } = await request('/users', 'POST', { username: 'onlyusername' });
    
    if (status === 400 && !data.success) {
      logSuccess('Correctly rejected user with missing email');
      return true;
    } else {
      logError('Did not validate required fields correctly');
      return false;
    }
  } catch (error) {
    logError(`Missing fields test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 17: Create User with Invalid Email
 */
async function testCreateUserInvalidEmail() {
  logTest('POST /users - Invalid email format (should return 500)');
  try {
    const { status, data } = await request('/users', 'POST', {
      username: 'testuser123',
      email: 'invalid-email'
    });
    
    if ((status === 400 || status === 500) && !data.success) {
      logSuccess('Correctly rejected invalid email format');
      return true;
    } else {
      logError('Did not validate email format correctly');
      return false;
    }
  } catch (error) {
    logError(`Invalid email test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 18: Create Duplicate User
 */
async function testCreateDuplicateUser() {
  logTest('POST /users - Duplicate username/email (should return 409)');
  try {
    const { status, data } = await request('/users', 'POST', {
      username: 'john_doe',
      email: 'john.doe@example.com'
    });
    
    if (status === 409 && !data.success) {
      logSuccess('Correctly rejected duplicate user');
      return true;
    } else {
      logError('Did not handle duplicate user correctly');
      return false;
    }
  } catch (error) {
    logError(`Duplicate user test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 19: Update User
 */
async function testUpdateUser() {
  logTest('PUT /users/:id - Update user');
  
  if (!createdUserId) {
    logError('No user ID available for update test. Create user test may have failed.');
    return false;
  }

  try {
    const updatedData = {
      username: `updated_user_${Date.now()}`,
      email: `updated${Date.now()}@example.com`
    };

    const { status, data } = await request(`/users/${createdUserId}`, 'PUT', updatedData);
    
    if (status === 200 && data.success && data.data) {
      logSuccess(`Updated user: ${data.data.username}`);
      logInfo(`Updated details: ${JSON.stringify(data.data)}`);
      return true;
    } else {
      logError('Failed to update user');
      return false;
    }
  } catch (error) {
    logError(`Update user failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 20: Update User - Partial Update (Only Email)
 */
async function testUpdateUserPartial() {
  logTest('PUT /users/:id - Partial update (email only)');
  
  if (!createdUserId) {
    logError('No user ID available for partial update test');
    return false;
  }

  try {
    const { status, data } = await request(`/users/${createdUserId}`, 'PUT', {
      email: `partial_update_${Date.now()}@example.com`
    });
    
    if (status === 200 && data.success && data.data) {
      logSuccess(`Partially updated user email: ${data.data.email}`);
      return true;
    } else {
      logError('Failed to partially update user');
      return false;
    }
  } catch (error) {
    logError(`Partial update failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 21: Update Non-existent User
 */
async function testUpdateNonExistentUser() {
  logTest('PUT /users/:id - Update non-existent user (should return 404)');
  try {
    const { status, data } = await request('/users/99999', 'PUT', {
      username: 'test',
      email: 'test@example.com'
    });
    
    if (status === 404 && !data.success) {
      logSuccess('Correctly returned 404 for non-existent user update');
      return true;
    } else {
      logError('Did not handle non-existent user update correctly');
      return false;
    }
  } catch (error) {
    logError(`Non-existent user update test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 22: Delete User
 */
async function testDeleteUser() {
  logTest('DELETE /users/:id - Delete user');
  
  if (!createdUserId) {
    logError('No user ID available for delete test');
    return false;
  }

  try {
    const { status, data } = await request(`/users/${createdUserId}`, 'DELETE');
    
    if (status === 200 && data.success) {
      logSuccess(`Deleted user ID: ${createdUserId}`);
      
      // Verify deletion
      const { status: verifyStatus } = await request(`/users/${createdUserId}`);
      if (verifyStatus === 404) {
        logSuccess('Verified user was deleted');
        return true;
      } else {
        logError('User still exists after deletion');
        return false;
      }
    } else {
      logError('Failed to delete user');
      return false;
    }
  } catch (error) {
    logError(`Delete user failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 23: Delete Non-existent User
 */
async function testDeleteNonExistentUser() {
  logTest('DELETE /users/:id - Delete non-existent user (should return 404)');
  try {
    const { status, data } = await request('/users/99999', 'DELETE');
    
    if (status === 404 && !data.success) {
      logSuccess('Correctly returned 404 for non-existent user deletion');
      return true;
    } else {
      logError('Did not handle non-existent user deletion correctly');
      return false;
    }
  } catch (error) {
    logError(`Non-existent user deletion test failed: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║      User API CRUD & Authentication Test Suite            ║
║                                                            ║
║  Testing: http://localhost:3000/users & /auth             ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    
    // Authentication Tests
    { name: 'User Signup', fn: testUserSignup },
    { name: 'User Signin', fn: testUserSignin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Signup - Missing Fields', fn: testSignupMissingFields },
    { name: 'Signup - Invalid Email', fn: testSignupInvalidEmail },
    { name: 'Signup - Weak Password', fn: testSignupWeakPassword },
    { name: 'Duplicate User Signup', fn: testDuplicateSignup },
    { name: 'Signin - Invalid Credentials', fn: testSigninInvalidCredentials },
    { name: 'Profile - No Token', fn: testProfileWithoutToken },
    
    // User CRUD Tests
    { name: 'Get All Users', fn: testGetAllUsers },
    { name: 'Get User by ID', fn: testGetUserById },
    { name: 'Get User by Invalid ID', fn: testGetUserByInvalidId },
    { name: 'Get Non-existent User', fn: testGetNonExistentUser },
    { name: 'Create User', fn: testCreateUser },
    { name: 'Create User - Missing Fields', fn: testCreateUserMissingFields },
    { name: 'Create User - Invalid Email', fn: testCreateUserInvalidEmail },
    { name: 'Create Duplicate User', fn: testCreateDuplicateUser },
    { name: 'Update User', fn: testUpdateUser },
    { name: 'Update User - Partial', fn: testUpdateUserPartial },
    { name: 'Update Non-existent User', fn: testUpdateNonExistentUser },
    { name: 'Delete User', fn: testDeleteUser },
    { name: 'Delete Non-existent User', fn: testDeleteNonExistentUser },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`);
      failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Print summary
  console.log(`\n${colors.bold}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                     Test Summary                           ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${tests.length}\n`);

  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}⚠️  Some tests failed. Please review the output above.${colors.reset}\n`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error(`${colors.red}${colors.bold}Fatal error running tests:${colors.reset}`, error);
  process.exit(1);
});
