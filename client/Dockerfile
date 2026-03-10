# ── base: install dependencies ──
FROM node:24-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

# ── dev: hot-reload for local development ──
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 5174
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5174"]

# ── build: production bundle ──
FROM base AS build
ENV NODE_ENV=production
RUN pnpm build

# ── prod: serve with nginx ──
FROM nginx:alpine AS prod
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
