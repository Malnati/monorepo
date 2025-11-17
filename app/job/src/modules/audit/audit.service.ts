// app/job/src/modules/audit/audit.service.ts

import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ImportResult } from '../../types/csv-row.interface';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private metrics = {
    totalImported: 0,
    totalFailed: 0,
    lastRuntimeMs: 0,
  };

  recordImport(result: ImportResult): void {
    this.metrics.totalImported += result.created + result.updated;
    this.metrics.totalFailed += result.invalidRows;
    this.metrics.lastRuntimeMs = result.processingTimeMs;

    this.logger.log({
      event: 'onboarding_import',
      filename: result.filename,
      totalRows: result.totalRows,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length,
      processingTimeMs: result.processingTimeMs,
    });
  }

  recordError(filename: string, error: unknown): void {
    this.metrics.totalFailed++;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error({
      event: 'onboarding_import_error',
      filename,
      error: errorMessage,
      stack: errorStack,
    });
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
    };
  }

  // Placeholder para métricas Prometheus
  // Em produção, integrar com @willsoto/nestjs-prometheus
  exposePrometheusMetrics(): string {
    return `
# HELP app_job_total_imported Total de usuários importados
# TYPE app_job_total_imported counter
app_job_total_imported ${this.metrics.totalImported}

# HELP app_job_total_failed Total de importações com falha
# TYPE app_job_total_failed counter
app_job_total_failed ${this.metrics.totalFailed}

# HELP app_job_last_runtime_ms Tempo da última execução em ms
# TYPE app_job_last_runtime_ms gauge
app_job_last_runtime_ms ${this.metrics.lastRuntimeMs}
    `.trim();
  }
}
