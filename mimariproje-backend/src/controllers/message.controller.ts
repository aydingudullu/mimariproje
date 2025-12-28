import { Response } from 'express';
import { z } from 'zod';
import { MessageService } from '../services/message.service';
import { AuthRequest } from '../middlewares/auth.middleware';

// Validation schemas
const sendMessageSchema = z.object({
  receiverId: z.number().positive('Geçerli bir alıcı ID giriniz'),
  content: z.string().min(1, 'Mesaj boş olamaz').max(5000, 'Mesaj çok uzun'),
  message_type: z.enum(['text', 'image', 'file']).optional(),
  file_url: z.string().optional(),
});

const startConversationSchema = z.object({
  receiverId: z.number().positive(),
  message: z.string().min(1).max(5000),
});

const searchMessagesSchema = z.object({
  query: z.string().min(2, 'Arama sorgusu en az 2 karakter olmalı'),
  page: z.number().positive().optional(),
  limit: z.number().positive().max(50).optional(),
});

export class MessageController {
  /**
   * Get all conversations for the authenticated user
   */
  static async getConversations(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const conversations = await MessageService.getConversations(req.user.id);
      res.json({ conversations });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get messages for a specific conversation
   */
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const conversationId = parseInt(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: 'Geçersiz konuşma ID' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await MessageService.getMessages(conversationId, req.user.id, page, limit);
      res.json(result);
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Send a message (with optional file attachment)
   */
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const data = sendMessageSchema.parse(req.body);
      const message = await MessageService.sendMessage(
        req.user.id, 
        data.receiverId, 
        data.content,
        { message_type: data.message_type, file_url: data.file_url }
      );
      res.status(201).json({ message });
    } catch (error: any) {
      console.error('Send message error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Start a new conversation
   */
  static async startConversation(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const data = startConversationSchema.parse(req.body);
      const result = await MessageService.startConversation(
        req.user.id,
        data.receiverId,
        data.message
      );
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Start conversation error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const conversationId = parseInt(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: 'Geçersiz konuşma ID' });
      }

      const result = await MessageService.markAsRead(conversationId, req.user.id);
      res.json(result);
    } catch (error: any) {
      console.error('Mark as read error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const messageId = parseInt(req.params.messageId);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Geçersiz mesaj ID' });
      }

      const result = await MessageService.deleteMessage(messageId, req.user.id);
      res.json(result);
    } catch (error: any) {
      console.error('Delete message error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const result = await MessageService.getUnreadCount(req.user.id);
      res.json(result);
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Search messages
   */
  static async searchMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Arama sorgusu en az 2 karakter olmalı' });
      }

      const result = await MessageService.searchMessages(req.user.id, query, page, limit);
      res.json(result);
    } catch (error: any) {
      console.error('Search messages error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
