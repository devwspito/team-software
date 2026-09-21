FROM node:24.8.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.base.json tsconfig.server.json tsconfig.web.json vite.config.ts vitest.config.ts eslint.config.js ./
COPY src ./src
RUN npm run check

FROM node:24.8.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S developer && adduser -S -G developer developer
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build --chown=developer:developer /app/dist ./dist
USER developer
EXPOSE 8787
CMD ["node", "dist/server/index.js"]
