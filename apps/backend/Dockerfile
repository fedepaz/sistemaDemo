# ---------- base ----------
FROM node:20-alpine AS base
RUN apk update && apk upgrade
RUN corepack enable

# ---------- deps ----------
FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM deps AS builder

COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

RUN pnpm --filter backend build
RUN pnpm deploy --filter backend --prod /deploy

# ---------- runtime ----------
FROM node:20-alpine AS runner
RUN apk update && apk upgrade        
RUN corepack enable
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
# Copy the self-contained deploy folder
COPY --from=builder /deploy ./
COPY --from=builder /app/apps/backend/dist ./dist
# Copy and set up entrypoint
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY apps/backend/scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh


USER nodejs
EXPOSE 3001

CMD ["./entrypoint.sh"]