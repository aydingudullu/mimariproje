import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * GET /api/admin/system-settings
 * Tüm sistem ayarlarını getir
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const isPublicOnly = req.query.public === 'true';
    
    const where: any = {};
    if (isPublicOnly) {
      where.is_public = true;
    }

    const settings = await prisma.system_settings.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, any[]> = {};
    settings.forEach(s => {
      const cat = s.category || 'general';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        id: s.id,
        key: s.key,
        value: parseSettingValue(s.value, s.data_type),
        dataType: s.data_type,
        description: s.description,
        isPublic: s.is_public,
      });
    });

    res.json({
      success: true,
      data: { settings: grouped },
    });
  } catch (error: any) {
    console.error('Get system settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/system-settings/:key
 * Tek bir ayarı getir
 */
router.get('/:key', async (req: AuthRequest, res: Response) => {
  try {
    const setting = await prisma.system_settings.findUnique({
      where: { key: req.params.key },
    });

    if (!setting) {
      return res.status(404).json({ success: false, error: 'Ayar bulunamadı' });
    }

    res.json({
      success: true,
      data: {
        setting: {
          ...setting,
          value: parseSettingValue(setting.value, setting.data_type),
        },
      },
    });
  } catch (error: any) {
    console.error('Get system setting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/system-settings/:key
 * Ayarı güncelle
 */
router.put('/:key', async (req: AuthRequest, res: Response) => {
  try {
    const { value } = req.body;
    const adminId = req.user!.id;

    // Get admin user id
    const adminUser = await prisma.admin_users.findFirst({
      where: { user_id: adminId },
    });

    const setting = await prisma.system_settings.update({
      where: { key: req.params.key },
      data: {
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        updated_by: adminUser?.id,
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: { setting },
      message: 'Ayar güncellendi',
    });
  } catch (error: any) {
    console.error('Update system setting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/system-settings
 * Yeni ayar oluştur
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { key, value, dataType, description, category, isPublic } = req.body;
    const adminId = req.user!.id;

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, error: 'Key ve value gerekli' });
    }

    // Check if key exists
    const existing = await prisma.system_settings.findUnique({
      where: { key },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Bu key zaten mevcut' });
    }

    const adminUser = await prisma.admin_users.findFirst({
      where: { user_id: adminId },
    });

    const setting = await prisma.system_settings.create({
      data: {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        data_type: dataType || 'string',
        description,
        category: category || 'general',
        is_public: isPublic ?? false,
        created_by: adminUser?.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: { setting },
      message: 'Ayar oluşturuldu',
    });
  } catch (error: any) {
    console.error('Create system setting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/system-settings/:key
 * Ayarı sil
 */
router.delete('/:key', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.system_settings.delete({
      where: { key: req.params.key },
    });

    res.json({
      success: true,
      message: 'Ayar silindi',
    });
  } catch (error: any) {
    console.error('Delete system setting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to parse value based on data type
function parseSettingValue(value: string | null, dataType: string): any {
  if (value === null) return null;
  
  switch (dataType) {
    case 'boolean':
      return value === 'true' || value === '1';
    case 'number':
    case 'integer':
      return Number(value);
    case 'json':
    case 'object':
    case 'array':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

export default router;
