/**
 * Rate Limiting Middleware
 * 
 * This file contains rate limiters to protect our API endpoints from abuse.
 * Rate limiting prevents brute force attacks, DDoS attacks, and excessive API usage.
 * 
 * How it works:
 * - Tracks requests by IP address
 * - Blocks requests when limit is exceeded within the time window
 * - Returns error message with retry-after information
 * - Resets counter after the time window expires
 */

// Import the express-rate-limit package
import rateLimit from 'express-rate-limit';

/**
 * Login Rate Limiter
 * 
 * Protects login endpoints from brute force attacks
 * Applied to: /auth/signin and /admin/login
 * 
 * Configuration:
 * - Allows 5 login attempts per IP address
 * - Time window: 15 minutes
 * - After 5 failed attempts, user must wait 15 minutes
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds (15 min × 60 sec × 1000 ms)
    max: 5, // Maximum 5 requests per IP within the time window
    
    // Custom error message returned when limit is exceeded
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    
    standardHeaders: true, // Send rate limit info in RateLimit-* headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
    legacyHeaders: false, // Disable old X-RateLimit-* headers (X-RateLimit-Limit, X-RateLimit-Remaining)
    
    skipSuccessfulRequests: false, // Count successful login attempts (set to true to only count failed attempts)
    skipFailedRequests: false, // Count failed login attempts (both successful and failed count towards limit)
});

/**
 * Signup Rate Limiter
 * 
 * Prevents spam account creation
 * Applied to: /auth/signup
 * 
 * Configuration:
 * - Allows 3 signups per IP address
 * - Time window: 1 hour
 * - Stricter than login to prevent bot account creation
 */
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour in milliseconds (60 min × 60 sec × 1000 ms)
    max: 3, // Maximum 3 signup requests per IP within the time window
    
    // Custom error message for signup limits
    message: {
        success: false,
        error: 'Too many accounts created from this IP, please try again after an hour'
    },
    
    standardHeaders: true, // Include modern rate limit headers
    legacyHeaders: false, // Exclude deprecated headers
});

/**
 * OTP Rate Limiter
 * 
 * Protects OTP endpoints from spam
 * Applied to: /otp/send-verification and /otp/verify-email
 * 
 * Configuration:
 * - Allows 3 OTP requests per IP address
 * - Time window: 15 minutes
 * - Prevents OTP flooding and email spam
 */
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 3, // Maximum 3 OTP requests per IP within the time window
    
    // Custom error message for OTP limits
    message: {
        success: false,
        error: 'Too many OTP requests from this IP, please try again after 15 minutes'
    },
    
    standardHeaders: true, // Include rate limit info in response headers
    legacyHeaders: false, // Use modern header format only
});

/**
 * General API Rate Limiter
 * 
 * General protection for all API endpoints
 * Can be applied to entire API or specific route groups
 * 
 * Configuration:
 * - Allows 100 requests per IP address
 * - Time window: 15 minutes
 * - More generous limit for normal API usage
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 100, // Maximum 100 requests per IP within the time window
    
    // Generic error message for general API limits
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    
    standardHeaders: true, // Send rate limit headers to client
    legacyHeaders: false, // Don't send old-style headers
});

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import the limiter in your route file:
 *    import { loginLimiter } from '../middleware/rateLimiter.js';
 * 
 * 2. Apply as middleware before your route handler:
 *    router.post('/signin', loginLimiter, signin);
 * 
 * 3. The limiter will automatically:
 *    - Track requests by IP
 *    - Block excessive requests
 *    - Send appropriate error messages
 *    - Add rate limit headers to responses
 * 
 * RESPONSE HEADERS:
 * - RateLimit-Limit: Maximum requests allowed in time window
 * - RateLimit-Remaining: Number of requests remaining
 * - RateLimit-Reset: Time when the rate limit resets (Unix timestamp)
 * 
 * TESTING:
 * - Make multiple rapid requests to the protected endpoint
 * - After exceeding the limit, you'll receive the error message
 * - Wait for the time window to expire, then try again
 */
