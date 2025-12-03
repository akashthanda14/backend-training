# Image Upload Testing Guide

## Common Upload Error: "Field name missing"

This error occurs when the field name in your upload request doesn't match what the server expects.

---

## ✅ Correct Field Names

### Single File Upload
- **Endpoint:** `POST /upload/local` or `POST /upload/cloudinary`
- **Field Name:** `image` (singular)

### Multiple Files Upload
- **Endpoint:** `POST /upload/local/multiple` or `POST /upload/cloudinary/multiple`
- **Field Name:** `images` (plural)

---

## Testing Methods

### 1. Using CURL (Command Line)

#### Single File Upload (Local)
```bash
curl -X POST http://localhost:3000/upload/local \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/your/photo.jpg"
```

#### Single File Upload (Cloudinary)
```bash
curl -X POST http://localhost:3000/upload/cloudinary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/your/photo.jpg"
```

#### Multiple Files Upload (Local)
```bash
curl -X POST http://localhost:3000/upload/local/multiple \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "images=@/path/to/photo1.jpg" \
  -F "images=@/path/to/photo2.jpg" \
  -F "images=@/path/to/photo3.jpg"
```

**Important:** 
- Use `-F` for form data
- Field name MUST be `image` for single upload
- Field name MUST be `images` for multiple upload
- Don't forget the `@` before the file path

---

### 2. Using Postman

#### Step-by-Step:

1. **Create New Request**
   - Method: `POST`
   - URL: `http://localhost:3000/upload/local`

2. **Add Authorization Header**
   - Go to "Headers" tab
   - Add: `Authorization: Bearer YOUR_TOKEN_HERE`

3. **Add File**
   - Go to "Body" tab
   - Select "form-data"
   - Click "KEY" dropdown and select "File" type
   - **IMPORTANT:** Enter key name as `image` (for single) or `images` (for multiple)
   - Click "Select Files" and choose your image

4. **Send Request**

**Common Postman Mistakes:**
- ❌ Using "binary" instead of "form-data"
- ❌ Wrong field name (e.g., "file", "upload", "pic")
- ✅ MUST use "form-data" with field name "image"

---

### 3. Using HTML Form

#### Single File Upload
```html
<form action="http://localhost:3000/upload/local" method="POST" enctype="multipart/form-data">
  <!-- IMPORTANT: name MUST be "image" -->
  <input type="file" name="image" accept="image/*" required>
  <button type="submit">Upload Image</button>
</form>
```

#### Multiple Files Upload
```html
<form action="http://localhost:3000/upload/local/multiple" method="POST" enctype="multipart/form-data">
  <!-- IMPORTANT: name MUST be "images" and include "multiple" -->
  <input type="file" name="images" accept="image/*" multiple required>
  <button type="submit">Upload Images</button>
</form>
```

**Critical Points:**
- `enctype="multipart/form-data"` is REQUIRED
- Field `name` attribute MUST match exactly
- Use `accept="image/*"` to allow only images

---

### 4. Using JavaScript/Fetch

#### Single File Upload
```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

// Create FormData
const formData = new FormData();
formData.append('image', file);  // ⚠️ MUST be 'image'

// Upload
fetch('http://localhost:3000/upload/cloudinary', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Upload successful:', data.data.cloudinary.url);
  } else {
    console.error('Upload failed:', data.error);
  }
})
.catch(error => console.error('Error:', error));
```

#### Multiple Files Upload
```javascript
const filesInput = document.getElementById('filesInput');
const files = filesInput.files;

const formData = new FormData();

// Append all files with the SAME field name 'images'
for (let i = 0; i < files.length; i++) {
  formData.append('images', files[i]);  // ⚠️ MUST be 'images'
}

fetch('http://localhost:3000/upload/local/multiple', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log(`${data.data.count} files uploaded successfully`);
})
.catch(error => console.error('Error:', error));
```

