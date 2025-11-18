// app/api/src/modules/onboarding/onboarding.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { UserEntity } from "../user/user.entity";
import { MailingModule } from "../mailing/mailing.module";
import { AgentsModule } from "../agents/agents.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MailingModule,
    AgentsModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
