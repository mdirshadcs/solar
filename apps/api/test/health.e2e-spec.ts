import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MYSQL_POOL } from '../src/shared/database/database.module';
import { REDIS } from '../src/shared/redis/redis.module';
import { configureApp } from '../src/setup';

describe('Health endpoints (e2e)', () => {
  let app: INestApplication;
  let mysqlUp = true;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MYSQL_POOL)
      .useValue({
        query: () => (mysqlUp ? Promise.resolve([]) : Promise.reject(new Error('down'))),
        end: () => Promise.resolve(),
      })
      .overrideProvider(REDIS)
      .useValue({
        status: 'ready',
        ping: () => Promise.resolve('PONG'),
        quit: () => Promise.resolve(),
      })
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app, 'test');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns 200 and echoes a trace id', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-request-id', 'trace-from-client-1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'api' });
    expect(res.headers['x-request-id']).toBe('trace-from-client-1');
  });

  it('GET /api/v1/health/ready returns 200 when dependencies are up', async () => {
    mysqlUp = true;
    const res = await request(app.getHttpServer()).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.checks).toEqual({ mysql: 'up', redis: 'up' });
  });

  it('GET /api/v1/health/ready returns 503 when MySQL is down', async () => {
    mysqlUp = false;
    const res = await request(app.getHttpServer()).get('/api/v1/health/ready');
    expect(res.status).toBe(503);
    expect(res.body.checks.mysql).toBe('down');
  });

  it('serves the OpenAPI document', async () => {
    const res = await request(app.getHttpServer()).get('/api/docs-json');
    expect(res.status).toBe(200);
    expect(res.body.info.title).toBe('SolarERP API');
    expect(Object.keys(res.body.paths)).toContain('/api/v1/health/ready');
  });
});
