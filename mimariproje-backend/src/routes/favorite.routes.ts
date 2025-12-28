import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Favorites management
router.get('/', FavoriteController.list);
router.post('/', FavoriteController.add);
router.post('/toggle', FavoriteController.toggle);
router.get('/check/:projectId', FavoriteController.check);
router.delete('/:projectId', FavoriteController.remove);

// Public route for project favorite count (no auth required)
// router.get('/project/:projectId/count', FavoriteController.getProjectCount);

export default router;
