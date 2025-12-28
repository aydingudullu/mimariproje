import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { PushNotificationService } from '../services/push-notification.service';

const router = Router();

/**
 * GET /api/push/vapid-key
 * VAPID public key (frontend için)
 */
router.get('/vapid-key', (req, res: Response) => {
  const key = PushNotificationService.getVapidPublicKey();
  
  if (!key) {
    return res.status(503).json({ 
      success: false, 
      error: 'Push notifications henüz yapılandırılmamış' 
    });
  }

  res.json({
    success: true,
    data: { vapidPublicKey: key },
  });
});

/**
 * POST /api/push/subscribe
 * Push notification aboneliği kaydet
 */
router.post('/subscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ 
        success: false, 
        error: 'Geçersiz subscription verisi' 
      });
    }

    await PushNotificationService.saveSubscription(userId, subscription);

    res.json({
      success: true,
      message: 'Push notification aboneliği kaydedildi',
    });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/push/unsubscribe
 * Push notification aboneliğini kaldır
 */
router.post('/unsubscribe', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Endpoint gerekli' });
    }

    await PushNotificationService.removeSubscription(userId, endpoint);

    res.json({
      success: true,
      message: 'Push notification aboneliği kaldırıldı',
    });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/push/test
 * Test push notification (authenticated user only)
 */
router.post('/test', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await PushNotificationService.sendToUser(userId, {
      title: 'Test Bildirimi',
      body: 'Push notification sistemi çalışıyor!',
      url: '/',
    });

    res.json({
      success: true,
      data: result,
      message: result.success > 0 ? 'Test bildirimi gönderildi' : 'Aktif abonelik bulunamadı',
    });
  } catch (error: any) {
    console.error('Push test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
