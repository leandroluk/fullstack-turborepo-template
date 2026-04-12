# Build context: repository root
# from repo root:       docker build -f templates/nextjs-16/Dockerfile -t nextjs-16:latest .
# from this directory:  docker build -f Dockerfile -t nextjs-16:latest ../..

#? =-=-=-=-=-=- Base Stage =-=-=-=-=-=-

FROM node:lts-alpine AS base

RUN apk update

WORKDIR /app

RUN npm install -g pnpm@9.0.0 turbo@2.9.6

#? =-=-=-=-=-=- Builder Stage =-=-=-=-=-=-

FROM base AS builder

COPY . .

RUN turbo prune @templates/nextjs-16 --docker

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

ENV NODE_ENV=production

RUN turbo build --filter=@templates/nextjs-16

#? =-=-=-=-=-=- Runner Stage =-=-=-=-=-=-

FROM node:lts-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=compiler --chown=nextjs:nodejs /app/templates/nextjs-16/.next/standalone ./
COPY --from=compiler --chown=nextjs:nodejs /app/templates/nextjs-16/.next/static ./templates/nextjs-16/.next/static
COPY --from=compiler --chown=nextjs:nodejs /app/templates/nextjs-16/public ./templates/nextjs-16/public

USER nextjs

ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0

EXPOSE ${PORT}

CMD ["node", "templates/nextjs-16/server.js"]
