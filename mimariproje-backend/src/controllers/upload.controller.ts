import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UploadController {
  /**
   * Upload profile image with optimization
   */
  static async uploadProfileImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
      }

      const result = await UploadService.uploadProfileImage(req.file);
      
      res.json({ 
        success: true, 
        data: result,
        message: 'Profil fotoğrafı başarıyla yüklendi'
      });
    } catch (error: any) {
      console.error('Upload profile image error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Upload project images with optimization
   */
  static async uploadProjectImages(req: AuthRequest, res: Response) {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
      }

      const files = req.files as Express.Multer.File[];
      const results = await Promise.all(
        files.map(file => UploadService.uploadProjectImage(file))
      );

      res.json({ 
        success: true, 
        data: results,
        message: `${results.length} görsel başarıyla yüklendi`
      });
    } catch (error: any) {
      console.error('Upload project images error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Upload cover image with optimization
   */
  static async uploadCoverImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
      }

      const result = await UploadService.uploadCoverImage(req.file);
      
      res.json({ 
        success: true, 
        data: result,
        message: 'Kapak görseli başarıyla yüklendi'
      });
    } catch (error: any) {
      console.error('Upload cover image error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Upload generic file (documents, etc.)
   */
  static async uploadFile(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
      }

      const result = await UploadService.uploadFile(req.file);
      
      res.json({ 
        success: true, 
        data: result,
        message: 'Dosya başarıyla yüklendi'
      });
    } catch (error: any) {
      console.error('Upload file error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(req: AuthRequest, res: Response) {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({ success: false, error: 'Dosya adı gerekli' });
      }

      const deleted = await UploadService.deleteFile(filename);
      
      if (deleted) {
        res.json({ success: true, message: 'Dosya silindi' });
      } else {
        res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
      }
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
