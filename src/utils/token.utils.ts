import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 * @param bytes - Number of random bytes (default: 32)
 * @returns URL-safe token string
 */
export const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Calculate token expiration date
 * @param hours - Hours until expiration (default: 72)
 * @returns Date object for expiration
 */
export const getTokenExpiration = (hours?: number): Date => {
  const expirationHours = hours || parseInt(process.env.TOKEN_EXPIRATION_HOURS || '72');
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + expirationHours);
  return expiration;
};

/**
 * Check if token is expired
 * @param expiresAt - Expiration date
 * @returns boolean
 */
export const isTokenExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
};
