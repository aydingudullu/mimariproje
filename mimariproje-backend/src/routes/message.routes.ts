import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Conversations
router.get('/conversations', MessageController.getConversations);
router.post('/conversations', MessageController.startConversation);

// Messages
router.get('/unread-count', MessageController.getUnreadCount);
router.get('/search', MessageController.searchMessages);
router.get('/:conversationId', MessageController.getMessages);
router.post('/', MessageController.sendMessage);
router.post('/:conversationId/read', MessageController.markAsRead);
router.delete('/:messageId', MessageController.deleteMessage);

export default router;
