# syntax=docker/dockerfile:1.7

# Node 24 ships npm 11 which resolves the same lockfile as the host.
# Alpine keeps the image small; Next.js standalone output needs no extra tools.

# -------- dependencies stage --------
FROM node:24-alpine AS deps
WORKDIR /app
# Only package.json + lock go in so dep install stays cacheable.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# -------- builder stage --------
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time public env; server-only API_BASE_URL is provided at runtime.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

# -------- runtime stage --------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Non-root user for the running container.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone output is produced because next.config.ts sets output: 'standalone'.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# next.js standalone bundle ships its own minimal server at `server.js`.
CMD ["node", "server.js"]
