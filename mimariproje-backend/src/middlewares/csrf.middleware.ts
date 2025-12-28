import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF Token store (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: Date }>();

/**
 * Generate CSRF Token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF Middleware - Token Generation
 * Adds CSRF token to response and sets cookie
 */
export function csrfTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip for non-browser requests
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('application/json') && req.headers['x-requested-with'] === 'XMLHttpRequest') {
    // API requests with proper headers can skip CSRF for now
    return next();
  }

  // Generate or retrieve CSRF token
  const sessionId = req.headers['authorization'] || req.ip || 'anonymous';
  let tokenData = csrfTokens.get(sessionId);

  if (!tokenData || tokenData.expires < new Date()) {
    const token = generateCsrfToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    tokenData = { token, expires };
    csrfTokens.set(sessionId, tokenData);

    // Clean up old tokens periodically
    if (csrfTokens.size > 10000) {
      cleanupExpiredTokens();
    }
  }

  // Set token in response header for SPA to read
  res.setHeader('X-CSRF-Token', tokenData.token);
  
  // Also set as cookie for traditional forms
  res.cookie('csrf-token', tokenData.token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  next();
}

/**
 * CSRF Validation Middleware
 * Validates CSRF token on state-changing requests
 */
export function csrfValidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only validate on state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip for API requests with proper authentication
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // JWT authenticated requests are protected separately
    return next();
  }

  // Get CSRF token from request
  const tokenFromHeader = req.headers['x-csrf-token'] as string;
  const tokenFromBody = (req.body as any)?._csrf;
  const tokenFromQuery = req.query._csrf as string;
  const submittedToken = tokenFromHeader || tokenFromBody || tokenFromQuery;

  if (!submittedToken) {
    return res.status(403).json({ 
      success: false, 
      error: 'CSRF token gerekli',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  // Validate token
  const sessionId = req.headers['authorization'] || req.ip || 'anonymous';
  const tokenData = csrfTokens.get(sessionId);

  if (!tokenData || tokenData.token !== submittedToken || tokenData.expires < new Date()) {
    return res.status(403).json({ 
      success: false, 
      error: 'Geçersiz CSRF token',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  next();
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = new Date();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}

/**
 * Get CSRF Token endpoint handler
 */
export function getCsrfToken(req: Request, res: Response) {
  const sessionId = req.headers['authorization'] || req.ip || 'anonymous';
  let tokenData = csrfTokens.get(sessionId);

  if (!tokenData || tokenData.expires < new Date()) {
    const token = generateCsrfToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tokenData = { token, expires };
    csrfTokens.set(sessionId, tokenData);
  }

  res.json({
    success: true,
    data: { csrfToken: tokenData.token },
  });
}

export default {
  csrfTokenMiddleware,
  csrfValidationMiddleware,
  getCsrfToken,
  generateCsrfToken,
};
