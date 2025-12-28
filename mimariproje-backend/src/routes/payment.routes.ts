import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentGatewayController } from '../controllers/payment.gateway.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/subscription-plans', PaymentController.getSubscriptionPlans);

// Webhook/callback routes (no auth - called by payment gateways)
router.post('/callback', PaymentGatewayController.handleCallback);
router.get('/callback', PaymentGatewayController.handleCallback);

// Protected routes
router.use(authenticate);

router.get('/my-subscription', PaymentController.getMySubscription);

// Legacy subscription routes
router.post('/create-subscription-payment', PaymentController.createSubscriptionPayment);
router.post('/create-project-boost-payment', PaymentController.createProjectBoostPayment);

// New unified payment routes
router.post('/create', PaymentGatewayController.createPayment);
router.post('/escrow/:escrowId/release', PaymentGatewayController.releaseEscrow);
router.post('/escrow/:escrowId/dispute', PaymentGatewayController.openDispute);
router.post('/escrow/:escrowId/refund', PaymentGatewayController.refund);

// Admin gateway settings
router.get('/gateways', PaymentGatewayController.getGateways);
router.put('/gateways/settings', PaymentGatewayController.updateSettings);

export default router;
