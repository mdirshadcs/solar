import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Shared HTTP setup, used by main.ts and by the e2e tests so both behave the same. */
export function configureApp(app: INestApplication, version: string): void {
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableShutdownHooks();

  const openApi = new DocumentBuilder()
    .setTitle('SolarERP API')
    .setDescription('Multi-tenant SaaS ERP for solar companies')
    .setVersion(version)
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, openApi));
}
