# Admin Security & User Management Protection

## Overview
All user management APIs are protected and can **ONLY** be accessed by the admin. Regular users cannot access these endpoints even with valid JWT tokens.

---

## Protected Endpoints (Admin Only)

All endpoints under `/users` route require admin authentication:

### 1. **GET /users**
- **Description**: Get list of all users
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

### 2. **GET /users/:id**
- **Description**: Get specific user details by ID
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

### 3. **POST /users**
- **Description**: Create a new user manually
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**: `{ username, email, password, role }`

### 4. **PUT /users/:id**
- **Description**: Update user information
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**: `{ username, email, password, role, email_verified }`

### 5. **DELETE /users/:id**
- **Description**: Delete a user permanently
- **Access**: Admin only
- **Headers**: `Authorization: Bearer <admin_token>`

---

## How Admin Authentication Works

### 1. **Admin Login**
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "AdminPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

### 2. **Use Admin Token for Protected Routes**
```http
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Implementation

### Authentication Middleware (`authenticateAdmin`)

**Location**: `src/middleware/adminMiddleware.js`

**Flow**:
1. ✅ Extract token from `Authorization: Bearer <token>` header
2. ✅ Verify token signature and expiration
3. ✅ Confirm token belongs to admin (from .env credentials)
4. ✅ Attach admin info to `req.admin` and `req.adminToken`
5. ✅ Allow request to proceed to route handler

**Failure Scenarios**:
- ❌ No Authorization header → 401 Unauthorized
- ❌ Invalid token format → 401 Unauthorized
- ❌ Expired token → 401 Unauthorized
- ❌ Regular user token → 401 Unauthorized (not admin)
- ❌ Server error → 500 Internal Server Error

---

## Admin Credentials

Admin credentials are stored in the `.env` file:

```env
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=AdminPassword123!
```

**Important Notes**:
- Admin credentials cannot be changed via API
- Changes to `.env` require server restart
- Only ONE admin account exists (defined in .env)
- Admin is NOT stored in the database
- Admin authentication is separate from user authentication

---

## Difference Between Admin & User Authentication

| Feature | Admin Authentication | User Authentication |
|---------|---------------------|---------------------|
| **Storage** | Environment variables (.env) | Database (users table) |
| **Login Endpoint** | `/admin/login` | `/auth/signin` |
| **Middleware** | `authenticateAdmin` | `authenticateToken` |
| **Access** | User management APIs | Own profile only |
| **Token Type** | Admin JWT | User JWT |
| **Multiple Accounts** | No (single admin) | Yes (unlimited users) |

---

## Testing Admin Protection

### Test 1: Try accessing /users without admin token
```http
GET /users
# Expected: 401 Unauthorized
```

### Test 2: Try accessing /users with regular user token
```http
GET /users
Authorization: Bearer <user_token>
# Expected: 401 Unauthorized (not an admin token)
```

### Test 3: Try accessing /users with admin token
```http
GET /users
Authorization: Bearer <admin_token>
# Expected: 200 OK with list of users
```

### Test 4: Verify regular users cannot create/delete users
```http
DELETE /users/1
Authorization: Bearer <user_token>
# Expected: 401 Unauthorized
```

---

## Additional Middleware Functions

### 1. **optionalAdminAuth**
- Tries to authenticate admin but continues even if it fails
- Useful for routes that show different data for admins vs users
- Never blocks the request

**Usage**:
```javascript
router.get('/dashboard', optionalAdminAuth, getDashboard);
```

### 2. **requireAdminPermissions**
- Fine-grained permission control
- Must be used AFTER `authenticateAdmin`
- Checks if admin has specific permissions

**Usage**:
```javascript
router.delete('/users/:id', 
  authenticateAdmin, 
  requireAdminPermissions(['DELETE_USERS']), 
  deleteUser
);
```

---

## Security Best Practices

### ✅ Currently Implemented:
1. All user management routes protected by `authenticateAdmin`
2. Admin credentials stored securely in .env (not in database)
3. JWT tokens with expiration
4. Separate admin and user authentication systems
5. Rate limiting on admin login (5 attempts per 15 minutes)
6. Admin token verification on every request

### 🔒 Additional Security Recommendations:
1. Use strong admin password (minimum 12 characters)
2. Rotate JWT secret regularly
3. Set appropriate JWT expiration time
4. Use HTTPS in production
5. Keep .env file out of version control (.gitignore)
6. Monitor admin login attempts
7. Implement IP whitelisting for admin access (optional)
8. Enable two-factor authentication for admin (future enhancement)

---

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "error": "Admin authorization header is required"
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "error": "Invalid or expired admin token"
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "error": "Insufficient admin permissions",
  "required": ["DELETE_USERS"],
  "current": ["VIEW_USERS"]
}
```

---

## Summary

✅ **All user management APIs are admin-only**
✅ **Regular users CANNOT access /users/* endpoints**
✅ **Admin authentication is separate from user authentication**
✅ **Admin credentials stored in .env, not database**
✅ **Rate limiting prevents brute force attacks on admin login**
✅ **Comprehensive error messages for debugging**
✅ **Middleware properly implemented and documented**

The system is secure and properly protected! 🔒
