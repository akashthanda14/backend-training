/**
 * Upload Controller
 * 
 * Handles file upload requests for both local storage (Multer) and cloud storage (Cloudinary)
 * Provides endpoints for single file upload, multiple files upload, and file management
 */

import { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary, testCloudinaryConnection } from '../service/cloudinaryService.js';
import { getFileUrl, deleteFile } from '../middleware/uploadMiddleware.js';
import path from 'path';
import fs from 'fs';

/**
 * Upload Single Image to Local Storage (Multer)
 * 
 * Endpoint: POST /upload/local
 * Content-Type: multipart/form-data
 * Field name: image
 * 
 * @param {Object} req - Request object (with req.file from Multer)
 * @param {Object} res - Response object
 */
export const uploadLocalSingle = async (req, res) => {
    try {
        // Debug logging
        console.log('📥 Upload request received');
        console.log('Headers:', req.headers);
        console.log('Body keys:', Object.keys(req.body));
        console.log('Files:', req.file);
        console.log('All files:', req.files);
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select an image file.',
                code: 'NO_FILE_UPLOADED',
                debug: {
                    receivedBody: Object.keys(req.body),
                    receivedFiles: req.files ? 'Multiple files detected' : 'No files detected',
                    hint: 'Make sure the field name is "image" (not the filename). In Postman: KEY should be "image", VALUE should be your file.'
                }
            });
        }
        
        // File details from Multer
        const file = req.file;
        
        // Generate file URL for accessing the uploaded file
        const fileUrl = getFileUrl(file.filename);
        
        // Response with file information
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully to local storage',
            data: {
                filename: file.filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                url: fileUrl,
                path: file.path,
                uploadedAt: new Date().toISOString(),
                storage: 'local'
            }
        });
        
    } catch (error) {
        console.error('Local upload error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during file upload',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Upload Multiple Images to Local Storage (Multer)
 * 
 * Endpoint: POST /upload/local/multiple
 * Content-Type: multipart/form-data
 * Field name: images
 * Max files: 5
 */
export const uploadLocalMultiple = async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded. Please select image files.',
                code: 'NO_FILES_UPLOADED'
            });
        }
        
        // Process all uploaded files
        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: getFileUrl(file.filename),
            path: file.path
        }));
        
        res.status(200).json({
            success: true,
            message: `${files.length} images uploaded successfully to local storage`,
            data: {
                files: files,
                count: files.length,
                uploadedAt: new Date().toISOString(),
                storage: 'local'
            }
        });
        
    } catch (error) {
        console.error('Local multiple upload error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during multiple file upload',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Upload Single Image to Cloudinary
 * 
 * Endpoint: POST /upload/cloudinary
 * Content-Type: multipart/form-data
 * Field name: image
 */
export const uploadCloudinarySingle = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please select an image file.',
                code: 'NO_FILE_UPLOADED'
            });
        }
        
        const file = req.file;
        
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file.path, {
            folder: 'aschik-project/uploads',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}` // Custom public ID
        });
        
        if (!cloudinaryResult.success) {
            // Clean up local file
            deleteFile(file.filename);
            
            return res.status(500).json({
                success: false,
                error: 'Failed to upload image to Cloudinary',
                details: cloudinaryResult.error
            });
        }
        
        // Clean up local file after successful Cloudinary upload
        deleteFile(file.filename);
        
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully to Cloudinary',
            data: {
                cloudinary: cloudinaryResult.data,
                originalName: file.originalname,
                originalSize: file.size,
                uploadedAt: new Date().toISOString(),
                storage: 'cloudinary'
            }
        });
        
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        
        // Clean up local file on error
        if (req.file) {
            deleteFile(req.file.filename);
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during Cloudinary upload',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Upload Multiple Images to Cloudinary
 * 
 * Endpoint: POST /upload/cloudinary/multiple
 * Content-Type: multipart/form-data
 * Field name: images
 * Max files: 5
 */
export const uploadCloudinaryMultiple = async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded. Please select image files.',
                code: 'NO_FILES_UPLOADED'
            });
        }
        
        const files = req.files;
        
        // Prepare file paths for Cloudinary upload
        const filePaths = files.map(file => file.path);
        
        // Upload all files to Cloudinary
        const cloudinaryResult = await uploadMultipleToCloudinary(filePaths, {
            folder: 'aschik-project/uploads'
        });
        
        // Clean up all local files regardless of Cloudinary result
        files.forEach(file => deleteFile(file.filename));
        
        if (!cloudinaryResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to upload images to Cloudinary',
                details: cloudinaryResult.error
            });
        }
        
        res.status(200).json({
            success: true,
            message: `${cloudinaryResult.data.uploaded} of ${cloudinaryResult.data.total} images uploaded successfully to Cloudinary`,
            data: {
                ...cloudinaryResult.data,
                uploadedAt: new Date().toISOString(),
                storage: 'cloudinary'
            }
        });
        
    } catch (error) {
        console.error('Cloudinary multiple upload error:', error);
        
        // Clean up local files on error
        if (req.files) {
            req.files.forEach(file => deleteFile(file.filename));
        }
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during multiple Cloudinary upload',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete Image from Local Storage
 * 
 * Endpoint: DELETE /upload/local/:filename
 */
export const deleteLocalImage = async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                error: 'Filename is required',
                code: 'MISSING_FILENAME'
            });
        }
        
        // Delete the file
        const deleted = await deleteFile(filename);
        
        if (deleted) {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully from local storage',
                filename: filename
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Image not found or already deleted',
                filename: filename
            });
        }
        
    } catch (error) {
        console.error('Local delete error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during file deletion',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete Image from Cloudinary
 * 
 * Endpoint: DELETE /upload/cloudinary/:publicId
 */
export const deleteCloudinaryImage = async (req, res) => {
    try {
        const { publicId } = req.params;
        
        if (!publicId) {
            return res.status(400).json({
                success: false,
                error: 'Public ID is required',
                code: 'MISSING_PUBLIC_ID'
            });
        }
        
        // Decode URL-encoded public ID
        const decodedPublicId = decodeURIComponent(publicId);
        
        // Delete from Cloudinary
        const result = await deleteFromCloudinary(decodedPublicId);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully from Cloudinary',
                public_id: decodedPublicId
            });
        } else {
            res.status(404).json({
                success: false,
                error: result.error,
                public_id: decodedPublicId
            });
        }
        
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during Cloudinary deletion',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Test Cloudinary Connection
 * 
 * Endpoint: GET /upload/cloudinary/test
 */
export const testCloudinary = async (req, res) => {
    try {
        const result = await testCloudinaryConnection();
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Cloudinary connection successful',
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Cloudinary connection failed',
                details: result.error
            });
        }
        
    } catch (error) {
        console.error('Cloudinary test error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during Cloudinary test',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get Upload Stats
 * 
 * Endpoint: GET /upload/stats
 */
export const getUploadStats = async (req, res) => {
    try {
        // Count local files
        const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
        let localFileCount = 0;
        let localTotalSize = 0;
        
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            localFileCount = files.length;
            
            // Calculate total size
            files.forEach(file => {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);
                localTotalSize += stats.size;
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                local: {
                    fileCount: localFileCount,
                    totalSize: localTotalSize,
                    totalSizeMB: (localTotalSize / (1024 * 1024)).toFixed(2),
                    directory: uploadsDir
                },
                cloudinary: {
                    configured: !!(process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY),
                    cloudName: process.env.CLOUDINARY_NAME || 'Not configured'
                },
                limits: {
                    maxFileSize: '5MB',
                    allowedTypes: ['JPEG', 'JPG', 'PNG', 'GIF', 'WebP'],
                    maxFilesPerRequest: 5
                }
            }
        });
        
    } catch (error) {
        console.error('Stats error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error while getting upload stats',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
