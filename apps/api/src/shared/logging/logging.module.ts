import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { loadConfig } from '../../config';

/** Reuse the caller's trace id when it is a sane value, otherwise mint one. */
export function resolveTraceId(req: IncomingMessage): string {
  const incoming = req.headers['x-request-id'];
  if (typeof incoming === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(incoming)) {
    return incoming;
  }
  return randomUUID();
}

/**
 * Structured JSON logs (B14): every line carries trace_id. tenant_id and user_id are
 * added once auth exists (prompt 1.2). Credentials are redacted, never logged.
 */
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: loadConfig().logLevel,
        genReqId: (req, res) => {
          const traceId = resolveTraceId(req);
          res.setHeader('x-request-id', traceId);
          return traceId;
        },
        customProps: (req) => ({ trace_id: req.id }),
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        autoLogging: { ignore: (req) => req.url?.startsWith('/api/v1/health') ?? false },
      },
    }),
  ],
})
export class LoggingModule {}
