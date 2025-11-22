// app/job/src/main.ts

import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

const DEFAULT_PORT = 3002;

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn", "debug", "verbose"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || DEFAULT_PORT;
  const baseUrl = process.env.APP_JOB_BASE_URL || `http://localhost:${port}`;
  await app.listen(port);

  logger.log(`Application is running on: ${baseUrl}`);
  logger.log(`Health check: ${baseUrl}/health`);
  logger.log(`Metrics: ${baseUrl}/metrics`);
  logger.log(`Prometheus metrics: ${baseUrl}/metrics/prometheus`);
}

bootstrap();
