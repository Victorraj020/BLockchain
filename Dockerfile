FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy frontend source code
COPY frontend ./frontend

# Build Next.js application
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=10000

# Copy necessary files from builder
COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public

EXPOSE 10000

# Start Next.js server binding to the environment PORT
CMD ["sh", "-c", "npx next start -p ${PORT:-10000}"]
