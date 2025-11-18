// app/api/src/modules/agents/agents.module.ts
import { Global, Module } from "@nestjs/common";
import { OpenRouterModule } from "../openrouter/openrouter.module";
import { OnboardingEligibilityAgent } from "./onboarding-eligibility.agent";
import { EmailDomainGuardAgent } from "./email-domain-guard.agent";
import { PublicationSafetyAgent } from "./publication-safety.agent";

@Global()
@Module({
  imports: [OpenRouterModule],
  providers: [
    OnboardingEligibilityAgent,
    EmailDomainGuardAgent,
    PublicationSafetyAgent,
  ],
  exports: [
    OnboardingEligibilityAgent,
    EmailDomainGuardAgent,
    PublicationSafetyAgent,
  ],
})
export class AgentsModule {}
