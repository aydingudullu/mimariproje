import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// All routes require authentication
router.use(authenticate);

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: string;
  actionUrl?: string;
}

/**
 * GET /api/onboarding/status
 * Kullanıcının onboarding durumunu getir
 */
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        first_name: true,
        last_name: true,
        bio: true,
        location: true,
        avatar_url: true,
        profile_image_url: true,
        phone: true,
        is_verified: true,
        company_name: true,
        user_type: true,
        specializations: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Check completion status
    const projectCount = await prisma.projects.count({ 
      where: { user_id: userId, is_deleted: false } 
    });

    const hasMessages = await prisma.messages.count({
      where: { sender_id: userId },
    }) > 0;

    // Define onboarding steps
    const steps: OnboardingStep[] = [
      {
        id: 'profile_basic',
        title: 'Profil Bilgilerini Tamamla',
        description: 'İsmini ve temel bilgilerini ekle',
        completed: Boolean(user.first_name && user.last_name),
        action: 'Profili Düzenle',
        actionUrl: '/profilim/duzenle',
      },
      {
        id: 'profile_photo',
        title: 'Profil Fotoğrafı Ekle',
        description: 'Profesyonel bir profil fotoğrafı yükle',
        completed: Boolean(user.avatar_url || user.profile_image_url),
        action: 'Fotoğraf Yükle',
        actionUrl: '/profilim/duzenle',
      },
      {
        id: 'profile_bio',
        title: 'Hakkında Yaz',
        description: 'Kendin ve uzmanlık alanların hakkında bilgi ver',
        completed: Boolean(user.bio && user.bio.length > 20),
        action: 'Bio Ekle',
        actionUrl: '/profilim/duzenle',
      },
      {
        id: 'profile_location',
        title: 'Konum Ekle',
        description: 'Çalıştığın lokasyonu belirt',
        completed: Boolean(user.location),
        action: 'Konum Ekle',
        actionUrl: '/profilim/duzenle',
      },
    ];

    // Add user-type specific steps
    if (user.user_type === 'architect' || user.user_type === 'firm') {
      steps.push(
        {
          id: 'first_project',
          title: 'İlk Projeni Paylaş',
          description: 'Portfolyona ilk projeyi ekle',
          completed: projectCount > 0,
          action: 'Proje Ekle',
          actionUrl: '/projelerim/ekle',
        },
        {
          id: 'specializations',
          title: 'Uzmanlık Alanlarını Belirt',
          description: 'Hangi alanlarda uzmanlaştığını ekle',
          completed: Boolean(user.specializations && user.specializations.length > 0),
          action: 'Uzmanlık Ekle',
          actionUrl: '/profilim/duzenle',
        }
      );
    }

    // Communication step for all
    steps.push({
      id: 'first_message',
      title: 'İlk Mesajını Gönder',
      description: 'Platformdaki diğer kullanıcılarla iletişime geç',
      completed: hasMessages,
      action: 'Mesajlaşmaya Git',
      actionUrl: '/mesajlar',
    });

    const completedCount = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedCount / totalSteps) * 100);

    res.json({
      success: true,
      data: {
        steps,
        progress: {
          completed: completedCount,
          total: totalSteps,
          percentage: progressPercentage,
        },
        isComplete: progressPercentage >= 80, // Consider onboarding complete at 80%
        showOnboarding: progressPercentage < 80,
      },
    });
  } catch (error: any) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/onboarding/dismiss
 * Onboarding'i kapat
 */
router.post('/dismiss', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Store dismissal in notification preferences
    const prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    let existingData: any = {};
    if (prefs?.in_app_notifications) {
      try {
        existingData = JSON.parse(prefs.in_app_notifications);
      } catch (e) {
        existingData = {};
      }
    }

    existingData.onboardingDismissed = true;
    existingData.onboardingDismissedAt = new Date().toISOString();

    await prisma.notification_preferences.upsert({
      where: { user_id: userId },
      update: {
        in_app_notifications: JSON.stringify(existingData),
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        in_app_notifications: JSON.stringify(existingData),
        created_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Onboarding kapatıldı',
    });
  } catch (error: any) {
    console.error('Dismiss onboarding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/onboarding/tips
 * Kullanıcı tipine göre ipuçları
 */
router.get('/tips', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    const tips = getTipsByUserType(user?.user_type || 'user');

    res.json({
      success: true,
      data: { tips },
    });
  } catch (error: any) {
    console.error('Get onboarding tips error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function for tips
function getTipsByUserType(userType: string): Array<{ title: string; description: string; icon: string }> {
  const commonTips = [
    {
      title: 'Profilinizi Tamamlayın',
      description: 'Tam profil, görünürlüğünüzü %70 artırır',
      icon: 'user',
    },
    {
      title: 'İletişimde Kalın',
      description: 'Mesajlara hızlı yanıt verin',
      icon: 'message',
    },
  ];

  const architectTips = [
    {
      title: 'Portfolyonuzu Zenginleştirin',
      description: 'En iyi projelerinizi yüksek kaliteli görsellerle paylaşın',
      icon: 'folder',
    },
    {
      title: 'Uzmanlık Alanlarını Belirtin',
      description: 'Doğru müşteriler tarafından bulunmanızı kolaylaştırır',
      icon: 'star',
    },
  ];

  const employerTips = [
    {
      title: 'Detaylı İlan Oluşturun',
      description: 'Net iş tanımı, kaliteli başvurular getirir',
      icon: 'briefcase',
    },
    {
      title: 'Başvuruları İnceleyin',
      description: 'Hızlı yanıt veren işverenler tercih edilir',
      icon: 'check',
    },
  ];

  if (userType === 'architect' || userType === 'firm') {
    return [...commonTips, ...architectTips];
  } else if (userType === 'employer') {
    return [...commonTips, ...employerTips];
  }
  
  return commonTips;
}

export default router;
