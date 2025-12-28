import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentController {
  static async createSubscriptionPayment(req: AuthRequest, res: Response) {
    try {
      const { plan_type } = req.body;
      const userId = req.user!.id;

      // Define prices for plans (mock)
      let amount = 0;
      if (plan_type === 'basic') amount = 100;
      if (plan_type === 'pro') amount = 200;

      const result = await PaymentService.createPayment({
        amount,
        currency: 'TRY',
        description: `Subscription - ${plan_type}`,
        userId,
        metadata: { plan_type },
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async createProjectBoostPayment(req: AuthRequest, res: Response) {
    try {
      const { project_id } = req.body;
      const userId = req.user!.id;

      const result = await PaymentService.createPayment({
        amount: 50, // Fixed price for boost
        currency: 'TRY',
        description: `Project Boost - ${project_id}`,
        userId,
        metadata: { project_id },
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
  
  static async getSubscriptionPlans(req: Request, res: Response) {
      res.json({
          success: true,
          data: {
              plans: [
                  { id: 'basic', name: 'Basic Plan', price: 100, currency: 'TRY' },
                  { id: 'pro', name: 'Pro Plan', price: 200, currency: 'TRY' }
              ],
              currency: 'TRY'
          }
      });
  }

  static async getMySubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const subscription = await PaymentService.getUserSubscription(userId);
      res.json({ success: true, data: { subscription } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
