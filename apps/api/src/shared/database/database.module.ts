import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import { loadConfig } from '../../config';

export const MYSQL_POOL = Symbol('MYSQL_POOL');

@Injectable()
class PoolCloser implements OnApplicationShutdown {
  constructor(@Inject(MYSQL_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * MySQL connection pool. Timestamps are stored in UTC (B7).
 * The tenant-scoped data access layer (B5) is built on top of this in prompt 1.2.
 */
@Global()
@Module({
  providers: [
    {
      provide: MYSQL_POOL,
      useFactory: (): Pool => {
        const { mysql } = loadConfig();
        return createPool({
          ...mysql,
          connectionLimit: 10,
          timezone: 'Z',
          charset: 'utf8mb4',
          decimalNumbers: false,
        });
      },
    },
    PoolCloser,
  ],
  exports: [MYSQL_POOL],
})
export class DatabaseModule {}
