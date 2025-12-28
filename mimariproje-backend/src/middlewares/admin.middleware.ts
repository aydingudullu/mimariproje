import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to check if user is admin
 * Should be used after the authenticate middleware
 */
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
  }

  // Check if user has admin role
  // user_type can be 'admin' or we can check subscription_type
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
  }

  next();
}

/**
 * Check if user is admin or the owner of the resource
 */
export function isAdminOrOwner(ownerIdField: string = 'id') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const resourceOwnerId = req.params[ownerIdField];

    if (!user) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }

    // Admin can access anything
    if (user.role === 'admin') {
      return next();
    }

    // Check if user is the owner
    if (user.id === parseInt(resourceOwnerId)) {
      return next();
    }

    return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
  };
}
