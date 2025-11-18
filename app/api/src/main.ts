// app/api/src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import express from "express";

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const JSON_PAYLOAD_LIMIT = process.env.JSON_PAYLOAD_LIMIT || "10mb";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar limite de payload JSON para uploads grandes (ex: lotes com múltiplas fotos)
  // O NestJS usa express internamente, então podemos acessar o app HTTP
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(express.json({ limit: JSON_PAYLOAD_LIMIT }));
  expressApp.use(
    express.urlencoded({ extended: true, limit: JSON_PAYLOAD_LIMIT }),
  );

  // Habilitar CORS para desenvolvimento
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptor de logging global
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Prefixo global de API
  app.setGlobalPrefix("api");

  await app.listen(PORT, HOST);
  console.log(`🚀 API rodando em http://${HOST}:${PORT}/api`);
}

bootstrap();
