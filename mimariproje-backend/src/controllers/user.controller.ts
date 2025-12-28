import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const updateProfileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  specializations: z.string().optional(),
});

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await UserService.getProfile(userId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const updatedUser = await UserService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data: { user: updatedUser } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const stats = await UserService.getDashboardStats(req.user!.id);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Profil fotoğrafını güncelle
   */
  static async updateProfileImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
      }

      const userId = req.user!.id;
      const avatarUrl = `/uploads/${req.file.filename}`;

      // Check if file was optimized (WebP conversion)
      const optimizedFilename = req.file.filename.replace(/\.[^.]+$/, '.webp');
      const fs = await import('fs');
      const path = await import('path');
      const optimizedPath = path.join(process.cwd(), 'uploads', optimizedFilename);
      
      // Use optimized version if it exists
      const finalUrl = fs.existsSync(optimizedPath) 
        ? `/uploads/${optimizedFilename}` 
        : avatarUrl;

      const updatedUser = await UserService.updateProfileImage(userId, finalUrl);

      res.json({
        success: true,
        data: {
          avatarUrl: updatedUser.avatar_url,
        },
        message: 'Profil fotoğrafı başarıyla güncellendi',
      });
    } catch (error: any) {
      console.error('Update profile image error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Kullanıcıları ara ve filtrele
   */
  static async searchUsers(req: Request, res: Response) {
    try {
      const { query, user_type, location, profession, verified, page, limit } = req.query;

      const result = await UserService.searchUsers({
        query: query as string,
        user_type: user_type as string,
        location: location as string,
        profession: profession as string,
        verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 12,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Search users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Kullanıcının public profilini getir
   */
  static async getPublicProfile(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Geçersiz kullanıcı ID' });
      }

      const user = await UserService.getPublicProfile(userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      console.error('Get public profile error:', error);
      res.status(404).json({ success: false, error: error.message });
    }
  }
}
