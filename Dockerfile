# Multi-stage build for CityLayers application

# Stage 1: Build TypeScript
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm install --save-dev typescript @types/node @types/express

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build TypeScript
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 8080

# Start application
# Note: Cloud Run passes environment variables directly, no need for dotenv
CMD ["node", "dist/index.js"]