**JavaScript Mistakes to Avoid:**
- ❌ `formData.append('file', file)` - Wrong field name
- ❌ `formData.append('upload', file)` - Wrong field name
- ✅ `formData.append('image', file)` - Correct for single
- ✅ `formData.append('images', file)` - Correct for multiple

---

### 5. Using Axios

#### Single File
```javascript
import axios from 'axios';

const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);  // Field name: 'image'

  try {
    const response = await axios.post('http://localhost:3000/upload/cloudinary', formData, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
};
```

#### Multiple Files
```javascript
const handleMultipleUpload = async (files) => {
  const formData = new FormData();
  
  // Append all files with field name 'images'
  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await axios.post('http://localhost:3000/upload/local/multiple', formData, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log(`Uploaded ${response.data.data.count} files`);
  } catch (error) {
    console.error('Upload failed:', error.response?.data);
  }
};
```

---

## Error Messages Guide

### "Field name missing"
**Cause:** Wrong field name in form data  
**Solution:** Use `image` for single upload, `images` for multiple

### "Unexpected field name"
**Cause:** Using wrong field name (e.g., "file", "upload")  
**Solution:** Check the hint in error response for correct field name

### "No file uploaded"
**Cause:** File not selected or form data not sent  
**Solution:** Ensure file is selected and FormData is properly created

### "Only image files are allowed"
**Cause:** Trying to upload non-image file  
**Solution:** Select only JPEG, PNG, GIF, or WebP files

### "File size too large"
**Cause:** File exceeds 5MB  
**Solution:** Compress or resize image before upload

### "Too many files"
**Cause:** Trying to upload more than 5 files  
**Solution:** Select maximum 5 files for multiple upload

### "Unauthorized" / "Token required"
**Cause:** Missing or invalid authentication token  
**Solution:** Login first and include token in Authorization header

---

## Quick Testing Script

Save as `test-upload.sh`:

```bash
#!/bin/bash

# Get user token first
echo "Step 1: Login to get token"
TOKEN=$(curl -s -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@example.com", "password": "temp_password"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

echo "Token: $TOKEN"
echo ""

# Test single file upload
echo "Step 2: Upload single image"
curl -X POST http://localhost:3000/upload/local \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./test-image.jpg" \
  | jq .

echo ""
echo "Done! Check response above for URL"
```

Make executable:
```bash
chmod +x test-upload.sh
./test-upload.sh
```

---

## Validation Checklist

Before uploading, verify:

- ✅ Server is running (`npm run dev`)
- ✅ Database is connected
- ✅ You have a valid auth token
- ✅ Field name is correct (`image` or `images`)
- ✅ File is an image (JPEG, PNG, GIF, WebP)
- ✅ File size is under 5MB
- ✅ Using `multipart/form-data` content type
- ✅ Authorization header is included

---

## Supported File Types

✅ **Allowed:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

❌ **Not Allowed:**
- PDF, Word documents
- Videos
- SVG (for security reasons)
- Any non-image files

---

## File Size Limits

- **Single File:** Maximum 5MB
- **Multiple Files:** Maximum 5MB per file
- **Total Files:** Maximum 5 files per request

---

## Authentication Required

All upload endpoints require authentication:

1. **Login first:**
   ```bash
   POST /auth/signin
   Body: { "email": "user@example.com", "password": "password123" }
   ```

2. **Copy the token from response**

3. **Include in upload request:**
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

---

## Summary

### ✅ DO:
- Use `image` for single file upload
- Use `images` for multiple file upload
- Include Authorization header
- Use multipart/form-data
- Upload only image files under 5MB

### ❌ DON'T:
- Use random field names like "file", "upload", "photo"
- Upload without authentication
- Try to upload non-image files
- Upload files larger than 5MB
- Upload more than 5 files at once

---

## Still Getting Errors?

1. **Check server logs** - Look for detailed error messages
2. **Verify field name** - Must be exactly `image` or `images`
3. **Test with CURL** - Simplest way to debug
4. **Check file type** - Only images allowed
5. **Verify token** - Must be valid and not expired

Need help? Check the error `hint` field in the response for guidance!
