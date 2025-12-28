import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/user/:userId', ReviewController.getByUser);
router.get('/user/:userId/rating', ReviewController.getUserRating);
router.get('/:id', ReviewController.getById);

// Protected routes
router.post('/', authenticate, ReviewController.create);
router.put('/:id', authenticate, ReviewController.update);
router.delete('/:id', authenticate, ReviewController.delete);

export default router;
