# Build context: repository root (see docker-compose.yml)
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace @solar-erp/web --workspace @solar-erp/contracts --include-workspace-root
COPY packages/contracts packages/contracts
COPY apps/web apps/web
RUN npm run build --workspace @solar-erp/contracts && npm run build --workspace @solar-erp/web

FROM nginxinc/nginx-unprivileged:1.29-alpine
# Pull in Alpine security fixes newer than the base image
USER root
RUN apk upgrade --no-cache
USER 101
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
