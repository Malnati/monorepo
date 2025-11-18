// app/api/src/modules/moderation/moderation.controller.ts
import { Controller, Post, Body, Logger } from "@nestjs/common";
import { ModerationService } from "./moderation.service";
import { CheckPublicationDto } from "./dto/check-publication.dto";

@Controller("moderation")
export class ModerationController {
  private readonly logger = new Logger(ModerationController.name);

  constructor(private readonly moderationService: ModerationService) {}

  /**
   * POST /moderation/publications
   * Verifica publicação antes de salvar
   */
  @Post("publications")
  async checkPublication(@Body() dto: CheckPublicationDto) {
    this.logger.log(`Verificação de publicação iniciada: ${dto.titulo}`);

    // TODO: Extrair userId do token JWT quando autenticação estiver implementada
    const userId = undefined;

    return this.moderationService.checkPublication(dto, userId);
  }
}
