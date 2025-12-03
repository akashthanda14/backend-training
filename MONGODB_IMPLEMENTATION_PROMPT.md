# MongoDB Project Implementation Prompt

## Project Requirements

I need to implement two complete features in a Node.js + Express + MongoDB application following MVC + Service architecture:

### 1. Forgot Password Flow with Email OTP Verification
### 2. Image Upload System (Local Storage + Cloudinary)

---

## Part 1: Forgot Password Flow

### Requirements:

**Architecture**: Follow Model → Service → Controller → Route pattern

**Flow**:
1. User requests password reset by providing email
2. System generates 6-digit OTP and sends via email
3. OTP expires after 10 minutes
4. User submits OTP + new password to reset
5. Password is validated and hashed before updating

**Security Features**:
- Rate limiting: 3 requests per 15 minutes on forgot/reset endpoints
- Return success message even if user doesn't exist (prevent email enumeration)
- OTP stored securely in database with expiration timestamp
- Delete old OTPs before generating new ones
- Password validation: minimum 6 characters
- Hash password with bcrypt (salt rounds: 10)

**Technical Implementation**:

#### Database Schema (MongoDB):
```javascript
// OTP Schema
{
  email: String (required, indexed),
  otp: String (required),
  type: String (enum: ['email_verification', 'password_reset'], required),
  expiresAt: Date (required, indexed with TTL),
  createdAt: Date (default: Date.now)
}

// User Schema - ensure it has:
{
  email: String (unique, required),
  password: String (required, hashed),
  // ... other fields
}
```

#### API Endpoints:

