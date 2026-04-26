# deps
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# dev
FROM deps AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev", "--hostname", "0.0.0.0", "--port", "3001"]

# build
FROM deps AS build
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN pnpm build

# prod
FROM node:24-alpine AS prod
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
