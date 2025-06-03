FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY tsconfig.json ./
COPY eslint.config.mjs ./

COPY src/ ./src/
COPY data/ ./data/

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodeuser -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=base /app/dist ./dist
COPY --from=base /app/data ./data

RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]