export type DependencyStatus = 'up' | 'down';

export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  version: string;
  time: string;
  checks?: Record<string, DependencyStatus>;
}

/** RFC 9457 problem details - the standard error body for every API error (B16). */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

/** Queue names shared by the api (producer) and worker (consumer). */
export const QUEUES = {
  system: 'system',
} as const;
