// app/api/src/modules/onboarding-import/onboarding-import.controller.ts

import { Controller, Post, Body, UseGuards, Logger } from "@nestjs/common";
import {
  OnboardingImportService,
  BatchResponse,
} from "./onboarding-import.service";
import { BatchOnboardingDto } from "./dto/batch-onboarding.dto";
import { ServiceTokenGuard } from "./guards/service-token.guard";

@Controller("app/api/internal/onboarding")
@UseGuards(ServiceTokenGuard)
export class OnboardingImportController {
  private readonly logger = new Logger(OnboardingImportController.name);

  constructor(
    private readonly onboardingImportService: OnboardingImportService,
  ) {}

  @Post("batch")
  async processBatch(
    @Body() batchDto: BatchOnboardingDto,
  ): Promise<BatchResponse> {
    this.logger.log(
      `Received batch from ${batchDto.source} with ${batchDto.users.length} users`,
    );
    return this.onboardingImportService.processBatch(batchDto);
  }
}
