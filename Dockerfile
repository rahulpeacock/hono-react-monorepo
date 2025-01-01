FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


FROM base AS builder
COPY . /app
WORKDIR /app
RUN id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build


CMD ["sleep", "3600"]
