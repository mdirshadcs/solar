# SolarERP

Multi-tenant SaaS ERP for solar EPC and installation companies, from first enquiry to 25 years of
plant maintenance. Requirements and architecture:
[docs/Solar_ERP_BRD_and_Solution_Architecture.md](docs/Solar_ERP_BRD_and_Solution_Architecture.md).
Progress: [docs/ROADMAP.md](docs/ROADMAP.md).

## Run it with Docker

Requires Docker Desktop.

```sh
cp .env.example .env    # optional: defaults work for local use
docker compose up -d --build
```

| URL                                       | What                      |
| ----------------------------------------- | ------------------------- |
| http://localhost:8080                     | Web app                   |
| http://localhost:8080/api/docs            | API docs (Swagger)        |
| http://localhost:3000/api/v1/health/ready | API readiness             |
| http://localhost:8025                     | Mailpit (captured emails) |
| localhost:3307                            | MySQL (user `solarerp`)   |
| http://localhost:8333                     | S3-compatible storage     |

Database migrations in `db/migrations` run automatically through the `flyway` service.
Stop with `docker compose down` (add `-v` to wipe data).

## Develop without Docker for the apps

```sh
npm install
docker compose up -d mysql flyway redis   # infrastructure only
npm run build --workspace @solar-erp/contracts
npm run dev --workspace @solar-erp/api    # http://localhost:3000
npm run dev --workspace @solar-erp/web    # http://localhost:5173
```

## Checks

```sh
npm run lint    # ESLint + Prettier
npm run build
npm test
```

## Layout

```
apps/api        NestJS modular monolith (B3, B16)
apps/worker     BullMQ job processors and schedulers
apps/web        React + Vite + Ant Design
packages/contracts  Shared API types
db/migrations   Flyway SQL migrations (V001__...)
infra/          Terraform and Kubernetes (prompt 1.10)
docs/           BRD, roadmap
```
