import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { BackupService, backupService } from '../services/backup.service';

const router = Router();

// All backup routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/admin/backups
 * Tüm backup'ları listele
 */
router.get('/backups', async (req: AuthRequest, res: Response) => {
  try {
    const backups = backupService.listBackups();
    
    res.json({
      success: true,
      data: {
        backups: backups.map(b => ({
          filename: b.filename,
          size: b.size,
          sizeFormatted: formatSize(b.size),
          createdAt: b.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('List backups error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/backups/create
 * Yeni backup oluştur
 */
router.post('/backups/create', async (req: AuthRequest, res: Response) => {
  try {
    const result = await backupService.createBackup();
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          filename: result.filename,
          size: result.size,
          sizeFormatted: formatSize(result.size || 0),
          timestamp: result.timestamp,
        },
        message: 'Backup başarıyla oluşturuldu',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Create backup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/backups/:filename
 * Backup sil
 */
router.delete('/backups/:filename', async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ success: false, error: 'Dosya adı gerekli' });
    }

    const deleted = backupService.deleteBackup(filename);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Backup başarıyla silindi',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Backup bulunamadı',
      });
    }
  } catch (error: any) {
    console.error('Delete backup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default router;
