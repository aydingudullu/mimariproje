import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  first_name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
  user_type: z.enum(['freelancer', 'company', 'client']),
  company_name: z.string().optional(),
  profession: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token gereklidir'),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token gereklidir'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.register(data, ipAddress, userAgent);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Doğrulama hatası', 
          details: error.errors 
        });
      }
      
      res.status(400).json({ error: error.message || "Kayıt başarısız" });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.login(data, ipAddress, userAgent);
      res.json(result);
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Doğrulama hatası', 
          details: error.errors 
        });
      }
      
      res.status(401).json({ error: error.message || "Giriş başarısız" });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const data = refreshTokenSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      const result = await AuthService.refreshAccessToken(
        data.refresh_token, 
        ipAddress, 
        userAgent
      );
      res.json(result);
    } catch (error: any) {
      console.error("Token refresh error:", error);
      res.status(401).json({ error: error.message || "Token yenileme başarısız" });
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  static async logout(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      
      if (refresh_token) {
        await AuthService.logout(refresh_token);
      }
      
      res.json({ message: 'Çıkış yapıldı' });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }
      
      const result = await AuthService.logoutAll(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Logout all error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const data = passwordResetRequestSchema.parse(req.body);
      const result = await AuthService.requestPasswordReset(data.email);
      res.json(result);
    } catch (error: any) {
      console.error("Password reset request error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Doğrulama hatası', 
          details: error.errors 
        });
      }
      
      // Always return success for security
      res.json({ message: 'Eğer bu e-posta kayıtlı ise şifre sıfırlama bağlantısı gönderildi' });
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const data = passwordResetSchema.parse(req.body);
      const result = await AuthService.resetPassword(data.token, data.password);
      res.json(result);
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Doğrulama hatası', 
          details: error.errors 
        });
      }
      
      res.status(400).json({ error: error.message || "Şifre sıfırlama başarısız" });
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }
      
      const result = await AuthService.getCurrentUser(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Get current user error:", error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Doğrulama token\'ı gereklidir' });
      }
      
      const result = await AuthService.verifyEmail(token);
      res.json(result);
    } catch (error: any) {
      console.error("Email verification error:", error);
      res.status(400).json({ error: error.message || "E-posta doğrulama başarısız" });
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
      }
      
      const result = await AuthService.resendVerificationEmail(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Resend verification error:", error);
      res.status(400).json({ error: error.message || "E-posta gönderimi başarısız" });
    }
  }
}
