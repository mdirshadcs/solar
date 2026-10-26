# Kubernetes / Helm

Placeholder. Helm charts for `api`, `worker`, `scheduler`, `web` and `gotenberg` (HPA, probes,
secrets from a secret store) are written in prompt **1.10 Phase 1 hardening**.

The containers already expose what Kubernetes needs:

| Container | Liveness             | Readiness                                                    |
| --------- | -------------------- | ------------------------------------------------------------ |
| api       | `GET /api/v1/health` | `GET /api/v1/health/ready` (503 when MySQL or Redis is down) |
| web       | `GET /`              | `GET /`                                                      |
