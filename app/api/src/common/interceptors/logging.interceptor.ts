// app/api/src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, params } = request;
    const user = request.user;
    const userId = user?.sub || user?.id || 'anonymous';
    const userEmail = user?.email || 'unknown';

    const startTime = Date.now();

    this.logger.log(
      `[${method}] ${url} - User: ${userId} (${userEmail}) - Params: ${JSON.stringify({ ...params, ...query })}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${method}] ${url} - User: ${userId} (${userEmail}) - Status: SUCCESS - Duration: ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${method}] ${url} - User: ${userId} (${userEmail}) - Status: ERROR - Duration: ${duration}ms - Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}

