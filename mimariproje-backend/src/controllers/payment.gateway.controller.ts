import { Request, Response } from 'express';
import { z } from 'zod';
import { PaymentGatewayFactory, UnifiedPaymentService } from '../services/payment.gateway.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PaymentGateway } from '../types/payment.types';

// Validation schemas
const updatePaymentSettingsSchema = z.object({
  gateway: z.enum(['iyzico', 'paytr']).optional(),
  commissionRate: z.number().min(0).max(0.30).optional(),
  iyzicoApiKey: z.string().optional(),
  iyzicoSecretKey: z.string().optional(),
  iyzicoBaseUrl: z.string().url().optional(),
  paytrMerchantId: z.string().optional(),
  paytrMerchantKey: z.string().optional(),
  paytrMerchantSalt: z.string().optional(),
  paytrBaseUrl: z.string().url().optional(),
});

const createPaymentSchema = z.object({
  projectId: z.number().positive(),
  callbackUrl: z.string().url(),
});

export class PaymentGatewayController {
  /**
   * Get available payment gateways (Admin)
   */
  static async getGateways(req: AuthRequest, res: Response) {
    try {
      const result = await PaymentGatewayFactory.getAvailableGateways();
      res.json(result);
    } catch (error: any) {
      console.error('Get gateways error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update payment settings (Admin only)
   */
  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Yetkiniz yok' });
      }

      const data = updatePaymentSettingsSchema.parse(req.body);
      await PaymentGatewayFactory.updateSettings(data, req.user.id);
      
      res.json({ message: 'Ödeme ayarları güncellendi' });
    } catch (error: any) {
      console.error('Update payment settings error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create payment for project purchase
   */
  static async createPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const data = createPaymentSchema.parse(req.body);
      const buyerIp = req.ip || req.socket.remoteAddress;

      const result = await UnifiedPaymentService.createProjectPayment(
        req.user.id,
        data.projectId,
        data.callbackUrl,
        buyerIp
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Create payment error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Doğrulama hatası', details: error.errors });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Payment callback handler (webhook)
   */
  static async handleCallback(req: Request, res: Response) {
    try {
      const { escrow_id, status, merchant_oid, hash, total_amount } = req.body;
      const escrowId = parseInt(escrow_id || req.query.escrow_id as string);

      if (!escrowId) {
        return res.status(400).json({ error: 'Escrow ID gerekli' });
      }

      // For PayTR callback verification
      if (merchant_oid && hash) {
        const { PayTRGateway } = await import('../gateways/paytr.gateway');
        const config = await PaymentGatewayFactory.getConfig();
        
        if (config.paytr) {
          const gateway = new PayTRGateway(config.paytr);
          const verifyResult = await gateway.verifyCallback({
            merchant_oid,
            status,
            total_amount,
            hash,
          });

          if (verifyResult.success) {
            await UnifiedPaymentService.completePayment(escrowId, merchant_oid);
            return res.send('OK');
          } else {
            return res.status(400).send('FAIL');
          }
        }
      }

      // For iyzico or other callbacks
      const paymentId = req.body.paymentId || req.query.paymentId;
      if (paymentId) {
        const result = await UnifiedPaymentService.completePayment(escrowId, paymentId);
        
        if (result.success) {
          // Redirect to success page
          return res.redirect(`${process.env.FRONTEND_URL}/satin-al/basarili?escrow_id=${escrowId}`);
        } else {
          return res.redirect(`${process.env.FRONTEND_URL}/satin-al/hata?escrow_id=${escrowId}`);
        }
      }

      res.status(400).json({ error: 'Geçersiz callback' });
    } catch (error: any) {
      console.error('Payment callback error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Release escrow funds to seller
   */
  static async releaseEscrow(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const escrowId = parseInt(req.params.escrowId);
      if (isNaN(escrowId)) {
        return res.status(400).json({ error: 'Geçersiz escrow ID' });
      }

      const result = await UnifiedPaymentService.releaseEscrow(escrowId, req.user.id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Release escrow error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Open dispute for escrow
   */
  static async openDispute(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const escrowId = parseInt(req.params.escrowId);
      const { reason } = req.body;

      if (isNaN(escrowId)) {
        return res.status(400).json({ error: 'Geçersiz escrow ID' });
      }

      const result = await UnifiedPaymentService.openDispute(escrowId, req.user.id, reason);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Open dispute error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Request refund
   */
  static async refund(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }

      const escrowId = parseInt(req.params.escrowId);
      const { amount } = req.body;

      if (isNaN(escrowId)) {
        return res.status(400).json({ error: 'Geçersiz escrow ID' });
      }

      const result = await UnifiedPaymentService.refundPayment(escrowId, amount);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
