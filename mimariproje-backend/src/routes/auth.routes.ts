import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { passwordResetLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Password reset routes (with stricter rate limiting)
router.post('/forgot-password', passwordResetLimiter, AuthController.requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, AuthController.resetPassword);

// Email verification routes
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', authenticate, AuthController.resendVerificationEmail);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post('/logout-all', authenticate, AuthController.logoutAll);

export default router;
