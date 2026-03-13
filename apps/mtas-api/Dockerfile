# -- Stage 1: Build --
FROM node:22-alpine AS builder

WORKDIR /app

# Replicate workspace structure for npm ci
COPY package.json package-lock.json ./
COPY apps/mtas-api/package.json ./apps/mtas-api/
COPY apps/mtas-ui/package.json ./apps/mtas-ui/

RUN npm ci -w apps/mtas-api

COPY apps/mtas-api/ ./apps/mtas-api/

RUN npm run --workspace apps/mtas-api build

# -- Stage 2: Run --
FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/mtas-api/package.json ./apps/mtas-api/
COPY apps/mtas-ui/package.json ./apps/mtas-ui/

RUN npm ci -w apps/mtas-api --omit=dev

COPY --from=builder /app/apps/mtas-api/dist ./dist

ENV NODE_ENV=production
EXPOSE 5010

CMD ["sh", "-c", "node dist/main.js 2>&1; echo \"EXIT CODE: $?\"; sleep 3600"]
