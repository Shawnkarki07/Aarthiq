import { PrismaClient } from '@prisma/client';

/**
 * Shared Prisma Client instance
 * Best practice: Create a single instance and reuse it across the application
 */
const prisma = new PrismaClient();

export default prisma;
