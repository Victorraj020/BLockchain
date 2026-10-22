FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy frontend source
COPY frontend ./frontend

# Build Next.js application
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
