import { QUEUES } from '@solar-erp/contracts';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import pino from 'pino';
import { processSystemJob } from './processors/system.processor';

const log = pino({ level: process.env.LOG_LEVEL ?? 'info', base: { service: 'worker' } });

async function main(): Promise<void> {
  const connection = new IORedis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    maxRetriesPerRequest: null, // required by BullMQ workers
  });

  const systemQueue = new Queue(QUEUES.system, { connection });
  // Idempotent: upserting the scheduler keeps exactly one heartbeat schedule across restarts.
  await systemQueue.upsertJobScheduler('heartbeat', { every: 60_000 }, { name: 'heartbeat' });

  const worker = new Worker(QUEUES.system, async (job) => processSystemJob(job, log), {
    connection,
    concurrency: 5,
  });
  worker.on('failed', (job, err) => log.error({ jobId: job?.id, err }, 'job failed'));
  worker.on('ready', () => log.info({ queue: QUEUES.system }, 'worker ready'));

  const shutdown = async (signal: string) => {
    log.info({ signal }, 'shutting down');
    await worker.close();
    await systemQueue.close();
    await connection.quit();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  log.fatal({ err }, 'worker failed to start');
  process.exit(1);
});
