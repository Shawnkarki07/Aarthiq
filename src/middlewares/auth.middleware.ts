import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/**
 * Authentication middleware stub
 * TODO: Replace with better-auth integration
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implement actual authentication
    // For now, check for a simple header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authentication required');
    }

    // Stub: Parse user from header
    // In production, this would validate JWT or session
    const [userId, email, role] = authHeader.split('|');

    if (!userId || !email || !role) {
      throw new UnauthorizedError('Invalid authentication token');
    }

    req.user = {
      id: userId,
      email: email,
      role: role as 'ADMIN' | 'BUSINESS'
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware - check user role
 * @param roles - Allowed roles
 */
export const authorize = (...roles: ('ADMIN' | 'BUSINESS')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no auth provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [userId, email, role] = authHeader.split('|');
      if (userId && email && role) {
        req.user = {
          id: userId,
          email: email,
          role: role as 'ADMIN' | 'BUSINESS'
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
