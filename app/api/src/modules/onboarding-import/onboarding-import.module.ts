// app/api/src/modules/onboarding-import/onboarding-import.module.ts

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OnboardingImportController } from "./onboarding-import.controller";
import { OnboardingImportService } from "./onboarding-import.service";
import { ServiceTokenGuard } from "./guards/service-token.guard";

@Module({
  imports: [ConfigModule],
  controllers: [OnboardingImportController],
  providers: [OnboardingImportService, ServiceTokenGuard],
  exports: [OnboardingImportService],
})
export class OnboardingImportModule {}
