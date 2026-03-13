# -- Stage 1: Dependencies --
FROM node:22-alpine AS deps

WORKDIR /app

# Replicate workspace structure for npm ci
COPY package.json package-lock.json ./
COPY apps/mtas-ui/package.json ./apps/mtas-ui/
COPY apps/mtas-api/package.json ./apps/mtas-api/

RUN npm ci -w apps/mtas-ui

# -- Stage 2: Build --
FROM node:22-alpine AS builder

WORKDIR /app/apps/mtas-ui

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/mtas-ui/node_modules ./node_modules
COPY apps/mtas-ui/ ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# -- Stage 3: Run --
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# With outputFileTracingRoot set to monorepo root,
# standalone output mirrors the full monorepo path structure
COPY --from=builder /app/apps/mtas-ui/public ./public
COPY --from=builder /app/apps/mtas-ui/.next/standalone ./
COPY --from=builder /app/apps/mtas-ui/.next/static ./apps/mtas-ui/.next/static

EXPOSE 3000

CMD ["node", "apps/mtas-ui/server.js"]
