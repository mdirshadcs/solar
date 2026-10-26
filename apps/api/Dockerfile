# Build context: repository root (see docker-compose.yml)
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
RUN npm ci --workspace @solar-erp/api --workspace @solar-erp/contracts --include-workspace-root
COPY packages/contracts packages/contracts
COPY apps/api apps/api
RUN npm run build --workspace @solar-erp/contracts && npm run build --workspace @solar-erp/api

FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
RUN npm ci --omit=dev --workspace @solar-erp/api --workspace @solar-erp/contracts --include-workspace-root=false

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /repo
# Same layout as the build so the workspace symlink node_modules/@solar-erp/contracts resolves
COPY --from=deps --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/contracts/package.json ./packages/contracts/
COPY --from=build --chown=node:node /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=build --chown=node:node /repo/apps/api/package.json ./apps/api/
COPY --from=build --chown=node:node /repo/apps/api/dist ./apps/api/dist
WORKDIR /repo/apps/api
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/health || exit 1
CMD ["node", "dist/main.js"]
