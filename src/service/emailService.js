import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
    // Support both EMAIL_ and SMTP_ environment variables for backward compatibility
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = process.env.EMAIL_PORT || process.env.SMTP_PORT;
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
    
    return nodemailer.createTransport({  // Fixed: createTransport instead of createTransporter
        host: host,
        port: parseInt(port),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass
        }
    });
};

export const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        const appName = process.env.EMAIL_FROM_NAME || 'Aschik Project';
        
        const subject = 'Email Verification - OTP Code';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Hello,</p>
                <p>Thank you for registering with ${appName}!</p>
                <p>Your email verification code is:</p>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                </div>
                <p>This code will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        `;

        const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;
        const fromName = process.env.EMAIL_FROM_NAME || 'Aschik Project';

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Email sending error:', error);
        throw new Error('Failed to send email: ' + error.message);
    }
};

export const sendWelcomeEmail = async (email, username) => {
    try {
        const transporter = createTransporter();
        const appName = process.env.EMAIL_FROM_NAME || 'Aschik Project';
        const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;
        const fromName = process.env.EMAIL_FROM_NAME || 'Aschik Project';
        
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: `Welcome to ${appName}!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Welcome to ${appName}!</h2>
                    <p>Hello <strong>${username}</strong>,</p>
                    <p>🎉 Congratulations! Your email has been successfully verified.</p>
                    <p>You can now enjoy all the features of our platform.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background: #28a745; color: white; padding: 12px 24px; border-radius: 5px; display: inline-block;">
                            ✅ Account Verified
                        </div>
                    </div>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message, please do not reply to this email.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Welcome email error:', error);
        throw new Error('Failed to send welcome email: ' + error.message);
    }
};

export const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email connection successful');
        return { success: true, message: 'Email connection successful' };
    } catch (error) {
        console.error('❌ Email connection error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send Password Reset Email
 * 
 * Sends an email with OTP for password reset
 * 
 * @param {string} email - User's email address
 * @param {string} otp - OTP code for password reset
 * @returns {Promise<Object>} - Result with success status
 */
export const sendPasswordResetEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        const appName = process.env.EMAIL_FROM_NAME || 'Aschik Project';
        
        const subject = 'Password Reset - OTP Code';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for ${appName}.</p>
                <p>Your password reset verification code is:</p>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <h1 style="color: #dc3545; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                </div>
                <p>This code will expire in ${process.env.OTP_EXPIRES_IN || 10} minutes.</p>
                <p><strong>Important:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                <p>For security reasons, never share this code with anyone.</p>
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        `;

        const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;
        const fromName = process.env.EMAIL_FROM_NAME || 'Aschik Project';

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
        
    } catch (error) {
        console.error('❌ Password reset email error:', error);
        throw new Error('Failed to send password reset email: ' + error.message);
    }
};