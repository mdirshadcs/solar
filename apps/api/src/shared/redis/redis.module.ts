import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { loadConfig } from '../../config';

export const REDIS = Symbol('REDIS');

@Injectable()
class RedisCloser implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (): Redis => {
        const { redis } = loadConfig();
        return new Redis({ ...redis, lazyConnect: true, maxRetriesPerRequest: 2 });
      },
    },
    RedisCloser,
  ],
  exports: [REDIS],
})
export class RedisModule {}
