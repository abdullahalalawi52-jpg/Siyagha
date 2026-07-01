# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runner environment
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose Express server port
EXPOSE 3000

CMD ["node", "dist/server.cjs"]
