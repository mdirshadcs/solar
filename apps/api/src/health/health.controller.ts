import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import type { HealthResponse } from '@solar-erp/contracts';
import type { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** Liveness probe: the process is up. Never touches dependencies. */
  @Get()
  @HttpCode(200)
  @ApiOkResponse({ description: 'Process is alive' })
  live(): HealthResponse {
    return this.health.live();
  }

  /** Readiness probe: MySQL and Redis are reachable. 503 when any dependency is down. */
  @Get('ready')
  @ApiOkResponse({ description: 'All dependencies are reachable' })
  @ApiServiceUnavailableResponse({ description: 'At least one dependency is down' })
  async ready(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
    const result = await this.health.ready();
    res.status(result.status === 'ok' ? 200 : 503);
    return result;
  }
}
