import { describe, expect, it } from 'vitest';
import { toStatusView } from './health';

const base = { service: 'api', version: '0.1.0', time: '2026-10-26T00:00:00Z' };

describe('toStatusView', () => {
  it('shows unreachable when the request failed', () => {
    expect(toStatusView(undefined, true)).toEqual({ color: 'error', label: 'API unreachable' });
  });

  it('shows checking while loading', () => {
    expect(toStatusView(undefined, false).color).toBe('processing');
  });

  it('shows operational when ready', () => {
    expect(toStatusView({ ...base, status: 'ok' }, false).color).toBe('success');
  });

  it('shows degraded when a dependency is down', () => {
    expect(toStatusView({ ...base, status: 'error' }, false).label).toBe('Degraded');
  });
});
