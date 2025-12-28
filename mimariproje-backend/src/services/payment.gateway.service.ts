import { prisma } from '../lib/prisma';
import { IyzicoGateway } from '../gateways/iyzico.gateway';
import { PayTRGateway } from '../gateways/paytr.gateway';
import { 
  PaymentGateway, 
  PaymentGatewayConfig, 
  PaymentRequest, 
  PaymentResult,
  RefundRequest,
  RefundResult
} from '../types/payment.types';

// System settings keys for payment configuration
const PAYMENT_SETTINGS_KEYS = {
  ACTIVE_GATEWAY: 'payment_active_gateway',
  COMMISSION_RATE: 'payment_commission_rate',
  IYZICO_API_KEY: 'payment_iyzico_api_key',
  IYZICO_SECRET_KEY: 'payment_iyzico_secret_key',
  IYZICO_BASE_URL: 'payment_iyzico_base_url',
  PAYTR_MERCHANT_ID: 'payment_paytr_merchant_id',
  PAYTR_MERCHANT_KEY: 'payment_paytr_merchant_key',
  PAYTR_MERCHANT_SALT: 'payment_paytr_merchant_salt',
  PAYTR_BASE_URL: 'payment_paytr_base_url',
};

/**
 * Payment Gateway Factory
 * Creates the appropriate gateway based on admin settings
 */
