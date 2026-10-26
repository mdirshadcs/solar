# SolarERP Roadmap

Source of truth for scope: [Solar_ERP_BRD_and_Solution_Architecture.md](Solar_ERP_BRD_and_Solution_Architecture.md).
Each row is one build prompt. A phase goes live only after its security gate (C9) and test exit criteria (D3).

## Status

| #    | Prompt                                                | BRD reference               | Status      |
| ---- | ----------------------------------------------------- | --------------------------- | ----------- |
| 1.1  | Sprint 0 - repo, Docker, CI                           | B4, B12, B16, B18           | Done        |
| 1.2  | Platform foundation - tenants, auth, RBAC, audit      | FR-SUB-001/002, FR-ADM, C4  | Not started |
| 1.3  | Subscription and billing                              | A8, B8, FR-SUB-003..012     | Not started |
| 1.4  | CRM, site survey, design and sizing                   | FR-CRM, FR-SRV, FR-DSN      | Not started |
| 1.5  | Quotation and sales order                             | FR-QTN, FR-SO, FR-ADM-008   | Not started |
| 1.6  | Items, procurement and inventory                      | FR-PUR, FR-INV              | Not started |
| 1.7  | Projects, job cards and offline field app             | FR-PRJ, FR-FLD, B11         | Not started |
| 1.8  | Regulatory, subsidy and finance                       | FR-REG, FR-FIN              | Not started |
| 1.9  | HR core, notifications, reports, import               | FR-HR, FR-NTF, FR-RPT       | Not started |
| 1.10 | Phase 1 hardening and go-live gate                    | C9, D3..D7                  | Not started |
| 2.1  | O&M, AMC, service tickets, warranty                   | FR-SVC                      | Not started |
| 2.2  | Customer portal                                       | FR-CPT                      | Not started |
| 2.3  | Payroll core                                          | FR-PAY-001..005             | Not started |
| 2.4  | Payroll outputs                                       | FR-PAY-006..012             | Not started |
| 2.5  | Plant monitoring integrations                         | FR-MON, B10                 | Not started |
| 2.6  | E-invoice, e-signature, lead sources, accounting sync | FR-FIN-003, FR-QTN-007, A11 | Not started |
| 2.7  | Public API, webhooks, SSO, iOS app                    | FR-ADM-012, A11, NFR-10     | Not started |
| 2.8  | Phase 2 hardening and go-live gate                    | C5, C9, D8                  | Not started |
| 3.1  | PPA / OPEX billing                                    | A3, A12                     | Not started |
| 3.2  | Report builder, dealer portal, financing              | FR-RPT-003, FR-CRM-009      | Not started |
| 3.3  | AI lead scoring, generation anomaly detection         | A12                         | Not started |
| 3.4  | Multi-country packs and languages                     | AS-02, NFR-08, NFR-11       | Not started |
| 3.5  | Phase 3 hardening and go-live gate                    | C6, C9, D9, D10             | Not started |

## 1.1 Sprint 0 - what was delivered

- npm-workspaces monorepo following B16: `apps/api`, `apps/worker`, `apps/web`, `packages/contracts`,
  `db/migrations`, `infra/`, `docs/`.
- API (NestJS 11): `GET /api/v1/health` (liveness), `GET /api/v1/health/ready` (MySQL + Redis,
  503 when down), OpenAPI at `/api/docs`, validation pipe, JSON logs with `trace_id` (from
  `X-Request-Id` or generated) and redacted auth headers.
- Worker (BullMQ): `system` queue with an idempotent heartbeat scheduler, ready for trial expiry,
  dunning and the outbox relay.
- Web (React 19 + Vite + Ant Design): status page that polls API readiness; served by
  unprivileged nginx which proxies `/api`.
- DB: Flyway migration `V001` with the B7 platform/core tables (plans, plan_prices, plan_features,
  tenants, subscriptions, payment_events, users, outbox_events, partitioned audit_logs).
- Docker Compose: MySQL 8.4, Flyway, Redis 7, S3 storage, Gotenberg, Mailpit, api, worker, web.
- CI (GitHub Actions): lint + format check, build, tests, `npm audit`, migration check against
  MySQL 8.4, image build and Trivy scan per app.
- Tests: 20 passing (api unit + e2e, worker, web).

## Implementation decisions

| Decision                                               | Why                                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| NestJS **11**, not 12                                  | NestJS 12 is ESM-only, which breaks the Jest/ts-jest toolchain. Revisit when tooling catches up.            |
| BullMQ **5.x**                                         | BullMQ 6 moved to pluggable backends with a different API; 5.x is the Redis-based design in B4.             |
| TypeScript **5.9**                                     | typescript-eslint does not yet support TypeScript 7.                                                        |
| **SeaweedFS** instead of MinIO for local S3            | MinIO no longer publishes Docker images. The app talks plain S3, so production uses AWS S3 (B12) unchanged. |
| MySQL on host port **3307**                            | Avoids clashing with a locally installed MySQL on 3306. Containers still use 3306 internally.               |
| Raw `mysql2` pool for now                              | The tenant-scoped data-access layer (B5) and ORM choice land in prompt 1.2.                                 |
| npm `overrides` for `multer` 2.5.0 and `js-yaml` 5.5.0 | Patches a high and a moderate advisory in NestJS transitive dependencies.                                   |
