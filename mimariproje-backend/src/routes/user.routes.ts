import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload, validateUploadedFile } from '../config/multer';

const router = Router();

// Public routes
router.get('/search', UserController.searchUsers);
router.get('/:id/public', UserController.getPublicProfile);

// Protected routes
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.get('/dashboard-stats', authenticate, UserController.getDashboardStats);

// Profile image upload
router.post(
  '/profile-image',
  authenticate,
  upload.single('file'),
  validateUploadedFile,
  UserController.updateProfileImage
);

export default router;

