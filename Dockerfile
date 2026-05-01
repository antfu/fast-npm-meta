FROM node:22-slim AS base

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

# -- install dependencies --
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/
COPY package/package.json package/
RUN pnpm install --frozen-lockfile

# -- build --
FROM deps AS build
ARG GIT_REVISION=""
COPY . .
ENV NITRO_PRESET=node-server
ENV GIT_REVISION=${GIT_REVISION}
RUN pnpm -C server run build

# -- production image --
FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=build /app/server/.output .output

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]