**1. POST /auth/forgot-password**
- Request Body: `{ "email": "user@example.com" }`
- Response: `{ "success": true, "message": "If the email exists, a password reset OTP has been sent" }`
- Rate Limit: 3 requests per 15 minutes
- Actions:
  - Check if user exists (but don't reveal in response)
  - If exists: Generate 6-digit OTP, save to DB, send email
  - Always return success message

**2. POST /auth/reset-password**
- Request Body: `{ "email": "user@example.com", "otp": "123456", "newPassword": "newpass123" }`
- Response: `{ "success": true, "message": "Password reset successful" }`
- Rate Limit: 3 requests per 15 minutes
- Actions:
  - Verify OTP is valid and not expired
  - Validate new password (min 6 chars)
  - Hash password with bcrypt
  - Update user password in database
  - Delete used OTP
  - Return success

#### File Structure:

```
src/
  models/
    User.js              # Mongoose schema with updatePassword method
    OTP.js              # Mongoose schema for OTP storage
  services/
    authService.js      # forgotPassword(), resetPassword() business logic
    otpService.js       # sendPasswordResetOTP(), verifyPasswordResetOTP()
    emailService.js     # sendPasswordResetEmail() with HTML template
  controllers/
    authController.js   # forgotPasswordController(), resetPasswordController()
  routes/
    authRoutes.js       # POST /forgot-password, POST /reset-password
  middleware/
    rateLimiter.js      # Rate limiting configuration
```

#### Email Template:
- Professional HTML email with red color scheme for password reset
- Include OTP prominently displayed
- Add expiration notice (10 minutes)
- Include warning about security
- Use NodeMailer with Gmail SMTP or similar

#### Environment Variables Needed:
```
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Part 2: Image Upload System

### Requirements:

**Features**:
1. Local file upload with Multer
2. Cloud upload to Cloudinary
3. Single and multiple image upload support
4. File validation (type, size)
5. Proper error handling with helpful messages

**File Upload Specifications**:
- **Allowed Types**: JPEG, JPG, PNG, GIF, WebP
- **Max File Size**: 5MB per file
- **Max Files**: 5 files per request (for multiple upload)
- **Local Storage**: `/uploads/images/`
- **Cloudinary Folder**: `your-project-name/uploads`
- **Field Names**: 
  - Single upload: `'image'`
  - Multiple upload: `'images'`

**Technical Implementation**:

#### API Endpoints:

**1. POST /upload/local/single**
- Authorization: JWT required
- Content-Type: multipart/form-data
- Field Name: `image` (IMPORTANT: must match exactly)
- Response:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "filename": "image-1234567890.jpg",
    "path": "/uploads/images/image-1234567890.jpg",
    "size": 113060,
    "mimetype": "image/jpeg"
  }
}
```

**2. POST /upload/local/multiple**
- Authorization: JWT required
- Field Name: `images` (array)
- Max Files: 5
- Response: Array of uploaded files

**3. POST /upload/cloudinary/single**
- Authorization: JWT required
- Field Name: `image`
- Upload to Cloudinary after local validation
- Response includes Cloudinary URL and public_id

**4. POST /upload/cloudinary/multiple**
- Authorization: JWT required
- Field Name: `images`
- Max Files: 5
- Batch upload to Cloudinary

#### File Structure:

```
src/
  services/
    cloudinaryService.js    # uploadToCloudinary(), deleteFromCloudinary()
  controllers/
    uploadController.js     # All upload handlers
  routes/
    uploadRoutes.js        # All upload endpoints
  middleware/
    uploadMiddleware.js    # Multer configuration, file filters, error handlers
    authMiddleware.js      # JWT authentication
uploads/
  images/                  # Local upload directory
```

#### Multer Configuration:

```javascript
// Storage configuration
- Destination: './uploads/images/'
- Filename: fieldname-timestamp-randomnumber.extension
- File filter: Check mimetype and extension
- Limits: { fileSize: 5 * 1024 * 1024 } // 5MB

// Error Handling
- Handle file too large
- Handle invalid file type
- Handle field name mismatch (provide helpful hint)
- Handle missing file
```

#### Cloudinary Configuration:

```javascript
// Environment variables
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

// Upload options
- folder: 'your-project-name/uploads'
- resource_type: 'auto'
- Return: secure_url, public_id, format, width, height
```

#### Enhanced Error Messages:

When file upload fails, provide helpful hints:
- If field name is wrong: "Expected field 'image', but received 'photo'. Please use 'image' as the field name."
- If file type is invalid: "File type not allowed. Accepted: JPEG, PNG, GIF, WebP"
- If file too large: "File size exceeds 5MB limit"
- If no file provided: "No file uploaded. Field name: 'image'"

---

## Testing Guide

### Forgot Password Testing:

**Test Case 1: Valid Email**
```bash
# Step 1: Request password reset
POST /auth/forgot-password
Body: { "email": "existing@example.com" }

# Step 2: Check email for OTP (e.g., "123456")

# Step 3: Reset password
POST /auth/reset-password
Body: { 
  "email": "existing@example.com", 
  "otp": "123456", 
  "newPassword": "newpass123" 
}

# Step 4: Login with new password
POST /auth/login
Body: { "email": "existing@example.com", "password": "newpass123" }
```

**Test Case 2: Non-existent Email**
```bash
POST /auth/forgot-password
Body: { "email": "nonexistent@example.com" }
# Should still return success (security feature)
```

**Test Case 3: Expired OTP**
```bash
# Wait 11 minutes after receiving OTP
POST /auth/reset-password
Body: { "email": "user@example.com", "otp": "123456", "newPassword": "newpass" }
# Should return: "Invalid or expired OTP"
```

**Test Case 4: Invalid OTP**
```bash
POST /auth/reset-password
Body: { "email": "user@example.com", "otp": "000000", "newPassword": "newpass" }
# Should return: "Invalid or expired OTP"
```

**Test Case 5: Weak Password**
```bash
POST /auth/reset-password
Body: { "email": "user@example.com", "otp": "123456", "newPassword": "123" }
# Should return: "Password must be at least 6 characters long"
```

### Image Upload Testing:

**CURL Examples:**

```bash
# Single upload (local)
curl -X POST http://localhost:3000/upload/local/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"

# Multiple upload (local)
curl -X POST http://localhost:3000/upload/local/multiple \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"

# Single upload (Cloudinary)
curl -X POST http://localhost:3000/upload/cloudinary/single \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

**Postman Testing:**
1. Set Authorization: Bearer Token
2. Set Body type: form-data
3. Add key: `image` (for single) or `images` (for multiple)
4. Set type: File
5. Select file(s)
6. Send request

**Common Mistakes to Avoid:**
- ❌ Using filename as field name (e.g., "photo.jpg")
- ❌ Using wrong field name (e.g., "file" instead of "image")
- ❌ Forgetting Authorization header
- ❌ Using wrong Content-Type header (should be multipart/form-data)
- ❌ File size exceeding 5MB
- ❌ Using unsupported file types

---

## Dependencies to Install

```bash
npm install express mongoose bcryptjs jsonwebtoken
npm install nodemailer
npm install multer cloudinary
npm install express-rate-limit
npm install dotenv
```

---

## Additional Features to Implement

1. **Logging**: Add Winston logger for debugging
   - Log OTP generation
   - Log email sending status
   - Log file upload events
   - Log password reset attempts

2. **Documentation**: Create comprehensive docs
   - API documentation with examples
   - Flow diagrams for forgot password
   - Upload testing guide with all methods (CURL, Postman, HTML form)

3. **Rate Limiting Configuration**:
```javascript
// Create different limiters
- loginLimiter: 5 attempts per 15 minutes
- signupLimiter: 3 attempts per hour
- otpLimiter: 3 attempts per 15 minutes
```

4. **MongoDB Indexes**:
```javascript
// OTP collection
- Index on email (for faster lookups)
- TTL index on expiresAt (auto-delete expired OTPs)

// User collection
- Unique index on email
```

---

## Expected Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── models/
│   │   ├── User.js
│   │   └── OTP.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── otpService.js
│   │   ├── emailService.js
│   │   └── cloudinaryService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── uploadRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── rateLimiter.js
│   └── server.js
├── uploads/
│   └── images/
├── .env
├── .gitignore
└── package.json
```

---

## Success Criteria

✅ User can request password reset via email
✅ 6-digit OTP is generated and sent to email
✅ OTP expires after 10 minutes
✅ User can reset password with valid OTP
✅ Rate limiting prevents abuse
✅ Security: No email enumeration possible
✅ Single image upload works (local and Cloudinary)
✅ Multiple image upload works (max 5 files)
✅ File validation works (type and size)
✅ Proper error messages with helpful hints
✅ JWT authentication on upload endpoints
✅ Comprehensive error handling
✅ Complete documentation and testing guide

---

## Implementation Order

1. **Phase 1**: Setup MongoDB, User model, basic auth
2. **Phase 2**: Implement OTP model and email service
3. **Phase 3**: Build forgot password flow (service → controller → routes)
4. **Phase 4**: Add rate limiting to auth endpoints
5. **Phase 5**: Setup Multer for local file uploads
6. **Phase 6**: Implement Cloudinary integration
7. **Phase 7**: Add file validation and error handling
8. **Phase 8**: Create comprehensive testing documentation
9. **Phase 9**: Add logging with Winston
10. **Phase 10**: Final testing and documentation

---

## Notes

- Use ES6 modules (import/export)
- Follow async/await pattern consistently
- Add try-catch blocks in all controllers
- Use MongoDB transactions where necessary
- Keep sensitive data in .env file
- Add .env to .gitignore
- Use meaningful variable names
- Add comments for complex logic
- Follow consistent code formatting
- Test all edge cases thoroughly

