// app/api/src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import express from "express";

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const JSON_PAYLOAD_LIMIT = process.env.JSON_PAYLOAD_LIMIT || "10mb";
const API_BASE_URL = process.env.API_BASE_URL || `http://${HOST}:${PORT}`;
const API_PRODUCTION_URL = process.env.API_PRODUCTION_URL || API_BASE_URL;

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

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle("API - Marketplace de Resíduos")
    .setDescription("API NestJS para protótipo MVP de marketplace de produtos")
    .setVersion("0.1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addServer(API_BASE_URL, "Desenvolvimento Local")
    .addServer(API_PRODUCTION_URL, "Produção")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    customSiteTitle: "API Documentation",
    customFavIcon: "/favicon.ico",
    customCss: ".swagger-ui .topbar { display: none }",
  });

  await app.listen(PORT, HOST);
  console.log(`🚀 API rodando em ${API_BASE_URL}/api`);
  console.log(`📚 Swagger disponível em ${API_BASE_URL}/api/docs`);
}

bootstrap();
