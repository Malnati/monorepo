// app/job/src/app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuditService } from './modules/audit/audit.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly auditService: AuditService,
  ) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('metrics')
  getMetrics() {
    return this.auditService.getMetrics();
  }

  @Get('metrics/prometheus')
  getPrometheusMetrics() {
    return this.auditService.exposePrometheusMetrics();
  }
}
