# Build context: repository root (see docker-compose.yml)
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/worker/package.json apps/worker/
RUN npm ci --workspace @solar-erp/worker --workspace @solar-erp/contracts --include-workspace-root
COPY packages/contracts packages/contracts
COPY apps/worker apps/worker
RUN npm run build --workspace @solar-erp/contracts && npm run build --workspace @solar-erp/worker

FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/worker/package.json apps/worker/
RUN npm ci --omit=dev --workspace @solar-erp/worker --workspace @solar-erp/contracts --include-workspace-root=false

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=deps --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/contracts/package.json ./packages/contracts/
COPY --from=build --chown=node:node /repo/packages/contracts/dist ./packages/contracts/dist
COPY --from=build --chown=node:node /repo/apps/worker/package.json ./apps/worker/
COPY --from=build --chown=node:node /repo/apps/worker/dist ./apps/worker/dist
WORKDIR /repo/apps/worker
USER node
CMD ["node", "dist/main.js"]
