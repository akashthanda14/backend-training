import express from 'express';
import {
    sendVerificationOTP,
    verifyEmail,
    checkVerificationStatus
} from '../controller/otpController.js';

const router = express.Router();

router.post('/send-verification', sendVerificationOTP);
router.post('/verify-email', verifyEmail);
router.get('/verification-status/:email', checkVerificationStatus);

export default router;