import { prisma } from '../lib/prisma';

export class PaymentService {
  // Simulate creating a payment intent/session
  static async createPayment(data: {
    amount: number;
    currency: string;
    description: string;
    userId: number;
    metadata?: any;
  }) {
    // In a real app, you would call Iyzico or Stripe API here
    // For now, we simulate a successful "payment intent" creation
    
    const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
    
    // We can log this "pending" payment to DB if we had a Payment model
    // For now, just return the mock data needed by frontend
    
    return {
      paymentId,
      status: 'pending',
      amount: data.amount,
      currency: data.currency,
      checkoutUrl: `http://localhost:3000/satin-al/basarili/${paymentId}?mock=true`, // Redirect back to success page
    };
  }

  // Simulate payment callback/webhook
  static async handleCallback(paymentId: string) {
    // Verify payment status with provider
    // Update local DB
    
    return {
      paymentId,
      status: 'success',
      paidAt: new Date(),
    };
  }

  /**
   * Kullanıcının işlem geçmişini getir
   */
  static async getTransactionHistory(
    userId: number, 
    options?: { 
      status?: string; 
      startDate?: Date; 
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { user_id: userId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.startDate || options?.endDate) {
      where.created_at = {};
      if (options?.startDate) {
        where.created_at.gte = options.startDate;
      }
      if (options?.endDate) {
        where.created_at.lte = options.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.payments.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
        include: {
          projects: {
            select: {
              id: true,
              title: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.payments.count({ where }),
    ]);

    // Calculate summary stats
    const stats = await prisma.payments.aggregate({
      where: { user_id: userId, status: 'completed' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      transactions,
      pagination: {
        total,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      },
      summary: {
        totalTransactions: stats._count,
        totalAmount: Number(stats._sum.amount) || 0,
      },
    };
  }
  static async getUserSubscription(userId: number) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { subscription_type: true, created_at: true },
    });

    if (!user) return null;

    // TODO: Gerçek abonelik bitiş tarihini payments tablosundan veya users tablosundaki bir alandan al
    // Şimdilik mock data dönüyoruz
    const subscription = {
      plan_type: user.subscription_type || 'free',
      status: 'active',
      monthly_price: user.subscription_type === 'pro' ? 200 : (user.subscription_type === 'basic' ? 100 : 0),
      currency: 'TRY',
      is_active: true,
      days_until_expiry: 30, // Mock
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return subscription;
  }
}

