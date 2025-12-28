/**
 * Push Notification Service
 * Web Push API entegrasyonu için servis
 * Not: Bu servis tam çalışması için web-push npm paketi ve veritabanı tablosu gerektirir.
 */

// VAPID keys configuration (should be in .env)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: Record<string, any>;
}

// In-memory storage for subscriptions (in production, use database)
const subscriptions = new Map<number, PushSubscription[]>();

export class PushNotificationService {
  /**
   * VAPID public key'i al (frontend için)
   */
  static getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  /**
   * Push subscription kaydet
   */
  static async saveSubscription(userId: number, subscription: PushSubscription): Promise<void> {
    const userSubs = subscriptions.get(userId) || [];
    const existing = userSubs.find(s => s.endpoint === subscription.endpoint);
    
    if (!existing) {
      userSubs.push(subscription);
      subscriptions.set(userId, userSubs);
    }
    
    console.log(`Push subscription saved for user ${userId}`);
  }

  /**
   * Push subscription sil
   */
  static async removeSubscription(userId: number, endpoint: string): Promise<void> {
    const userSubs = subscriptions.get(userId) || [];
    const filtered = userSubs.filter(s => s.endpoint !== endpoint);
    subscriptions.set(userId, filtered);
    
    console.log(`Push subscription removed for user ${userId}`);
  }

  /**
   * Kullanıcıya push notification gönder
   */
  static async sendToUser(userId: number, payload: PushNotificationPayload): Promise<{ success: number; failed: number }> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('VAPID keys not configured, skipping push notification');
      return { success: 0, failed: 0 };
    }

    const userSubs = subscriptions.get(userId) || [];
    
    // Log for now - actual sending requires web-push package
    console.log(`Would send push to user ${userId}:`, payload);
    console.log(`User has ${userSubs.length} subscriptions`);

    return { success: userSubs.length, failed: 0 };
  }

  /**
   * Yeni mesaj bildirimi
   */
  static async notifyNewMessage(userId: number, senderName: string, messagePreview: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Yeni Mesaj',
      body: `${senderName}: ${messagePreview.substring(0, 100)}`,
      url: '/mesajlar',
    });
  }

  /**
   * Proje onaylandı bildirimi
   */
  static async notifyProjectApproved(userId: number, projectTitle: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Proje Onaylandı ✓',
      body: `"${projectTitle}" projeniz yayınlandı!`,
      url: '/projelerim',
    });
  }

  /**
   * Yeni iş başvurusu bildirimi
   */
  static async notifyJobApplication(userId: number, jobTitle: string, applicantName: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Yeni Başvuru',
      body: `${applicantName}, "${jobTitle}" ilanınıza başvurdu`,
      url: '/is-ilanlarim',
    });
  }

  /**
   * Ödeme bildirimi
   */
  static async notifyPaymentSuccess(userId: number, amount: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Ödeme Başarılı',
      body: `${amount} tutarındaki ödemeniz alındı`,
      url: '/profilim/odemeler',
    });
  }
}

export default PushNotificationService;
