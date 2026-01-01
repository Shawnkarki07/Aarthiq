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
          name: true
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

    // Return business login info
    return {
      id: businessLogin.id,
      email: businessLogin.email,
      role: 'BUSINESS' as const,
      username: businessLogin.business?.name || null
    };
  }

  // No user found
  throw new NotFoundError('Invalid email or password');
};
