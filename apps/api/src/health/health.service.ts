import { Inject, Injectable } from '@nestjs/common';
import type { DependencyStatus, HealthResponse } from '@solar-erp/contracts';
import type Redis from 'ioredis';
import type { Pool } from 'mysql2/promise';
import { loadConfig } from '../config';
import { MYSQL_POOL } from '../shared/database/database.module';
import { REDIS } from '../shared/redis/redis.module';

@Injectable()
export class HealthService {
  private readonly version = loadConfig().version;

  constructor(
    @Inject(MYSQL_POOL) private readonly pool: Pool,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  live(): HealthResponse {
    return { status: 'ok', service: 'api', version: this.version, time: new Date().toISOString() };
  }

  async ready(): Promise<HealthResponse> {
    const [mysql, redis] = await Promise.all([
      probe(() => this.pool.query('SELECT 1')),
      probe(async () => {
        if (this.redis.status === 'wait') await this.redis.connect();
        await this.redis.ping();
      }),
    ]);
    const checks = { mysql, redis };
    const allUp = Object.values(checks).every((s) => s === 'up');
    return { ...this.live(), status: allUp ? 'ok' : 'error', checks };
  }
}

async function probe(check: () => Promise<unknown>): Promise<DependencyStatus> {
  try {
    await check();
    return 'up';
  } catch {
    return 'down';
  }
}
