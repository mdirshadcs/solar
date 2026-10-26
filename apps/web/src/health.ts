import type { HealthResponse } from '@solar-erp/contracts';

export interface StatusView {
  color: 'success' | 'error' | 'processing';
  label: string;
}

/** Turns a readiness response (or its absence) into what the status card shows. */
export function toStatusView(health: HealthResponse | undefined, failed: boolean): StatusView {
  if (failed) return { color: 'error', label: 'API unreachable' };
  if (!health) return { color: 'processing', label: 'Checking…' };
  return health.status === 'ok'
    ? { color: 'success', label: 'All systems operational' }
    : { color: 'error', label: 'Degraded' };
}

export async function fetchReadiness(): Promise<HealthResponse> {
  const res = await fetch('/api/v1/health/ready');
  // 503 still carries a body that says which dependency is down
  if (!res.ok && res.status !== 503) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as HealthResponse;
}
