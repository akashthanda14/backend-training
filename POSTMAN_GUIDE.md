# Postman Testing Guide - User API

This guide will help you test all the API endpoints using Postman.

## 📋 Prerequisites

1. **Server Running**: Make sure your server is running
   ```bash
   docker-compose up -d
   npm run dev
   ```

2. **Base URL**: `http://localhost:3000`

---

## 🧪 API Endpoints

### 1. Health Check

**Purpose**: Verify that the server and database are running

- **Method**: `GET`
- **URL**: `http://localhost:3000/health`
- **Headers**: None required
- **Body**: None

**Expected Response** (200 OK):
```json
{
  "status": "ok",
  "db": "connected"
}
```

---

### 2. Get All Users

**Purpose**: Retrieve a list of all users

- **Method**: `GET`
- **URL**: `http://localhost:3000/users`
- **Headers**: None required
- **Body**: None

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john.doe@example.com",
      "created_at": "2025-11-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "username": "jane_smith",
      "email": "jane.smith@example.com",
      "created_at": "2025-11-02T11:30:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 3. Get User by ID

**Purpose**: Retrieve a specific user by their ID

- **Method**: `GET`
- **URL**: `http://localhost:3000/users/1`
- **Headers**: None required
- **Body**: None

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john.doe@example.com",
    "created_at": "2025-11-01T10:00:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "User not found"
}
```

**Error Response** (400 Bad Request - Invalid ID):
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

---

### 4. Create New User

**Purpose**: Create a new user

- **Method**: `POST`
- **URL**: `http://localhost:3000/users`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "new_user",
    "email": "newuser@example.com"
  }
  ```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 6,
    "username": "new_user",
    "email": "newuser@example.com",
    "created_at": "2025-11-17T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

**Error Response** (400 Bad Request - Missing Fields):
```json
{
  "success": false,
  "error": "Username and email are required"
}
```

**Error Response** (409 Conflict - Duplicate):
```json
{
  "success": false,
  "error": "Username or email already exists"
}
```

**Error Response** (500 Server Error - Invalid Email):
```json
{
  "success": false,
  "error": "Failed to create user",
  "message": "Invalid email format"
}
```

---

### 5. Update User (Full Update)

**Purpose**: Update a user's username and email

- **Method**: `PUT`
- **URL**: `http://localhost:3000/users/6`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "updated_user",
    "email": "updated@example.com"
  }
  ```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 6,
    "username": "updated_user",
    "email": "updated@example.com",
    "created_at": "2025-11-17T10:30:00.000Z"
  },
  "message": "User updated successfully"
}
```

---

### 6. Update User (Partial Update)

**Purpose**: Update only the email (or only the username)

