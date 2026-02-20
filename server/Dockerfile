# deps: install deps

FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# dev: 
FROM deps AS dev
WORKDIR /app
ENV NODE_ENV=development

COPY . .

EXPOSE 5000
CMD ["pnpm", "dev"]


#  build: 
FROM deps AS build
WORKDIR /app

COPY . .

RUN pnpm build

#  prod: small runtime image

FROM node:22-alpine AS prod
WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/server.js"]