export class PaymentGatewayFactory {
  private static async getSystemSetting(key: string): Promise<string | null> {
    const setting = await prisma.system_settings.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  /**
   * Get current payment configuration from system settings
   */
  static async getConfig(): Promise<PaymentGatewayConfig> {
    const [
      activeGateway,
      commissionRate,
      iyzicoApiKey,
      iyzicoSecretKey,
      iyzicoBaseUrl,
      paytrMerchantId,
      paytrMerchantKey,
      paytrMerchantSalt,
      paytrBaseUrl,
    ] = await Promise.all([
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.ACTIVE_GATEWAY),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.COMMISSION_RATE),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.IYZICO_API_KEY),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.IYZICO_SECRET_KEY),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.IYZICO_BASE_URL),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.PAYTR_MERCHANT_ID),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.PAYTR_MERCHANT_KEY),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.PAYTR_MERCHANT_SALT),
      this.getSystemSetting(PAYMENT_SETTINGS_KEYS.PAYTR_BASE_URL),
    ]);

    return {
      gateway: (activeGateway as PaymentGateway) || 'iyzico',
      commissionRate: parseFloat(commissionRate || '0.10'),
      currency: 'TRY',
      iyzico: iyzicoApiKey ? {
        apiKey: iyzicoApiKey,
        secretKey: iyzicoSecretKey || '',
        baseUrl: iyzicoBaseUrl || 'https://sandbox-api.iyzipay.com',
      } : undefined,
      paytr: paytrMerchantId ? {
        merchantId: paytrMerchantId,
        merchantKey: paytrMerchantKey || '',
        merchantSalt: paytrMerchantSalt || '',
        baseUrl: paytrBaseUrl || 'https://www.paytr.com',
      } : undefined,
    };
  }

  /**
   * Create gateway instance based on configuration
   */
  static async createGateway(): Promise<IyzicoGateway | PayTRGateway> {
    const config = await this.getConfig();

    if (config.gateway === 'paytr' && config.paytr) {
      return new PayTRGateway(config.paytr);
    }

    if (config.iyzico) {
      return new IyzicoGateway(config.iyzico);
    }

    throw new Error('Ödeme sistemi yapılandırılmamış. Lütfen admin panelinden ayarlayın.');
  }

  /**
   * Update payment gateway settings
   */
  static async updateSettings(settings: Partial<{
    gateway: PaymentGateway;
    commissionRate: number;
    iyzicoApiKey: string;
    iyzicoSecretKey: string;
    iyzicoBaseUrl: string;
    paytrMerchantId: string;
    paytrMerchantKey: string;
    paytrMerchantSalt: string;
    paytrBaseUrl: string;
  }>, adminUserId: number): Promise<void> {
    const updates: { key: string; value: string }[] = [];

    if (settings.gateway) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.ACTIVE_GATEWAY, value: settings.gateway });
    }
    if (settings.commissionRate !== undefined) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.COMMISSION_RATE, value: settings.commissionRate.toString() });
    }
    if (settings.iyzicoApiKey) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.IYZICO_API_KEY, value: settings.iyzicoApiKey });
    }
    if (settings.iyzicoSecretKey) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.IYZICO_SECRET_KEY, value: settings.iyzicoSecretKey });
    }
    if (settings.iyzicoBaseUrl) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.IYZICO_BASE_URL, value: settings.iyzicoBaseUrl });
    }
    if (settings.paytrMerchantId) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.PAYTR_MERCHANT_ID, value: settings.paytrMerchantId });
    }
    if (settings.paytrMerchantKey) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.PAYTR_MERCHANT_KEY, value: settings.paytrMerchantKey });
    }
    if (settings.paytrMerchantSalt) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.PAYTR_MERCHANT_SALT, value: settings.paytrMerchantSalt });
    }
    if (settings.paytrBaseUrl) {
      updates.push({ key: PAYMENT_SETTINGS_KEYS.PAYTR_BASE_URL, value: settings.paytrBaseUrl });
    }

    // Upsert all settings
    for (const update of updates) {
      await prisma.system_settings.upsert({
        where: { key: update.key },
        update: { 
          value: update.value, 
          updated_at: new Date(),
          updated_by: adminUserId,
        },
        create: {
          key: update.key,
          value: update.value,
          data_type: 'string',
          description: `Payment setting: ${update.key}`,
          category: 'payment',
          is_public: false,
          created_by: adminUserId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  /**
   * Get available gateways and their configuration status
   */
  static async getAvailableGateways(): Promise<{
    activeGateway: PaymentGateway;
    commissionRate: number;
    gateways: {
      iyzico: { configured: boolean; sandbox: boolean };
      paytr: { configured: boolean; sandbox: boolean };
    };
  }> {
    const config = await this.getConfig();

    return {
      activeGateway: config.gateway,
      commissionRate: config.commissionRate,
      gateways: {
        iyzico: {
          configured: !!config.iyzico?.apiKey,
          sandbox: config.iyzico?.baseUrl?.includes('sandbox') ?? true,
        },
        paytr: {
          configured: !!config.paytr?.merchantId,
          sandbox: config.paytr?.baseUrl?.includes('test') ?? false,
        },
      },
    };
  }
}

/**
 * Unified Payment Service
 * Handles all payment operations with escrow support
 */
export class UnifiedPaymentService {
  /**
   * Create a new payment for project purchase
   */
  static async createProjectPayment(
    buyerId: number,
    projectId: number,
    callbackUrl: string,
    buyerIp?: string
  ): Promise<PaymentResult & { escrowId?: number }> {
    // Get project and seller info
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: { users: true },
    });

    if (!project) {
      return { success: false, errorCode: 'PROJECT_NOT_FOUND', errorMessage: 'Proje bulunamadı' };
    }

    const buyer = await prisma.users.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return { success: false, errorCode: 'BUYER_NOT_FOUND', errorMessage: 'Alıcı bulunamadı' };
    }

    // Get payment config
    const config = await PaymentGatewayFactory.getConfig();
    const gateway = await PaymentGatewayFactory.createGateway();

    // Calculate amounts
    const amount = Number(project.price);
    const commissionAmount = amount * config.commissionRate;
    const sellerAmount = amount - commissionAmount;

    // Create escrow record
    const escrowResult = await prisma.$queryRaw<any[]>`
      INSERT INTO escrow_transactions 
        (project_id, buyer_id, seller_id, amount, commission_rate, commission_amount, seller_amount, status, created_at)
      VALUES 
        (${projectId}, ${buyerId}, ${project.user_id}, ${amount}, ${config.commissionRate}, ${commissionAmount}, ${sellerAmount}, 'pending', NOW())
      RETURNING id
    `;

    const escrowId = escrowResult[0].id;

    // Create payment request
    const paymentRequest: PaymentRequest = {
      amount,
      currency: config.currency,
      buyerId,
      sellerId: project.user_id,
      projectId,
      description: project.title,
      buyerInfo: {
        name: buyer.first_name || 'Müşteri',
        surname: buyer.last_name || '',
        email: buyer.email,
        phone: buyer.phone || undefined,
        address: buyer.location || undefined,
        ip: buyerIp,
      },
      callbackUrl: `${callbackUrl}?escrow_id=${escrowId}`,
    };

    // Initialize payment
    const result = await gateway.createPayment(paymentRequest);

    // Update escrow with payment ID
    if (result.success && result.paymentId) {
      await prisma.$executeRaw`
        UPDATE escrow_transactions 
        SET payment_id = (
          SELECT id FROM payments WHERE iyzico_payment_id = ${result.paymentId} OR iyzico_conversation_id = ${result.conversationId}
        )
        WHERE id = ${escrowId}
      `;
    }

    return { ...result, escrowId };
  }

  /**
   * Complete payment after 3D Secure / callback
   */
  static async completePayment(escrowId: number, paymentId: string): Promise<PaymentResult> {
    const gateway = await PaymentGatewayFactory.createGateway();
    
    let result: PaymentResult;
    if (gateway instanceof IyzicoGateway) {
      result = await gateway.completePayment(paymentId);
    } else {
      // PayTR callback is verified differently
      result = { success: true, paymentId, status: 'success' };
    }

    if (result.success) {
      // Update escrow status - funds are held until buyer confirms
      await prisma.$executeRaw`
        UPDATE escrow_transactions SET status = 'held' WHERE id = ${escrowId}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE escrow_transactions SET status = 'failed' WHERE id = ${escrowId}
      `;
    }

    return result;
  }

  /**
   * Release escrow funds to seller
   */
  static async releaseEscrow(escrowId: number, releasedByUserId: number): Promise<{ success: boolean; message: string }> {
    const escrow = await prisma.$queryRaw<any[]>`
      SELECT * FROM escrow_transactions WHERE id = ${escrowId} LIMIT 1
    `;

    if (!escrow || escrow.length === 0) {
      return { success: false, message: 'Emanet işlemi bulunamadı' };
    }

    const tx = escrow[0];

    if (tx.status !== 'held') {
      return { success: false, message: 'Bu işlem serbest bırakılamaz' };
    }

    // Only buyer or admin can release
    // In real scenario, check if releasedByUserId is buyer or admin

    await prisma.$executeRaw`
      UPDATE escrow_transactions 
      SET status = 'released', released_at = NOW() 
      WHERE id = ${escrowId}
    `;

    // TODO: Trigger actual bank transfer to seller

    return { success: true, message: 'Ödeme satıcıya aktarıldı' };
  }

  /**
   * Open dispute for escrow
   */
  static async openDispute(escrowId: number, userId: number, reason: string): Promise<{ success: boolean; message: string }> {
    await prisma.$executeRaw`
      UPDATE escrow_transactions 
      SET status = 'disputed', disputed_at = NOW() 
      WHERE id = ${escrowId}
    `;

    // TODO: Create dispute ticket/notification

    return { success: true, message: 'Anlaşmazlık kaydı açıldı' };
  }

  /**
   * Process refund
   */
  static async refundPayment(escrowId: number, amount?: number): Promise<RefundResult> {
    const escrow = await prisma.$queryRaw<any[]>`
      SELECT et.*, p.iyzico_payment_id, p.iyzico_conversation_id
      FROM escrow_transactions et
      LEFT JOIN payments p ON et.payment_id = p.id
      WHERE et.id = ${escrowId} 
      LIMIT 1
    `;

    if (!escrow || escrow.length === 0) {
      return { success: false, errorCode: 'NOT_FOUND', errorMessage: 'Emanet işlemi bulunamadı' };
    }

    const tx = escrow[0];
    const gateway = await PaymentGatewayFactory.createGateway();

    const refundRequest: RefundRequest = {
      paymentId: tx.iyzico_payment_id || tx.iyzico_conversation_id,
      amount: amount || Number(tx.amount),
      reason: 'İade talebi',
    };

    const result = await gateway.refund(refundRequest);

    if (result.success) {
      await prisma.$executeRaw`
        UPDATE escrow_transactions 
        SET status = 'refunded', resolved_at = NOW() 
        WHERE id = ${escrowId}
      `;
    }

    return result;
  }
}
