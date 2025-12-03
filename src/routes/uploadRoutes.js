/**
 * Upload Routes
 * 
 * This file defines all routes for image upload functionality:
 * - Local storage uploads (using Multer)
 * - Cloudinary uploads (cloud storage)
 * - File management (delete, stats)
 * - Test endpoints
 * 
 * All upload routes are protected and require user authentication.
 * Admins have access to all functionality, users can only upload their own files.
 */

import express from 'express';
import { 
    uploadLocalSingle,
    uploadLocalMultiple,
    uploadCloudinarySingle,
    uploadCloudinaryMultiple,
    deleteLocalImage,
    deleteCloudinaryImage,
    testCloudinary,
    getUploadStats
} from '../controller/uploadController.js';
import { 
    upload, 
    uploadMultiple, 
    handleUploadError 
} from '../middleware/uploadMiddleware.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ============================================
// LOCAL STORAGE ROUTES (Multer)
// ============================================

/**
 * Upload Single Image to Local Storage
 * POST /upload/local
 * 
 * Field name: image
 * Max size: 5MB
 * Allowed types: JPEG, JPG, PNG, GIF, WebP
 * Authentication: Required (User or Admin)
 */
router.post('/local', 
    authenticateToken,                    // Require user authentication
    upload.single('image'),               // Multer middleware for single file
    handleUploadError,                    // Handle upload errors
    uploadLocalSingle                     // Controller function
);

/**
 * Upload Multiple Images to Local Storage
 * POST /upload/local/multiple
 * 
 * Field name: images
 * Max files: 5
 * Max size per file: 5MB
 * Authentication: Required (User or Admin)
 */
router.post('/local/multiple',
    authenticateToken,                    // Require user authentication
    uploadMultiple.array('images', 5),    // Multer middleware for multiple files
    handleUploadError,                    // Handle upload errors
    uploadLocalMultiple                   // Controller function
);

/**
 * Delete Image from Local Storage
 * DELETE /upload/local/:filename
 * 
 * Parameters:
 *   - filename: Name of the file to delete
 * Authentication: Required (User or Admin)
 */
router.delete('/local/:filename',
    authenticateToken,                    // Require user authentication
    deleteLocalImage                      // Controller function
);

// ============================================
// CLOUDINARY ROUTES (Cloud Storage)
// ============================================

/**
 * Upload Single Image to Cloudinary
 * POST /upload/cloudinary
 * 
 * Field name: image
 * Max size: 5MB
 * Allowed types: JPEG, JPG, PNG, GIF, WebP
 * Authentication: Required (User or Admin)
 * 
 * Features:
 * - Automatic optimization
 * - Secure URLs
 * - Transformation support
 */
router.post('/cloudinary',
    authenticateToken,                    // Require user authentication
    upload.single('image'),               // Multer middleware (temporary local storage)
    handleUploadError,                    // Handle upload errors
    uploadCloudinarySingle                // Controller function
);

/**
 * Upload Multiple Images to Cloudinary
 * POST /upload/cloudinary/multiple
 * 
 * Field name: images
 * Max files: 5
 * Max size per file: 5MB
 * Authentication: Required (User or Admin)
 */
router.post('/cloudinary/multiple',
    authenticateToken,                    // Require user authentication
    uploadMultiple.array('images', 5),    // Multer middleware for multiple files
    handleUploadError,                    // Handle upload errors
    uploadCloudinaryMultiple              // Controller function
);

/**
 * Delete Image from Cloudinary
 * DELETE /upload/cloudinary/:publicId
 * 
 * Parameters:
 *   - publicId: Cloudinary public_id of the image (URL encoded)
 * Authentication: Required (User or Admin)
 * 
 * Example public_id: aschik-project/uploads/1234567890-image
 * URL: /upload/cloudinary/aschik-project%2Fuploads%2F1234567890-image
 */
router.delete('/cloudinary/:publicId',
    authenticateToken,                    // Require user authentication
    deleteCloudinaryImage                 // Controller function
);

/**
 * Test Cloudinary Connection
 * GET /upload/cloudinary/test
 * 
 * Tests if Cloudinary is properly configured and accessible.
 * Authentication: Required (User or Admin)
 */
router.get('/cloudinary/test',
    authenticateToken,                    // Require user authentication
    testCloudinary                        // Controller function
);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * Get Upload Statistics
 * GET /upload/stats
 * 
 * Returns statistics about uploads:
 * - Local storage usage
 * - Cloudinary configuration status
 * - File limits and settings
 * 
 * Authentication: Admin only
 */
router.get('/stats',
    authenticateAdmin,                    // Require admin authentication
    getUploadStats                        // Controller function
);

// ============================================
// PUBLIC ROUTES (File Serving)
// ============================================

/**
 * Note: Static file serving for local uploads should be configured 
 * in the main server.js file using express.static middleware:
 * 
 * app.use('/uploads', express.static('uploads'));
 * 
 * This allows accessing uploaded files via:
 * http://localhost:3000/uploads/images/filename.jpg
 */

export default router;

/**
 * ROUTE SUMMARY:
 * 
 * Protected Routes (Require Authentication):
 * ✅ POST   /upload/local                    - Upload single image locally
 * ✅ POST   /upload/local/multiple           - Upload multiple images locally  
 * ✅ POST   /upload/cloudinary               - Upload single image to Cloudinary
 * ✅ POST   /upload/cloudinary/multiple      - Upload multiple images to Cloudinary
 * ✅ DELETE /upload/local/:filename          - Delete local image
 * ✅ DELETE /upload/cloudinary/:publicId     - Delete Cloudinary image
 * ✅ GET    /upload/cloudinary/test          - Test Cloudinary connection
 * 
 * Admin Only Routes:
 * ✅ GET    /upload/stats                    - Get upload statistics
 * 
 * Frontend Usage Examples:
 * 
 * 1. Single File Upload (HTML Form):
 * <form action="/upload/local" method="POST" enctype="multipart/form-data">
 *   <input type="file" name="image" accept="image/*" required>
 *   <button type="submit">Upload</button>
 * </form>
 * 
 * 2. Multiple Files Upload (HTML Form):
 * <form action="/upload/local/multiple" method="POST" enctype="multipart/form-data">
 *   <input type="file" name="images" accept="image/*" multiple required>
 *   <button type="submit">Upload</button>
 * </form>
 * 
 * 3. JavaScript/AJAX Upload:
 * const formData = new FormData();
 * formData.append('image', fileInput.files[0]);
 * 
 * fetch('/upload/cloudinary', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': 'Bearer ' + userToken
 *   },
 *   body: formData
 * });
 * 
 * 4. CURL Example:
 * curl -X POST \
 *   -H "Authorization: Bearer <token>" \
 *   -F "image=@/path/to/image.jpg" \
 *   http://localhost:3000/upload/cloudinary
 */
