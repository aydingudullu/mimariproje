import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);
router.post('/mark-all-read', authenticate, NotificationController.markAllAsRead);
router.post('/:id/read', authenticate, NotificationController.markAsRead);
router.delete('/:id', authenticate, NotificationController.deleteNotification);
router.get('/preferences', authenticate, NotificationController.getPreferences);
router.put('/preferences', authenticate, NotificationController.updatePreferences);

export default router;
