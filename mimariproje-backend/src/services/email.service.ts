import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Email templates
const emailTemplates = {
  verification: (name: string, verificationUrl: string) => ({
    subject: 'Mimariproje.com - E-posta Adresinizi Doğrulayın',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-posta Doğrulama</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Mimariproje.com</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Mimarlık Profesyonellerinin Buluşma Noktası</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a2e; margin-top: 0;">Merhaba ${name},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Mimariproje.com ailesine hoş geldiniz! Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                E-postamı Doğrula
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.6;">
              Eğer butona tıklayamıyorsanız, aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
            </p>
            <p style="background: #f7fafc; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #667eea;">
              ${verificationUrl}
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #a0aec0; font-size: 12px; text-align: center;">
              Bu e-posta, Mimariproje.com'a kayıt olduğunuz için gönderilmiştir.<br>
              Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Merhaba ${name},\n\nMimariproje.com ailesine hoş geldiniz!\n\nE-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:\n${verificationUrl}\n\nBu bağlantı 24 saat geçerlidir.\n\nTeşekkürler,\nMimariproje.com Ekibi`
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Mimariproje.com - Şifre Sıfırlama',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Mimariproje.com</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">Şifre Sıfırlama İsteği</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a2e; margin-top: 0;">Merhaba ${name},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Şifrenizi sıfırlamak için bir istek aldık. Şifrenizi değiştirmek için aşağıdaki butona tıklayın.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Şifremi Sıfırla
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.6;">
              Eğer butona tıklayamıyorsanız, aşağıdaki bağlantıyı tarayıcınıza kopyalayabilirsiniz:
            </p>
            <p style="background: #f7fafc; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #f5576c;">
              ${resetUrl}
            </p>
            <div style="background: #fff5f5; border-left: 4px solid #f5576c; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #c53030; margin: 0; font-size: 14px;">
                ⚠️ Bu bağlantı 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelin.
              </p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #a0aec0; font-size: 12px; text-align: center;">
              Güvenliğiniz için, şifre sıfırlama bağlantılarını kimseyle paylaşmayın.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Merhaba ${name},\n\nŞifrenizi sıfırlamak için bir istek aldık.\n\nŞifrenizi değiştirmek için aşağıdaki bağlantıya tıklayın:\n${resetUrl}\n\nBu bağlantı 1 saat geçerlidir.\n\nEğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\nTeşekkürler,\nMimariproje.com Ekibi`
  }),

  welcome: (name: string) => ({
    subject: 'Mimariproje.com\'a Hoş Geldiniz! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoş Geldiniz</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Hoş Geldiniz!</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">E-posta adresiniz başarıyla doğrulandı</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a2e; margin-top: 0;">Merhaba ${name},</h2>
            <p style="color: #4a5568; line-height: 1.6;">
              Hesabınız başarıyla aktifleştirildi! Artık Mimariproje.com'un tüm özelliklerinden yararlanabilirsiniz.
            </p>
            <div style="background: #f0fff4; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #22543d; margin-top: 0;">🚀 Hemen Başlayın</h3>
              <ul style="color: #4a5568; line-height: 2;">
                <li>Profilinizi tamamlayın</li>
                <li>Projelerinizi paylaşın</li>
                <li>Diğer mimarlarla bağlantı kurun</li>
                <li>İş ilanlarını keşfedin</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${env.FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Dashboard'a Git
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Merhaba ${name},\n\nHesabınız başarıyla aktifleştirildi! Artık Mimariproje.com'un tüm özelliklerinden yararlanabilirsiniz.\n\nTeşekkürler,\nMimariproje.com Ekibi`
  })
};

// Create transporter
const createTransporter = () => {
  // In development without SMTP config, use console logging
  if (env.NODE_ENV === 'development' && !env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: env.SMTP_USER && env.SMTP_PASS ? {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    } : undefined,
  });
};

export class EmailService {
  private static transporter = createTransporter();

  /**
   * Send an email
   */
  static async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      // In development without SMTP, just log
      if (!this.transporter) {
        console.log('\n📧 [EMAIL SERVICE - DEV MODE]');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Text:', text?.substring(0, 200) + '...');
        console.log('-------------------\n');
        return true;
      }

      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
        text: text || '',
      });

      console.log(`📧 Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${env.FRONTEND_URL}/auth/email-dogrulama?token=${token}`;
    const template = emailTemplates.verification(name, verificationUrl);
    
    return this.sendEmail(email, template.subject, template.html, template.text);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/sifre-sifirla?token=${token}`;
    const template = emailTemplates.passwordReset(name, resetUrl);
    
    return this.sendEmail(email, template.subject, template.html, template.text);
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template = emailTemplates.welcome(name);
    
    return this.sendEmail(email, template.subject, template.html, template.text);
  }
}
