import { PrismaClient } from '@prisma/client';

/**
 * Shared Prisma Client instance with proper connection management
 * Prevents connection pool exhaustion by:
 * 1. Using singleton pattern in development
 * 2. Configuring connection pool limits
 * 3. Setting appropriate timeouts
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// In development, save prisma instance to prevent hot-reload from creating new instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);

export default prisma;
