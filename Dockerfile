FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


FROM base AS prod-deps
COPY . /app
WORKDIR /app
RUN id=pnpm,target=/pnpm/store pnpm -F @kittyo/api install -P --frozen-lockfile


FROM base AS builder
COPY . /app
WORKDIR /app
RUN id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build


FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=pord-deps --chown=hono:nodejs ./apps/api/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs ./apps/api/dist /app/dist
COPY --from=builder --chown=hono:nodejs ./apps/api/package.json /app/package.json

COPY --from=builder --chown=hono:nodejs ./apps/web/dist ./public

USER hono
EXPOSE 3000


CMD ["sleep", "3600"]
