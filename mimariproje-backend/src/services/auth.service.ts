import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { EmailService } from './email.service';

// Token expiry times
const ACCESS_TOKEN_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  user_type: string;
  company_name?: string;
  profession?: string;
  phone?: string;
  location?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData, ipAddress?: string, userAgent?: string) {
    const existingUser = await prisma.users.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.users.create({
      data: {
        email: data.email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        user_type: data.user_type,
        company_name: data.company_name,
        profession: data.profession,
        phone: data.phone,
        location: data.location,
        is_active: true,
        is_verified: false,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.user_type);
    const refreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);

    // Create and send email verification token
    const verificationToken = await this.createEmailVerificationToken(user.id);
    await EmailService.sendVerificationEmail(
      user.email,
      user.first_name || 'Kullanıcı',
      verificationToken
    );

    return {
      user: this.sanitizeUser(user),
      access_token: accessToken,
      refresh_token: refreshToken,
      message: 'Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.',
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginData, ipAddress?: string, userAgent?: string) {
    const email = data.email.toLowerCase();
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new Error('Geçersiz e-posta veya şifre');
    }

    if (user.is_banned) {
      throw new Error('Hesabınız askıya alınmıştır. Lütfen destek ile iletişime geçin.');
    }

    if (!user.is_active) {
      throw new Error('Hesabınız aktif değil');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Geçersiz e-posta veya şifre');
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.user_type);
    const refreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);

    return {
      user: this.sanitizeUser(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshTokenValue: string, ipAddress?: string, userAgent?: string) {
    // Find the refresh token
    const tokenRecord = await prisma.$queryRaw<any[]>`
      SELECT * FROM refresh_tokens 
      WHERE token = ${refreshTokenValue} 
      AND revoked_at IS NULL 
      AND expires_at > NOW()
      LIMIT 1
    `;

    if (!tokenRecord || tokenRecord.length === 0) {
      throw new Error('Geçersiz veya süresi dolmuş token');
    }

    const token = tokenRecord[0];

    // Get user
    const user = await prisma.users.findUnique({ where: { id: token.user_id } });
    if (!user || user.is_banned || !user.is_active) {
      throw new Error('Kullanıcı bulunamadı veya aktif değil');
    }

    // Revoke old refresh token
    await prisma.$executeRaw`
      UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ${token.id}
    `;

    // Generate new tokens
    const accessToken = this.generateAccessToken(user.id, user.user_type);
    const newRefreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  /**
   * Logout - revoke refresh token
   */
  static async logout(refreshTokenValue: string) {
    await prisma.$executeRaw`
      UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ${refreshTokenValue}
    `;
    return { message: 'Çıkış yapıldı' };
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(userId: number) {
    await prisma.$executeRaw`
      UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ${userId} AND revoked_at IS NULL
    `;
    return { message: 'Tüm cihazlardan çıkış yapıldı' };
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.users.findUnique({ where: { email: email.toLowerCase() } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'Eğer bu e-posta kayıtlı ise şifre sıfırlama bağlantısı gönderildi' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY);

    // Invalidate existing tokens
    await prisma.$executeRaw`
      UPDATE password_reset_tokens SET used_at = NOW() 
      WHERE user_id = ${user.id} AND used_at IS NULL
    `;

    // Create new token
    await prisma.$executeRaw`
      INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
      VALUES (${user.id}, ${resetToken}, ${expiresAt}, NOW())
    `;

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    return { 
      message: 'Eğer bu e-posta kayıtlı ise şifre sıfırlama bağlantısı gönderildi',
      // In development, return token for testing
      ...(env.NODE_ENV === 'development' && { token: resetToken })
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    const tokenRecord = await prisma.$queryRaw<any[]>`
      SELECT * FROM password_reset_tokens 
      WHERE token = ${token} 
      AND used_at IS NULL 
      AND expires_at > NOW()
      LIMIT 1
    `;

    if (!tokenRecord || tokenRecord.length === 0) {
      throw new Error('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı');
    }

    const record = tokenRecord[0];

    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Şifre en az 8 karakter olmalıdır');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.users.update({
      where: { id: record.user_id },
      data: { password_hash: hashedPassword, updated_at: new Date() },
    });

    // Mark token as used
    await prisma.$executeRaw`
      UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${record.id}
    `;

    // Revoke all refresh tokens (force re-login on all devices)
    await prisma.$executeRaw`
      UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ${record.user_id}
    `;

    return { message: 'Şifreniz başarıyla değiştirildi' };
  }

  /**
   * Create email verification token
   */
  private static async createEmailVerificationToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY);

    // Invalidate existing tokens
    await prisma.$executeRaw`
      DELETE FROM email_verification_tokens 
      WHERE user_id = ${userId}
    `;

    // Create new token
    await prisma.$executeRaw`
      INSERT INTO email_verification_tokens (user_id, token, expires_at, created_at)
      VALUES (${userId}, ${token}, ${expiresAt}, NOW())
    `;

    return token;
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string) {
    const tokenRecord = await prisma.$queryRaw<any[]>`
      SELECT * FROM email_verification_tokens 
      WHERE token = ${token} 
      AND used_at IS NULL 
      AND expires_at > NOW()
      LIMIT 1
    `;

    if (!tokenRecord || tokenRecord.length === 0) {
      throw new Error('Geçersiz veya süresi dolmuş doğrulama bağlantısı');
    }

    const record = tokenRecord[0];

    // Update user as verified
    const user = await prisma.users.update({
      where: { id: record.user_id },
      data: { 
        is_verified: true, 
        updated_at: new Date() 
      },
    });

    // Mark token as used
    await prisma.$executeRaw`
      UPDATE email_verification_tokens SET used_at = NOW() WHERE id = ${record.id}
    `;

    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, user.first_name || 'Kullanıcı');

    return { 
      message: 'E-posta adresiniz başarıyla doğrulandı!',
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(userId: number) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    if (user.is_verified) {
      throw new Error('E-posta adresiniz zaten doğrulanmış');
    }

    // Create new verification token
    const verificationToken = await this.createEmailVerificationToken(user.id);
    
    // Send email
    await EmailService.sendVerificationEmail(
      user.email,
      user.first_name || 'Kullanıcı',
      verificationToken
    );

    return { message: 'Doğrulama e-postası tekrar gönderildi' };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId: number) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }
    return { user: this.sanitizeUser(user) };
  }

  /**
   * Generate access token (short-lived)
   */
  private static generateAccessToken(userId: number, role: string): string {
    return jwt.sign(
      { id: userId, role },
      env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Generate and store refresh token (long-lived)
   */
  private static async generateRefreshToken(
    userId: number, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.$executeRaw`
      INSERT INTO refresh_tokens (user_id, token, device_info, ip_address, expires_at, created_at)
      VALUES (${userId}, ${token}, ${userAgent || null}, ${ipAddress || null}, ${expiresAt}, NOW())
    `;

    return token;
  }

  /**
   * Remove sensitive fields from user object
   */
  private static sanitizeUser(user: any) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
