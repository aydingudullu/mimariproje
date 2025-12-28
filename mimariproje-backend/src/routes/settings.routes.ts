import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// Validation schemas
const updateSettingsSchema = z.object({
  // Profile settings
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional().or(z.literal('')),
  
  // Preferences
  language: z.enum(['tr', 'en']).optional(),
  timezone: z.string().optional(),
  
  // Privacy settings
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  profileVisibility: z.enum(['public', 'private', 'connections']).optional(),
});

const updateNotificationSettingsSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  
  // Notification types
  email_notifications: z.string().optional(), // JSON string
  push_notifications: z.string().optional(),
  in_app_notifications: z.string().optional(),
  
  // Quiet hours
  quiet_hours_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional(),
});

/**
 * GET /api/settings
 * Kullanıcı ayarlarını getir
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        company_name: true,
        user_type: true,
        profession: true,
        phone: true,
        location: true,
        website: true,
        bio: true,
        avatar_url: true,
        specializations: true,
        experience_years: true,
        is_verified: true,
        subscription_type: true,
        notification_preferences: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      success: true,
      data: {
        profile: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          companyName: user.company_name,
          userType: user.user_type,
          profession: user.profession,
          phone: user.phone,
          location: user.location,
          website: user.website,
          bio: user.bio,
          avatarUrl: user.avatar_url,
          specializations: user.specializations,
          experienceYears: user.experience_years,
          isVerified: user.is_verified,
          subscriptionType: user.subscription_type,
        },
        notifications: user.notification_preferences || {
          email_enabled: true,
          push_enabled: true,
          in_app_enabled: true,
        },
      },
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/settings/profile
 * Profil ayarlarını güncelle
 */
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = updateSettingsSchema.parse(req.body);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        bio: data.bio,
        location: data.location,
        phone: data.phone,
        website: data.website || null,
        updated_at: new Date(),
      },
      select: {
        id: true,
        bio: true,
        location: true,
        phone: true,
        website: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profil ayarları güncellendi',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.issues[0].message });
    }
    console.error('Update profile settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/settings/notifications
 * Bildirim ayarlarını güncelle
 */
router.put('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = updateNotificationSettingsSchema.parse(req.body);

    const updatedPrefs = await prisma.notification_preferences.upsert({
      where: { user_id: userId },
      update: {
        email_enabled: data.email_enabled,
        push_enabled: data.push_enabled,
        in_app_enabled: data.in_app_enabled,
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        in_app_notifications: data.in_app_notifications,
        quiet_hours_enabled: data.quiet_hours_enabled,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        email_enabled: data.email_enabled ?? true,
        push_enabled: data.push_enabled ?? true,
        in_app_enabled: data.in_app_enabled ?? true,
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        in_app_notifications: data.in_app_notifications,
        quiet_hours_enabled: data.quiet_hours_enabled ?? false,
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      data: updatedPrefs,
      message: 'Bildirim ayarları güncellendi',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.issues[0].message });
    }
    console.error('Update notification settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/settings/password
 * Şifre değiştir
 */
router.put('/password', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mevcut şifre ve yeni şifre gerekli' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Yeni şifre en az 8 karakter olmalı' 
      });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Verify current password
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Mevcut şifre hatalı' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    
    await prisma.users.update({
      where: { id: userId },
      data: { 
        password_hash: newHash,
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi',
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/settings/account
 * Hesabı sil (soft delete)
 */
router.delete('/account', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Şifre gerekli' });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Verify password
    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Şifre hatalı' });
    }

    // Soft delete - deactivate account
    await prisma.users.update({
      where: { id: userId },
      data: {
        is_active: false,
        bio: `[HESAP SİLİNDİ] ${reason || 'Sebep belirtilmedi'}`,
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Hesabınız silindi. Geri dönmek isterseniz destek ekibiyle iletişime geçebilirsiniz.',
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
