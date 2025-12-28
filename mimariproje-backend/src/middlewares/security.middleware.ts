/**
 * Security Middleware - XSS Protection & Input Sanitization
 * Mimariproje.com - Güvenlik koruma katmanı
 */

import { Request, Response, NextFunction } from 'express';

/**
 * HTML özel karakterlerini escape eder
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Tehlikeli script pattern'lerini temizler
 */
function stripDangerousPatterns(str: string): string {
  // Script tagları ve event handler'ları kaldır
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:\s*text\/html/gi,
    /vbscript:/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
    /<link\b[^<]*>/gi,
  ];
  
  let result = str;
  for (const pattern of dangerousPatterns) {
    result = result.replace(pattern, '');
  }
  
  return result;
}

/**
 * Obje içindeki tüm string değerleri sanitize eder
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  // Sonsuz döngüyü önle
  if (depth > 10) return obj;
  
  if (typeof obj === 'string') {
    return escapeHtml(stripDangerousPatterns(obj));
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Key'leri de sanitize et
      const sanitizedKey = escapeHtml(key);
      sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * XSS koruması için input sanitization middleware
 * Request body'yi temizler (query ve params readonly olduğu için sadece loglama yapılır)
 */
export const xssSanitizer = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sadece body'yi sanitize et - query ve params Express'te readonly
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    next();
  } catch (error) {
    console.error('XSS Sanitizer Error:', error);
    next(); // Hata olsa bile devam et
  }
};

/**
 * Content Security Policy header'larını ayarlar
 * Helmet ile birlikte kullanılır
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // X-Content-Type-Options - MIME type sniffing koruması
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options - Clickjacking koruması
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection - Tarayıcı XSS filtresi
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy - Referrer bilgisi kontrolü
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy - Tarayıcı özelliklerini kısıtla
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * SQL Injection pattern tespiti (loglama için)
 * Not: Prisma ORM zaten SQL injection'a karşı koruma sağlıyor
 */
export const sqlInjectionDetector = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /(\%3D)|(=)/i,
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i,
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))/i,
    /UNION.+SELECT/i,
    /INSERT.+INTO/i,
    /DELETE.+FROM/i,
    /DROP.+TABLE/i,
    /UPDATE.+SET/i,
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => checkValue(v));
    }
    return false;
  };
  
  const isSuspicious = 
    checkValue(req.body) || 
    checkValue(req.query) || 
    checkValue(req.params);
  
  if (isSuspicious) {
    console.warn('⚠️ Potential SQL Injection attempt detected:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    // Sadece logla, engelleme yapma (Prisma zaten koruyor)
  }
  
  next();
};
