# ---------- base ----------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable

# ---------- deps ----------
FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm config set fetch-retries 10 && \
    pnpm config set fetch-retry-maxtimeout 300000 && \
    pnpm config set network-concurrency 1 && \
    pnpm install --frozen-lockfile 

# ---------- build ----------
FROM deps AS builder

COPY apps/frontend ./apps/frontend
COPY packages/shared ./packages/shared
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm install --frozen-lockfile
RUN pnpm --filter frontend build

# ---------- runtime ----------
FROM node:20-alpine AS runner
RUN apk update && apk upgrade        
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
RUN mkdir -p /app/apps/frontend/.next/cache && chown -R nodejs:nodejs /app
USER nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

CMD ["node","apps/frontend/server.js"]