- **Method**: `PUT`
- **URL**: `http://localhost:3000/users/6`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON - email only):
  ```json
  {
    "email": "newemail@example.com"
  }
  ```

  **OR** (username only):
  ```json
  {
    "username": "newusername"
  }
  ```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 6,
    "username": "updated_user",
    "email": "newemail@example.com",
    "created_at": "2025-11-17T10:30:00.000Z"
  },
  "message": "User updated successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "User not found"
}
```

**Error Response** (400 Bad Request - No Fields):
```json
{
  "success": false,
  "error": "At least one field (username or email) is required for update"
}
```

---

### 7. Delete User

**Purpose**: Delete a user by ID

- **Method**: `DELETE`
- **URL**: `http://localhost:3000/users/6`
- **Headers**: None required
- **Body**: None

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "User not found"
}
```

**Error Response** (400 Bad Request - Invalid ID):
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

---

## 📝 Postman Collection Setup

### Option 1: Manual Setup

1. Open Postman
2. Create a new Collection called "User API"
3. Add each endpoint as described above
4. Save the collection for reuse

### Option 2: Import Swagger/OpenAPI

1. In Postman, click **Import**
2. Select the `swagger.yaml` file from this project
3. Postman will automatically create all endpoints with documentation

---

## 🔄 Testing Workflow

Follow this sequence to test all CRUD operations:

### Step 1: Health Check
```
GET http://localhost:3000/health
```

### Step 2: Get All Users (Initial)
```
GET http://localhost:3000/users
```
*Note the existing users (should be 5 sample users)*

### Step 3: Get Single User
```
GET http://localhost:3000/users/1
```

### Step 4: Create New User
```
POST http://localhost:3000/users
Body:
{
  "username": "test_user",
  "email": "test@example.com"
}
```
*Save the returned user ID for next steps*

### Step 5: Get All Users (After Create)
```
GET http://localhost:3000/users
```
*Verify the new user appears in the list*

### Step 6: Get New User by ID
```
GET http://localhost:3000/users/6
```
*Use the ID from step 4*

### Step 7: Update User (Full)
```
PUT http://localhost:3000/users/6
Body:
{
  "username": "updated_test_user",
  "email": "updated@example.com"
}
```

### Step 8: Update User (Partial)
```
PUT http://localhost:3000/users/6
Body:
{
  "email": "final@example.com"
}
```

### Step 9: Get Updated User
```
GET http://localhost:3000/users/6
```
*Verify the changes*

### Step 10: Delete User
```
DELETE http://localhost:3000/users/6
```

### Step 11: Verify Deletion
```
GET http://localhost:3000/users/6
```
*Should return 404*

### Step 12: Get All Users (Final)
```
GET http://localhost:3000/users
```
*Verify the user is gone*

---

## ⚠️ Error Testing

### Test Invalid User ID
```
GET http://localhost:3000/users/abc
```
*Expected: 400 Bad Request*

### Test Non-existent User
```
GET http://localhost:3000/users/99999
```
*Expected: 404 Not Found*

### Test Missing Required Fields
```
POST http://localhost:3000/users
Body:
{
  "username": "onlyusername"
}
```
*Expected: 400 Bad Request*

### Test Invalid Email Format
```
POST http://localhost:3000/users
Body:
{
  "username": "test",
  "email": "invalid-email"
}
```
*Expected: 500 Server Error with validation message*

### Test Duplicate Username/Email
```
POST http://localhost:3000/users
Body:
{
  "username": "john_doe",
  "email": "john.doe@example.com"
}
```
*Expected: 409 Conflict*

### Test Update with No Fields
```
PUT http://localhost:3000/users/1
Body:
{}
```
*Expected: 400 Bad Request*

---

## 🎯 Quick Test Checklist

- [ ] Server health check passes
- [ ] Can retrieve all users
- [ ] Can retrieve single user by valid ID
- [ ] Invalid ID returns 400
- [ ] Non-existent user returns 404
- [ ] Can create user with valid data
- [ ] Cannot create user with missing fields
- [ ] Cannot create user with invalid email
- [ ] Cannot create duplicate user (409)
- [ ] Can update user (full update)
- [ ] Can update user (partial update)
- [ ] Cannot update non-existent user (404)
- [ ] Can delete user
- [ ] Cannot delete non-existent user (404)
- [ ] Deleted user is truly removed

---

## 🚀 Automated Testing

Instead of manual Postman testing, you can run the automated test suite:

```bash
node test.js
```

This will run all 14 tests automatically and show you a summary of passed/failed tests.

---

## 📚 Additional Resources

- **Swagger Documentation**: See `swagger.yaml` for complete API specification
- **Source Code**: Check the following files:
  - Routes: `src/routes/userRoutes.js`
  - Controller: `src/controller/userController.js`
  - Service: `src/service/userService.js`
  - Model: `src/model/userModel.js`

---

## 💡 Tips

1. **Environment Variables**: In Postman, create an environment with:
   - `base_url`: `http://localhost:3000`
   - `user_id`: (save from create response)

2. **Use Variables**: In requests, use `{{base_url}}/users` and `{{user_id}}`

3. **Save Responses**: Use Postman's "Save Response" feature to document your testing

4. **Collection Runner**: Use Postman's Collection Runner to run all requests in sequence

5. **Tests Tab**: Add assertions in Postman's Tests tab:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has success field", function () {
       pm.expect(pm.response.json()).to.have.property('success');
   });
   ```

---

## 🐛 Troubleshooting

**Problem**: Cannot connect to server
- **Solution**: Make sure Docker is running: `docker-compose up -d`
- **Solution**: Start the server: `node src/server.js`

**Problem**: Database errors
- **Solution**: Reset the database:
  ```bash
  docker-compose down -v
  docker-compose up -d
  ```

**Problem**: Port already in use
- **Solution**: Kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

---

Happy Testing! 🎉
