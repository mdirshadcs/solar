import type Redis from 'ioredis';
import type { Pool } from 'mysql2/promise';
import { HealthService } from './health.service';

function makeService(opts: { mysqlUp: boolean; redisUp: boolean }): HealthService {
  const pool = {
    query: jest.fn(() => (opts.mysqlUp ? Promise.resolve([]) : Promise.reject(new Error('down')))),
  } as unknown as Pool;
  const redis = {
    status: 'ready',
    connect: jest.fn(),
    ping: jest.fn(() =>
      opts.redisUp ? Promise.resolve('PONG') : Promise.reject(new Error('down')),
    ),
  } as unknown as Redis;
  return new HealthService(pool, redis);
}

describe('HealthService', () => {
  it('live() reports ok without touching dependencies', () => {
    const result = makeService({ mysqlUp: false, redisUp: false }).live();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('api');
    expect(result.checks).toBeUndefined();
  });

  it('ready() is ok when MySQL and Redis are up', async () => {
    const result = await makeService({ mysqlUp: true, redisUp: true }).ready();
    expect(result.status).toBe('ok');
    expect(result.checks).toEqual({ mysql: 'up', redis: 'up' });
  });

  it.each([
    [
      { mysqlUp: false, redisUp: true },
      { mysql: 'down', redis: 'up' },
    ],
    [
      { mysqlUp: true, redisUp: false },
      { mysql: 'up', redis: 'down' },
    ],
  ])('ready() is error when a dependency is down %#', async (deps, checks) => {
    const result = await makeService(deps).ready();
    expect(result.status).toBe('error');
    expect(result.checks).toEqual(checks);
  });
});
