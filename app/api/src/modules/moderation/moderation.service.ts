// app/api/src/modules/moderation/moderation.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { PublicationSafetyAgent } from "../agents/publication-safety.agent";
import { CheckPublicationDto } from "./dto/check-publication.dto";

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly safetyAgent: PublicationSafetyAgent,
  ) {}

  /**
   * Verifica publicação usando agente de IA
   * Retorna null se houver erro técnico (fail-open)
   */
  async checkPublication(
    dto: CheckPublicationDto,
    userId?: number,
  ): Promise<{
    status: string;
    reason: string;
    issues: string[];
    suggestions?: string[];
  } | null> {
    const method = "checkPublication";
    try {
      this.logger.log(
        `${method} ENTER, titulo=${(dto.titulo || dto.title || "")?.substring(0, 50)}, userId=${userId}`,
      );

      const result = await this.safetyAgent.checkPublication({
        titulo: dto.titulo || dto.title || "",
        descricao: dto.descricao || dto.description || "",
        categoria: dto.categoria,
      });

      // Se resultado é null, significa erro técnico - retornar null (fail-open)
      if (!result) {
        this.logger.warn(
          `${method} - AI validation unavailable, allowing publication`,
        );
        return null;
      }

      // Extrair issues dos campos com problemas para manter compatibilidade
      const issues: string[] = [];
      const suggestions: string[] = [];

      result.fields.forEach((field) => {
        if (field.status === "sensitive") {
          issues.push(
            `Campo "${field.field}": ${field.evidences.join("; ")} [${field.policy_reference}]`,
          );
        } else if (field.status === "review") {
          suggestions.push(
            `Campo "${field.field}" precisa revisão: ${field.evidences.join("; ")}`,
          );
        }
      });

      // Registrar revisão no banco apenas se houver resultado válido
      try {
        await this.registerPublicationReview(
          "offer",
          null,
          userId || null,
          result.status,
          result.reason,
          issues,
          suggestions.length > 0 ? suggestions : undefined,
          result.model_id,
          result.prompt_version,
          result.execution_id,
        );
      } catch (reviewError) {
        // Não falhar se registro de revisão falhar
        this.logger.error(
          "Erro ao registrar revisão (não crítico):",
          reviewError,
        );
      }

      this.logger.log(
        `${method} EXIT, status=${result.status}, execution_id=${result.execution_id}`,
      );

      // Retornar formato compatível com contrato existente
      return {
        status: result.status,
        reason: result.reason,
        issues,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    } catch (error) {
      this.logger.error(
        `${method} ERROR: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Em caso de erro inesperado, retornar null para permitir criação (fail-open)
      return null;
    }
  }

  /**
   * Registra revisão de publicação no banco
   */
  private async registerPublicationReview(
    publicationType: string,
    publicationId: number | null,
    userId: number | null,
    status: string,
    reason: string,
    issues: string[],
    suggestions?: string[],
    modelId?: string,
    promptVersion?: string,
    executionId?: string,
  ): Promise<void> {
    try {
      await this.userRepository.query(
        `INSERT INTO tb_publication_reviews 
         (publication_type, publication_id, user_id, status, reason, issues, suggestions, ai_model, prompt_version, execution_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          publicationType,
          publicationId,
          userId,
          status,
          reason,
          JSON.stringify(issues),
          suggestions ? JSON.stringify(suggestions) : null,
          modelId ||
            process.env.OPENROUTER_MODEL ||
            "anthropic/claude-3.5-sonnet",
          promptVersion || "unknown",
          executionId || "unknown",
        ],
      );
    } catch (error) {
      this.logger.error("Erro ao registrar revisão de publicação:", error);
    }
  }
}
