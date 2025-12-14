# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build with verbose output
RUN npm run build || (echo "Build failed! Checking for errors..." && cat package.json && exit 1)

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]