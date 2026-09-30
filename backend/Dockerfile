FROM node:20-bookworm-slim

# Install curl for container healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Ensure entrypoint is executable
RUN chmod +x docker-entrypoint.sh

# Environment variables defaults
ENV NODE_ENV=production \
    PORT=5001 \
    MONGODB_URI=mongodb://mongodb:27017/yemxona_erp

EXPOSE 5001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
