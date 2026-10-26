import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { processSystemJob } from './system.processor';

const log = pino({ level: 'silent' });

describe('processSystemJob', () => {
  it('handles a heartbeat', () => {
    const now = new Date('2026-10-26T10:00:00.000Z');
    expect(processSystemJob({ name: 'heartbeat', data: {} }, log, now)).toEqual({
      kind: 'heartbeat',
      at: '2026-10-26T10:00:00.000Z',
    });
  });

  it('rejects unknown jobs so they land in the failed set instead of vanishing', () => {
    expect(() => processSystemJob({ name: 'nope', data: {} }, log)).toThrow(
      'Unknown system job: nope',
    );
  });
});
