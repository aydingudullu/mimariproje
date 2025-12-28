import { Request, Response } from 'express';
import { z } from 'zod';
import { ReviewService } from '../services/review.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const createReviewSchema = z.object({
  reviewed_id: z.number().positive('Geçerli bir kullanıcı ID giriniz'),
  project_id: z.number().positive().optional(),
  rating: z.number().min(1).max(5, 'Puan 1 ile 5 arasında olmalıdır'),
  comment: z.string().max(1000, 'Yorum en fazla 1000 karakter olabilir').optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export class ReviewController {
  /**
   * Create a new review
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const data = createReviewSchema.parse(req.body);
      const review = await ReviewService.create(req.user.id, data);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Create review error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get reviews for a user
   */
  static async getByUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      }

      const result = await ReviewService.getByUserId(userId, page, limit);
      res.json(result);
    } catch (error: any) {
      console.error("Get reviews error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user's rating statistics
   */
  static async getUserRating(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
      }

      const result = await ReviewService.getUserRating(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Get user rating error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get a specific review
   */
  static async getById(req: Request, res: Response) {
    try {
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({ error: 'Geçersiz değerlendirme ID' });
      }

      const review = await ReviewService.getById(reviewId);
      res.json(review);
    } catch (error: any) {
      console.error("Get review error:", error);
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Update a review
   */
  static async update(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ error: 'Geçersiz değerlendirme ID' });
      }

      const data = updateReviewSchema.parse(req.body);
      const review = await ReviewService.update(reviewId, req.user.id, data);
      res.json(review);
    } catch (error: any) {
      console.error("Update review error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete a review
   */
  static async delete(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ error: 'Geçersiz değerlendirme ID' });
      }

      const isAdmin = req.user.role === 'admin';
      const result = await ReviewService.delete(reviewId, req.user.id, isAdmin);
      res.json(result);
    } catch (error: any) {
      console.error("Delete review error:", error);
      res.status(400).json({ error: error.message });
    }
  }
}
