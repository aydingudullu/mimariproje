import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const options = {
        unreadOnly: req.query.unread_only === 'true',
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        type: req.query.type as string,
      };
      const result = await NotificationService.getNotifications(userId, options);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await NotificationService.getUnreadCount(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await NotificationService.markAsRead(userId, Number(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await NotificationService.deleteNotification(userId, Number(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await NotificationService.getPreferences(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await NotificationService.updatePreferences(userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
