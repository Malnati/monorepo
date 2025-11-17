// app/api/src/modules/agents/onboarding-eligibility.agent.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from '../openrouter/openrouter.service';

export interface EligibilityCheckInput {
  email: string;
  nome?: string;
  cpfCnpj?: string;
  endereco?: string;
}

export interface EligibilityCheckResult {
  eligible: boolean;
  reason: string;
  confidence: number;
}

const ELIGIBILITY_PROMPT = `Você é um agente de validação de cadastro para a plataforma APP (CLImate INvestment), um marketplace de resíduos e créditos de carbono.

Sua tarefa é avaliar se um novo usuário é elegível para se cadastrar na plataforma, considerando:

1. **Consistência dos dados**: Os dados fornecidos parecem legítimos e consistentes?
2. **Intenção aparente**: O usuário parece ter intenção real de usar a plataforma de forma legítima?
3. **Conformidade LGPD**: Os dados estão de acordo com as políticas de privacidade?
4. **Perfil de risco**: Há sinais de fraude, spam ou uso indevido?

Dados do usuário:
{userDataJson}

IMPORTANTE: Responda APENAS no formato JSON válido, sem texto adicional:
{
  "eligible": true ou false,
  "reason": "explicação clara e objetiva em português",
  "confidence": número entre 0 e 1
}`;

@Injectable()
export class OnboardingEligibilityAgent {
  private readonly logger = new Logger(OnboardingEligibilityAgent.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async checkEligibility(
    input: EligibilityCheckInput,
  ): Promise<EligibilityCheckResult> {
    const method = 'checkEligibility';
    try {
      this.logger.log(`${method} ENTER, email=${input.email}`);

      const userDataJson = JSON.stringify(input, null, 2);
      const prompt = ELIGIBILITY_PROMPT.replace('{userDataJson}', userDataJson);

      const response = await this.openRouterService.prompt(prompt, {
        temperature: 0.3,
        maxTokens: 500,
      });

      const result = this.parseResponse(response);
      this.logger.log(
        `${method} EXIT, eligible=${result.eligible}, confidence=${result.confidence}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `${method} ERROR: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Em caso de erro, retornar resultado conservador
      return {
        eligible: false,
        reason: 'Erro na validação automática. Análise manual necessária.',
        confidence: 0,
      };
    }
  }

  private parseResponse(response: string): EligibilityCheckResult {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        eligible: Boolean(parsed.eligible),
        reason: String(parsed.reason || 'Sem motivo fornecido'),
        confidence: Number(parsed.confidence) || 0,
      };
    } catch (error) {
      this.logger.error('Erro ao parsear resposta da IA:', error);
      return {
        eligible: false,
        reason: 'Resposta da IA inválida',
        confidence: 0,
      };
    }
  }
}
