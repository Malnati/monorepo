// app/api/src/modules/onboarding-import/guards/service-token.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const SERVICE_TOKEN_HEADER = "authorization";
const BEARER_PREFIX = "Bearer ";

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  private readonly logger = new Logger(ServiceTokenGuard.name);
  private readonly expectedToken: string;

  constructor(_configService: ConfigService) {
    // TODO: Obter do ConfigService quando configurado
    // Por enquanto, usar variável de ambiente diretamente
    this.expectedToken =
      process.env.APP_JOB_SERVICE_TOKEN || "default-service-token";
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers[SERVICE_TOKEN_HEADER];

    if (!authHeader) {
      this.logger.warn("Missing authorization header");
      throw new UnauthorizedException("Missing authorization header");
    }

    if (!authHeader.startsWith(BEARER_PREFIX)) {
      this.logger.warn("Invalid authorization header format");
      throw new UnauthorizedException("Invalid authorization header format");
    }

    const token = authHeader.substring(BEARER_PREFIX.length);

    if (token !== this.expectedToken) {
      this.logger.warn("Invalid service token");
      throw new UnauthorizedException("Invalid service token");
    }

    return true;
  }
}
