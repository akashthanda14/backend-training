/**
 * File Upload Middleware using Multer
 * 
 * This middleware handles file uploads with the following features:
 * - Local storage for uploaded files
 * - File type validation (images only)
 * - File size limits
 * - Unique filename generation
 * - Error handling for invalid files
 * 
 * Supported formats: JPG, JPEG, PNG, GIF, WebP
 * Max file size: 5MB
 * Storage location: /uploads/images/
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current file directory (ES modules compatibility)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer Storage Configuration
 * 
 * Defines where and how files are stored locally
 */
const storage = multer.diskStorage({
    // Destination folder for uploaded files
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Store in uploads/images/ directory
    },
    
    // Generate unique filename to prevent conflicts
    filename: function (req, file, cb) {
        // Create unique filename: timestamp + random number + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

/**
 * File Filter Function
 * 
 * Validates file type - only allows image files
 */
const fileFilter = function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        // Allowed image types
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Only JPEG, JPG, PNG, GIF, and WebP image files are allowed'), false);
        }
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

/**
 * Main Multer Upload Configuration
 * 
 * Combines storage, file filter, and size limits
 */
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 1 // Maximum 1 file per request
    }
});

/**
 * Multiple Files Upload Configuration
 * 
 * For uploading multiple images at once (max 5 files)
 */
export const uploadMultiple = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 5 // Maximum 5 files per request
    }
});

/**
 * Error Handling Middleware
 * 
 * Catches and formats multer errors with user-friendly messages
 */
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        // Handle specific multer errors
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size allowed is 5MB',
                code: 'FILE_TOO_LARGE',
                hint: 'Please select a smaller image file'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum 5 files allowed',
                code: 'TOO_MANY_FILES',
                hint: 'Select up to 5 images only'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected field name. Use "image" for single upload or "images" for multiple uploads',
                code: 'INVALID_FIELD_NAME',
                hint: 'For single file: <input type="file" name="image"> | For multiple: <input type="file" name="images" multiple>',
                receivedField: error.field
            });
        }
        
        // Generic multer error
        return res.status(400).json({
            success: false,
            error: 'File upload error: ' + error.message,
            code: 'UPLOAD_ERROR',
            hint: 'Check that you are using the correct field name ("image" or "images") and file format'
        });
    }
    
    // Handle file filter errors (invalid file types)
    if (error && error.message && error.message.includes('Only')) {
        return res.status(400).json({
            success: false,
            error: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }
    
    // Pass other errors to the global error handler
    next(error);
};

/**
 * Utility Functions
 */

/**
 * Get file URL for serving uploaded images
 * @param {string} filename - The stored filename
 * @returns {string} - Full URL to access the file
 */
export const getFileUrl = (filename) => {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${baseUrl}/uploads/images/${filename}`;
};

/**
 * Delete uploaded file
 * @param {string} filename - The filename to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (filename) => {
    try {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Single file upload:
 *    router.post('/upload', upload.single('image'), uploadController);
 * 
 * 2. Multiple files upload:
 *    router.post('/upload-multiple', uploadMultiple.array('images', 5), uploadController);
 * 
 * 3. With error handling:
 *    router.post('/upload', upload.single('image'), handleUploadError, uploadController);
 * 
 * 4. Field names to use in frontend:
 *    - Single file: name="image"
 *    - Multiple files: name="images"
 */
