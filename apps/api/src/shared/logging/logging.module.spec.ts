import type { IncomingMessage } from 'node:http';
import { resolveTraceId } from './logging.module';

const req = (header?: string) =>
  ({ headers: { 'x-request-id': header } }) as unknown as IncomingMessage;

describe('resolveTraceId', () => {
  it('reuses a well-formed incoming request id', () => {
    expect(resolveTraceId(req('abc12345-trace'))).toBe('abc12345-trace');
  });

  it.each([undefined, 'short', 'has spaces in it', 'x'.repeat(65), 'evil\nlog-injection'])(
    'mints a new UUID for %p',
    (header) => {
      expect(resolveTraceId(req(header))).toMatch(/^[0-9a-f-]{36}$/);
    },
  );
});
