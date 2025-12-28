import { prisma } from '../lib/prisma';

// Matches database enum notificationtype
export type NotificationType = 
  | 'MESSAGE'
  | 'PROJECT_LIKE'
  | 'PROJECT_COMMENT'
  | 'JOB_APPLICATION'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'PROJECT_APPROVED'
  | 'PROJECT_REJECTED'
  | 'PROFILE_VERIFIED';

interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  relatedJobId?: number;
  relatedProjectId?: number;
  extraData?: Record<string, any>;
}

export class NotificationService {
  /**
   * Yeni bildirim oluştur
   */
  static async createNotification(data: CreateNotificationData) {
    // Check if user has notifications enabled
    const prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: data.userId },
    });

    // If preferences exist and in-app is disabled, skip
    if (prefs && prefs.in_app_enabled === false) {
      return null;
    }

    return prisma.notifications.create({
      data: {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.actionUrl,
        extra_data: data.extraData ? JSON.stringify(data.extraData) : null,
        related_job_id: data.relatedJobId,
        related_project_id: data.relatedProjectId,
        is_read: false,
        is_sent: true,
        created_at: new Date(),
      },
    });
  }

  /**
   * İş başvurusu bildirimi gönder
   */
  static async sendJobApplicationNotification(
    employerId: number,
    applicantName: string,
    jobTitle: string,
    jobId: number,
    applicationId: number
  ) {
    return this.createNotification({
      userId: employerId,
      type: 'JOB_APPLICATION',
      title: 'Yeni İş Başvurusu',
      message: `${applicantName} "${jobTitle}" ilanınıza başvurdu`,
      actionUrl: `/is-ilanlari/${jobId}`,
      relatedJobId: jobId,
      extraData: { applicationId },
    });
  }

  /**
   * Ödeme bildirimi gönder
   */
  static async sendPaymentNotification(
    userId: number,
    success: boolean,
    amount: number,
    projectTitle?: string
  ) {
    return this.createNotification({
      userId,
      type: success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      title: success ? 'Ödeme Başarılı' : 'Ödeme Başarısız',
      message: success 
        ? `${amount} TL tutarında ödemeniz başarıyla alındı${projectTitle ? ` (${projectTitle})` : ''}`
        : `${amount} TL tutarında ödemeniz başarısız oldu`,
      actionUrl: '/profilim/odemeler',
    });
  }

  static async getNotifications(userId: number, options: { unreadOnly?: boolean; limit?: number; offset?: number; type?: string }) {
    const where: any = { user_id: userId };
    
    if (options.unreadOnly) {
      where.is_read = false;
    }
    
    if (options.type) {
      where.type = options.type;
    }

    const notifications = await prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: options.limit || 20,
      skip: options.offset || 0,
    });

    const unreadCount = await prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });

    return { notifications, unread_count: unreadCount };
  }

  static async getUnreadCount(userId: number) {
    const count = await prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });
    return { unread_count: count };
  }

  static async markAsRead(userId: number, notificationId: number) {
    const notification = await prisma.notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    return prisma.notifications.update({
      where: { id: notificationId },
      data: { is_read: true, read_at: new Date() },
    });
  }

  static async markAllAsRead(userId: number) {
    return prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
  }

  static async deleteNotification(userId: number, notificationId: number) {
    const notification = await prisma.notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    return prisma.notifications.delete({
      where: { id: notificationId },
    });
  }

  static async getPreferences(userId: number) {
    let prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId },
    });

    if (!prefs) {
      // Create default preferences if not exists
      prefs = await prisma.notification_preferences.create({
        data: {
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          in_app_enabled: true,
        },
      });
    }

    return prefs;
  }

  static async updatePreferences(userId: number, data: any) {
    return prisma.notification_preferences.upsert({
      where: { user_id: userId },
      update: data,
      create: {
        user_id: userId,
        ...data,
      },
    });
  }
}
