import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middlewares/auth.middleware';
import { PaymentService } from '../services/payment.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/payments/history
 * Kullanıcının ödeme geçmişini getir
 */
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, startDate, endDate, limit, offset } = req.query;

    const options: any = {};
    if (status) options.status = status as string;
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);
    if (limit) options.limit = parseInt(limit as string);
    if (offset) options.offset = parseInt(offset as string);

    const result = await PaymentService.getTransactionHistory(userId, options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
