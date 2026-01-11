# Multi-stage build for Node.js TypeScript backend
FROM node:22-alpine AS builder

# Install dependencies required for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine

# Install openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create uploads directory structure
RUN mkdir -p uploads/logos uploads/gallery uploads/images uploads/certificates \
    uploads/financial uploads/pitch-decks uploads/brochures uploads/documents uploads/videos

# Expose port
EXPOSE 3000

# Sync schema and start the server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
