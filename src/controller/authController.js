import { registerUser, loginUser } from "../service/authService.js";

export async function signup(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Username, email, and password are required"
            });
        }

        const result = await registerUser({
            username,
            email,
            password
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                user: result.user,
                requiresVerification: true
            }
        });

    } catch (error) {
        console.error('Error in sign up ', error);

        if (error.message.includes('email')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('username')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('password')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        if (error.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to Register the user",
            message: error.message
        });
    }
}

export async function signin(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and Password is Required"
            });
        }

        const result = await loginUser({
            email,
            password
        });

        // Handle unverified email
        if (result.requiresVerification) {
            return res.status(403).json({
                success: false,
                requiresVerification: true,
                email: result.email,
                message: result.message,
                action: 'verify_email'
            });
        }

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                token: result.token,
                user: result.user
            }
        });

    } catch (error) {
        console.error('Error in signin', error);

        if (error.message === "Invalid credentials") {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to sign in",
            message: error.message
        });
    }
}

export async function getProfile(req, res) {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            data: {
                user: user
            }
        });

    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}