import type { Logger } from 'pino';

export interface SystemJob {
  name: string;
  data: unknown;
}

export interface HeartbeatResult {
  kind: 'heartbeat';
  at: string;
}

/**
 * Handles the platform "system" queue. Sprint 0 only has the heartbeat, which proves the
 * scheduler -> Redis -> worker path end to end. Trial expiry, dunning and the outbox relay
 * are added here in prompts 1.2 and 1.3.
 */
export function processSystemJob(job: SystemJob, log: Logger, now = new Date()): HeartbeatResult {
  switch (job.name) {
    case 'heartbeat':
      log.debug({ job: job.name }, 'heartbeat processed');
      return { kind: 'heartbeat', at: now.toISOString() };
    default:
      throw new Error(`Unknown system job: ${job.name}`);
  }
}
