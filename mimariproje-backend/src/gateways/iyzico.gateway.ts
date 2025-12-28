import crypto from 'crypto';
import axios from 'axios';
import { 
  PaymentGatewayConfig, 
  PaymentRequest, 
  PaymentResult, 
  RefundRequest, 
  RefundResult 
} from '../types/payment.types';

/**
 * iyzico Payment Gateway Implementation
 * Documentation: https://dev.iyzipay.com/
 */
export class IyzicoGateway {
  private config: NonNullable<PaymentGatewayConfig['iyzico']>;

  constructor(config: NonNullable<PaymentGatewayConfig['iyzico']>) {
    this.config = config;
  }

  private generateAuthorizationHeader(request: any): string {
    const randomString = Date.now().toString() + Math.random().toString(36).substring(7);
    const requestString = JSON.stringify(request);
    const hashString = this.config.apiKey + randomString + this.config.secretKey + requestString;
    const hash = crypto.createHash('sha1').update(hashString).digest('base64');
    return `IYZWS ${this.config.apiKey}:${hash}`;
  }

  private generatePKIString(params: Record<string, any>): string {
    let pki = '[';
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          pki += `${key}=${this.generatePKIString(value)},`;
        } else {
          pki += `${key}=${value},`;
        }
      }
    });
    pki = pki.slice(0, -1) + ']';
    return pki;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const conversationId = `MP_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const payload = {
        locale: 'tr',
        conversationId,
        price: request.amount.toString(),
        paidPrice: request.amount.toString(),
        currency: request.currency || 'TRY',
        installment: '1',
        basketId: `basket_${request.projectId || Date.now()}`,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        paymentCard: request.cardInfo ? {
          cardHolderName: request.cardInfo.cardHolderName,
          cardNumber: request.cardInfo.cardNumber,
          expireMonth: request.cardInfo.expireMonth,
          expireYear: request.cardInfo.expireYear,
          cvc: request.cardInfo.cvc,
          registerCard: '0',
        } : undefined,
        buyer: {
          id: `buyer_${request.buyerId}`,
          name: request.buyerInfo.name,
          surname: request.buyerInfo.surname,
          email: request.buyerInfo.email,
          gsmNumber: request.buyerInfo.phone || '+905000000000',
          identityNumber: '11111111111', // TC Kimlik - required by iyzico
          registrationAddress: request.buyerInfo.address || 'Istanbul',
          city: request.buyerInfo.city || 'Istanbul',
          country: request.buyerInfo.country || 'Turkey',
          ip: request.buyerInfo.ip || '127.0.0.1',
        },
        shippingAddress: {
          contactName: `${request.buyerInfo.name} ${request.buyerInfo.surname}`,
          city: request.buyerInfo.city || 'Istanbul',
          country: request.buyerInfo.country || 'Turkey',
          address: request.buyerInfo.address || 'Istanbul',
        },
        billingAddress: {
          contactName: `${request.buyerInfo.name} ${request.buyerInfo.surname}`,
          city: request.buyerInfo.city || 'Istanbul',
          country: request.buyerInfo.country || 'Turkey',
          address: request.buyerInfo.address || 'Istanbul',
        },
        basketItems: [
          {
            id: `item_${request.projectId || Date.now()}`,
            name: request.description,
            category1: 'Mimari Proje',
            itemType: 'VIRTUAL',
            price: request.amount.toString(),
          },
        ],
        callbackUrl: request.callbackUrl,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/payment/3dsecure/initialize`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.generateAuthorizationHeader(payload),
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          paymentId: response.data.paymentId,
          conversationId,
          status: response.data.status,
          redirectUrl: response.data.threeDSHtmlContent, // Base64 encoded 3D Secure page
        };
      } else {
        return {
          success: false,
          errorCode: response.data.errorCode,
          errorMessage: response.data.errorMessage,
        };
      }
    } catch (error: any) {
      console.error('iyzico payment error:', error);
      return {
        success: false,
        errorCode: 'IYZICO_ERROR',
        errorMessage: error.message,
      };
    }
  }

  async completePayment(paymentId: string): Promise<PaymentResult> {
    try {
      const payload = {
        locale: 'tr',
        conversationId: `complete_${Date.now()}`,
        paymentId,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/payment/3dsecure/auth`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.generateAuthorizationHeader(payload),
          },
        }
      );

      return {
        success: response.data.status === 'success',
        paymentId: response.data.paymentId,
        status: response.data.status,
        message: response.data.status === 'success' ? 'Ödeme başarılı' : response.data.errorMessage,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
      };
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'IYZICO_ERROR',
        errorMessage: error.message,
      };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    try {
      const payload = {
        locale: 'tr',
        conversationId: `refund_${Date.now()}`,
        paymentTransactionId: request.paymentId,
        price: request.amount?.toString(),
        reason: request.reason || 'other',
        description: request.reason || 'İade talebi',
      };

      const response = await axios.post(
        `${this.config.baseUrl}/payment/refund`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.generateAuthorizationHeader(payload),
          },
        }
      );

      return {
        success: response.data.status === 'success',
        refundId: response.data.paymentTransactionId,
        message: response.data.status === 'success' ? 'İade başarılı' : response.data.errorMessage,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
      };
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'IYZICO_ERROR',
        errorMessage: error.message,
      };
    }
  }
}
