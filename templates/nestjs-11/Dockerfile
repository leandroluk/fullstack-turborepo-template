# Build context: repository root
# from repo root:       docker build -f templates/nestjs-11/Dockerfile -t nestjs-11:latest .
# from this directory:  docker build -f Dockerfile -t nestjs-11:latest ../..

#? =-=-=-=-=-=- Base Stage =-=-=-=-=-=-

FROM node:lts-alpine AS base

RUN apk update

WORKDIR /app

RUN npm install -g pnpm@9.0.0 turbo@2.9.6

#? =-=-=-=-=-=- Builder Stage =-=-=-=-=-=-

FROM base AS builder

COPY . .

RUN turbo prune @templates/nestjs-11 --docker

#? =-=-=-=-=-=- Installer Stage =-=-=-=-=-=-

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json

RUN pnpm install --frozen-lockfile

#? =-=-=-=-=-=- Compiler Stage =-=-=-=-=-=-

FROM base AS compiler

COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .

WORKDIR /app/templates/nestjs-11
RUN pnpm run build

#? =-=-=-=-=-=- Runner Stage =-=-=-=-=-=-

FROM node:lts-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nestjs

COPY --from=compiler --chown=nestjs:nodejs /app/ .

USER nestjs

ENV NODE_ENV=production \
  PORT=3000

EXPOSE ${PORT}

CMD ["node", "templates/nestjs-11/dist/main.js"]
