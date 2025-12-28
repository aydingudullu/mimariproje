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
 * PayTR Payment Gateway Implementation
 * Documentation: https://dev.paytr.com/
 */
export class PayTRGateway {
  private config: NonNullable<PaymentGatewayConfig['paytr']>;

  constructor(config: NonNullable<PaymentGatewayConfig['paytr']>) {
    this.config = config;
  }

  private generateHash(data: string): string {
    return crypto
      .createHmac('sha256', this.config.merchantKey)
      .update(data + this.config.merchantSalt)
      .digest('base64');
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const merchantOid = `MP_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const userBasket = [
        [request.description, request.amount.toFixed(2), 1]
      ];
      const userBasketStr = Buffer.from(JSON.stringify(userBasket)).toString('base64');
      
      const paymentAmount = Math.round(request.amount * 100); // PayTR uses kuruş
      const noInstallment = 1;
      const maxInstallment = 0;
      const currency = request.currency === 'TRY' ? 'TL' : request.currency;
      const testMode = this.config.baseUrl.includes('test') ? '1' : '0';
      const debugOn = '0';
      
      // Hash string for PayTR
      const hashStr = [
        this.config.merchantId,
        request.buyerInfo.ip || '127.0.0.1',
        merchantOid,
        request.buyerInfo.email,
        paymentAmount.toString(),
        userBasketStr,
        noInstallment.toString(),
        maxInstallment.toString(),
        currency,
        testMode,
      ].join('');

      const paytrToken = this.generateHash(hashStr);

      const formData = new URLSearchParams();
      formData.append('merchant_id', this.config.merchantId);
      formData.append('user_ip', request.buyerInfo.ip || '127.0.0.1');
      formData.append('merchant_oid', merchantOid);
      formData.append('email', request.buyerInfo.email);
      formData.append('payment_amount', paymentAmount.toString());
      formData.append('paytr_token', paytrToken);
      formData.append('user_basket', userBasketStr);
      formData.append('debug_on', debugOn);
      formData.append('no_installment', noInstallment.toString());
      formData.append('max_installment', maxInstallment.toString());
      formData.append('user_name', `${request.buyerInfo.name} ${request.buyerInfo.surname}`);
      formData.append('user_address', request.buyerInfo.address || 'Istanbul');
      formData.append('user_phone', request.buyerInfo.phone || '05000000000');
      formData.append('merchant_ok_url', request.callbackUrl + '?status=success');
      formData.append('merchant_fail_url', request.callbackUrl + '?status=fail');
      formData.append('timeout_limit', '30');
      formData.append('currency', currency);
      formData.append('test_mode', testMode);
      formData.append('lang', 'tr');

      const response = await axios.post(
        `${this.config.baseUrl}/odeme/api/get-token`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          paymentId: merchantOid,
          conversationId: merchantOid,
          status: 'pending',
          redirectUrl: `https://www.paytr.com/odeme/guvenli/${response.data.token}`,
        };
      } else {
        return {
          success: false,
          errorCode: 'PAYTR_ERROR',
          errorMessage: response.data.reason || 'PayTR ödeme başlatılamadı',
        };
      }
    } catch (error: any) {
      console.error('PayTR payment error:', error);
      return {
        success: false,
        errorCode: 'PAYTR_ERROR',
        errorMessage: error.message,
      };
    }
  }

  async verifyCallback(params: {
    merchant_oid: string;
    status: string;
    total_amount: string;
    hash: string;
  }): Promise<PaymentResult> {
    try {
      // Verify hash
      const hashStr = [
        params.merchant_oid,
        this.config.merchantSalt,
        params.status,
        params.total_amount,
      ].join('');

      const expectedHash = crypto
        .createHmac('sha256', this.config.merchantKey)
        .update(hashStr)
        .digest('base64');

      if (params.hash !== expectedHash) {
        return {
          success: false,
          errorCode: 'INVALID_HASH',
          errorMessage: 'Callback doğrulama başarısız',
        };
      }

      return {
        success: params.status === 'success',
        paymentId: params.merchant_oid,
        status: params.status,
        message: params.status === 'success' ? 'Ödeme başarılı' : 'Ödeme başarısız',
      };
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'PAYTR_ERROR',
        errorMessage: error.message,
      };
    }
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    try {
      const hashStr = [
        this.config.merchantId,
        request.paymentId,
        request.amount ? Math.round(request.amount * 100).toString() : '',
      ].join('');

      const paytrToken = this.generateHash(hashStr);

      const formData = new URLSearchParams();
      formData.append('merchant_id', this.config.merchantId);
      formData.append('merchant_oid', request.paymentId);
      formData.append('paytr_token', paytrToken);
      if (request.amount) {
        formData.append('return_amount', Math.round(request.amount * 100).toString());
      }

      const response = await axios.post(
        `${this.config.baseUrl}/odeme/iade`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          refundId: request.paymentId,
          message: 'İade başarılı',
        };
      } else {
        return {
          success: false,
          errorCode: 'PAYTR_ERROR',
          errorMessage: response.data.err_msg || 'İade başarısız',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        errorCode: 'PAYTR_ERROR',
        errorMessage: error.message,
      };
    }
  }
}
