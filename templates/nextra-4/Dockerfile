# Build context: repository root
# from repo root:       docker build -f templates/nextra-4/Dockerfile -t nextra-4:latest .
# from this directory:  docker build -f Dockerfile -t nextra-4:latest ../..

#? =-=-=-=-=-=- Base Stage =-=-=-=-=-=-

FROM node:lts-alpine AS base

RUN apk update

WORKDIR /app

RUN npm install -g pnpm@9.0.0 turbo@2.9.6

#? =-=-=-=-=-=- Builder Stage =-=-=-=-=-=-

FROM base AS builder

COPY . .

RUN turbo prune @templates/nextra-4 --docker

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

RUN turbo build --filter=@templates/nextra-4

#? =-=-=-=-=-=- Runner Stage =-=-=-=-=-=-

FROM node:lts-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=compiler --chown=nextjs:nodejs /app/templates/nextra-4/.next/standalone ./
COPY --from=compiler --chown=nextjs:nodejs /app/templates/nextra-4/.next/static ./templates/nextra-4/.next/static
COPY --from=compiler --chown=nextjs:nodejs /app/templates/nextra-4/public ./templates/nextra-4/public

USER nextjs

ENV NODE_ENV=production \
  PORT=3000 \
  HOSTNAME=0.0.0.0

EXPOSE ${PORT}

CMD ["node", "templates/nextra-4/server.js"]
