import { Router, Response, Request } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';

const router = Router();

// File type mappings
const PREVIEWABLE_TYPES: Record<string, string> = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  // Documents
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  // Videos
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/**
 * GET /api/files/preview/:filename
 * Dosya önizleme endpoint'i
 */
router.get('/preview/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Security: prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, sanitizedFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
    }

    // Check file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const mimeType = PREVIEWABLE_TYPES[ext];

    if (!mimeType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bu dosya türü önizlenemez',
        supportedTypes: Object.keys(PREVIEWABLE_TYPES),
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedFilename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('File preview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/files/info/:filename
 * Dosya bilgisi
 */
router.get('/info/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    const sanitizedFilename = path.basename(filename);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(sanitizedFilename).toLowerCase();

    res.json({
      success: true,
      data: {
        filename: sanitizedFilename,
        size: stats.size,
        sizeFormatted: formatFileSize(stats.size),
        extension: ext,
        mimeType: PREVIEWABLE_TYPES[ext] || 'application/octet-stream',
        isPreviewable: Boolean(PREVIEWABLE_TYPES[ext]),
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('File info error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/files/thumbnail/:filename
 * Küçük resim oluştur (images only)
 */
router.get('/thumbnail/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const width = parseInt(req.query.w as string) || 200;
    const height = parseInt(req.query.h as string) || 200;
    
    const sanitizedFilename = path.basename(filename);
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Dosya bulunamadı' });
    }

    const ext = path.extname(sanitizedFilename).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    if (!imageExts.includes(ext)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sadece resim dosyaları için thumbnail oluşturulabilir' 
      });
    }

    // Check for cached thumbnail
    const thumbFilename = `thumb_${width}x${height}_${sanitizedFilename}`;
    const thumbPath = path.join(uploadsDir, 'thumbnails', thumbFilename);

    // Ensure thumbnails directory exists
    const thumbDir = path.join(uploadsDir, 'thumbnails');
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }

    // If thumbnail exists, serve it
    if (fs.existsSync(thumbPath)) {
      res.setHeader('Content-Type', PREVIEWABLE_TYPES[ext] || 'image/jpeg');
      return fs.createReadStream(thumbPath).pipe(res);
    }

    // Create thumbnail using sharp (if available)
    try {
      const sharp = await import('sharp');
      
      await sharp.default(filePath)
        .resize(width, height, { fit: 'cover' })
        .toFile(thumbPath);

      res.setHeader('Content-Type', PREVIEWABLE_TYPES[ext] || 'image/jpeg');
      fs.createReadStream(thumbPath).pipe(res);
    } catch (sharpError) {
      // If sharp not available, serve original
      res.setHeader('Content-Type', PREVIEWABLE_TYPES[ext] || 'image/jpeg');
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error: any) {
    console.error('Thumbnail error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default router;
