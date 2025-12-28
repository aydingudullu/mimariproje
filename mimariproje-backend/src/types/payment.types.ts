// Payment Gateway Configuration Types

export type PaymentGateway = 'iyzico' | 'paytr';

export interface PaymentGatewayConfig {
  gateway: PaymentGateway;
  iyzico?: {
    apiKey: string;
    secretKey: string;
    baseUrl: string; // https://sandbox-api.iyzipay.com or https://api.iyzipay.com
  };
  paytr?: {
    merchantId: string;
    merchantKey: string;
    merchantSalt: string;
    baseUrl: string;
  };
  commissionRate: number; // 0.10 to 0.15 (10-15%)
  currency: string; // TRY
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  buyerId: number;
  sellerId: number;
  projectId?: number;
  description: string;
  buyerInfo: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    ip?: string;
  };
  cardInfo?: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  callbackUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  conversationId?: string;
  status?: string;
  message?: string;
  redirectUrl?: string; // For 3D Secure
  errorCode?: string;
  errorMessage?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
}
