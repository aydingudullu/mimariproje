import { Request, Response } from 'express';
import { FavoriteService } from '../services/favorite.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class FavoriteController {
  /**
   * Add project to favorites
   */
  static async add(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const projectId = parseInt(req.body.project_id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Geçersiz proje ID' });
      }

      const result = await FavoriteService.add(req.user.id, projectId);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Add favorite error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Remove project from favorites
   */
  static async remove(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Geçersiz proje ID' });
      }

      const result = await FavoriteService.remove(req.user.id, projectId);
      res.json(result);
    } catch (error: any) {
      console.error("Remove favorite error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggle(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const projectId = parseInt(req.body.project_id || req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Geçersiz proje ID' });
      }

      const result = await FavoriteService.toggle(req.user.id, projectId);
      res.json(result);
    } catch (error: any) {
      console.error("Toggle favorite error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Check if project is favorited
   */
  static async check(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Geçersiz proje ID' });
      }

      const result = await FavoriteService.isFavorited(req.user.id, projectId);
      res.json(result);
    } catch (error: any) {
      console.error("Check favorite error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user's favorites
   */
  static async list(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      const result = await FavoriteService.getUserFavorites(req.user.id, page, limit);
      res.json(result);
    } catch (error: any) {
      console.error("List favorites error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get favorite count for a project
   */
  static async getProjectCount(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Geçersiz proje ID' });
      }

      const result = await FavoriteService.getProjectFavoriteCount(projectId);
      res.json(result);
    } catch (error: any) {
      console.error("Get project favorite count error:", error);
      res.status(400).json({ error: error.message });
    }
  }
}
