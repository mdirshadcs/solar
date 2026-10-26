import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './shared/database/database.module';
import { LoggingModule } from './shared/logging/logging.module';
import { RedisModule } from './shared/redis/redis.module';

/**
 * Root of the modular monolith (B3). Platform, core and business modules from B16
 * (platform/, core/, modules/*) are registered here as each prompt adds them.
 */
@Module({
  imports: [LoggingModule, DatabaseModule, RedisModule, HealthModule],
})
export class AppModule {}
