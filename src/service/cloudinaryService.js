/**
 * Cloudinary Image Upload Service
 * 
 * This service handles image uploads to Cloudinary cloud storage.
 * Features:
 * - Automatic image optimization
 * - Multiple format support
 * - Transformation capabilities
 * - Secure URL generation
 * - Delete functionality
 * 
 * Environment variables required:
 * - CLOUDINARY_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_SECRET_KEY
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Cloudinary Configuration
 * 
 * Configure Cloudinary with credentials from environment variables
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

/**
 * Validate Cloudinary Configuration
 * 
 * Check if all required environment variables are present
 */
const validateCloudinaryConfig = () => {
    const required = ['CLOUDINARY_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_SECRET_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing Cloudinary configuration: ${missing.join(', ')}`);
    }
    
    return true;
};

/**
 * Upload Image to Cloudinary
 * 
 * @param {string} filePath - Path to the file or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
    try {
        // Validate configuration before upload
        validateCloudinaryConfig();
        
        // Default upload options
        const defaultOptions = {
            folder: 'aschik-project/images', // Organize uploads in folders
            resource_type: 'image',
            quality: 'auto', // Automatic quality optimization
            fetch_format: 'auto', // Automatic format optimization
            transformation: [
                { width: 1000, crop: 'limit' }, // Limit max width to 1000px
                { quality: 'auto' }
            ]
        };
        
        // Merge with custom options
        const uploadOptions = { ...defaultOptions, ...options };
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, uploadOptions);
        
        return {
            success: true,
            data: {
                public_id: result.public_id,
                url: result.secure_url,
                original_url: result.url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at,
                folder: result.folder
            }
        };
        
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        
        return {
            success: false,
            error: error.message || 'Failed to upload image to Cloudinary'
        };
    }
};

/**
 * Upload Multiple Images to Cloudinary
 * 
 * @param {Array} filePaths - Array of file paths
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload results for all files
 */
export const uploadMultipleToCloudinary = async (filePaths, options = {}) => {
    try {
        validateCloudinaryConfig();
        
        // Upload all files in parallel
        const uploadPromises = filePaths.map(filePath => 
            uploadToCloudinary(filePath, options)
        );
        
        const results = await Promise.all(uploadPromises);
        
        // Separate successful and failed uploads
        const successful = results.filter(result => result.success);
        const failed = results.filter(result => !result.success);
        
        return {
            success: true,
            data: {
                successful: successful.map(result => result.data),
                failed: failed.map(result => result.error),
                total: filePaths.length,
                uploaded: successful.length,
                failed_count: failed.length
            }
        };
        
    } catch (error) {
        console.error('Multiple Cloudinary upload error:', error);
        
        return {
            success: false,
            error: error.message || 'Failed to upload images to Cloudinary'
        };
    }
};

/**
 * Delete Image from Cloudinary
 * 
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        validateCloudinaryConfig();
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            return {
                success: true,
                message: 'Image deleted successfully',
                public_id: publicId
            };
        } else {
            return {
                success: false,
                error: 'Failed to delete image - image may not exist',
                public_id: publicId
            };
        }
        
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        
        return {
            success: false,
            error: error.message || 'Failed to delete image from Cloudinary'
        };
    }
};

/**
 * Generate Transformation URL
 * 
 * @param {string} publicId - The public_id of the image
 * @param {Object} transformations - Cloudinary transformation options
 * @returns {string} - Transformed image URL
 */
export const getTransformedUrl = (publicId, transformations = {}) => {
    try {
        validateCloudinaryConfig();
        
        return cloudinary.url(publicId, {
            secure: true,
            ...transformations
        });
        
    } catch (error) {
        console.error('Cloudinary URL generation error:', error);
        return null;
    }
};

/**
 * Get Image Information
 * 
 * @param {string} publicId - The public_id of the image
 * @returns {Promise<Object>} - Image metadata
 */
export const getImageInfo = async (publicId) => {
    try {
        validateCloudinaryConfig();
        
        const result = await cloudinary.api.resource(publicId);
        
        return {
            success: true,
            data: {
                public_id: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at,
                tags: result.tags || []
            }
        };
        
    } catch (error) {
        console.error('Cloudinary info error:', error);
        
        return {
            success: false,
            error: error.message || 'Failed to get image information'
        };
    }
};

/**
 * Test Cloudinary Connection
 * 
 * @returns {Promise<Object>} - Connection test result
 */
export const testCloudinaryConnection = async () => {
    try {
        validateCloudinaryConfig();
        
        // Try to get account info to test connection
        const result = await cloudinary.api.ping();
        
        return {
            success: true,
            message: 'Cloudinary connection successful',
            status: result.status
        };
        
    } catch (error) {
        console.error('Cloudinary connection test error:', error);
        
        return {
            success: false,
            error: error.message || 'Failed to connect to Cloudinary'
        };
    }
};

/**
 * Utility Functions for Common Transformations
 */

/**
 * Generate thumbnail URL
 * @param {string} publicId - Image public ID
 * @returns {string} - Thumbnail URL (150x150)
 */
export const getThumbnailUrl = (publicId) => {
    return getTransformedUrl(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'center'
    });
};

/**
 * Generate profile picture URL
 * @param {string} publicId - Image public ID
 * @returns {string} - Profile picture URL (300x300)
 */
export const getProfilePictureUrl = (publicId) => {
    return getTransformedUrl(publicId, {
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face'
    });
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Upload single image:
 *    const result = await uploadToCloudinary('/path/to/image.jpg');
 * 
 * 2. Upload with custom options:
 *    const result = await uploadToCloudinary('/path/to/image.jpg', {
 *        folder: 'products',
 *        transformation: [{ width: 500, height: 500, crop: 'fill' }]
 *    });
 * 
 * 3. Upload multiple images:
 *    const results = await uploadMultipleToCloudinary([
 *        '/path/to/image1.jpg',
 *        '/path/to/image2.jpg'
 *    ]);
 * 
 * 4. Delete image:
 *    const result = await deleteFromCloudinary('aschik-project/images/sample_id');
 * 
 * 5. Generate transformed URL:
 *    const thumbnailUrl = getThumbnailUrl('aschik-project/images/sample_id');
 */

export default {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    getTransformedUrl,
    getImageInfo,
    testCloudinaryConnection,
    getThumbnailUrl,
    getProfilePictureUrl
};
