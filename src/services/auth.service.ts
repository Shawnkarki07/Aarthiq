import prisma from '../config/prisma.config';
import { verifyPassword } from '../utils/password.utils';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

/**
 * Login user (Business or Admin)
 * Checks both Admin and BusinessLogin tables
 */
export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase();

  // Try to find admin first
  const admin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      username: true,
      isActive: true
    }
  });

  if (admin) {
    if (!admin.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Return admin info
    return {
      id: admin.id,
      email: admin.email,
      role: 'ADMIN' as const,
      username: admin.username
    };
  }

  // Try to find business login
  const businessLogin = await prisma.businessLogin.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      isActive: true,
      business: {
        select: {
          id: true,
          name: true,
          status: true,
          rejectionReason: true
        }
      }
    }
  });

  if (businessLogin) {
    if (!businessLogin.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, businessLogin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check business status
    if (businessLogin.business) {
      if (businessLogin.business.status === 'REJECTED') {
        throw new UnauthorizedError(`Your business registration was rejected. Reason: ${businessLogin.business.rejectionReason || 'Not specified'}`);
      }

      if (businessLogin.business.status === 'PENDING') {
        throw new UnauthorizedError('Your business registration is still pending admin approval. Please wait for approval before logging in.');
      }
    }

    // Return business login info (only if APPROVED)
    return {
      id: businessLogin.id,
      email: businessLogin.email,
      role: 'BUSINESS' as const,
      username: businessLogin.business?.name || null,
      businessId: businessLogin.business?.id || null,
      businessStatus: businessLogin.business?.status || null
    };
  }

  // No user found
  throw new NotFoundError('Invalid email or password');
};
