// app/api/src/modules/agents/publication-safety.agent.ts
import { Injectable, Logger } from "@nestjs/common";
import { OpenRouterService } from "../openrouter/openrouter.service";
import { PROMPT_VERSION } from "./sensitive-data-patterns";

export interface PublicationCheckInput {
  titulo: string;
  descricao: string;
  categoria?: string;
}

export interface FieldCheck {
  field: string;
  status: "clean" | "sensitive" | "review";
  evidences: string[];
  policy_reference?: string;
}

export interface PublicationCheckResult {
  status: "approved" | "needs_revision" | "blocked";
  reason: string;
  fields: FieldCheck[];
  prompt_version: string;
  model_id?: string;
  execution_id: string;
}

const SAFETY_PROMPT = `Você é um agente especializado em DETECÇÃO DE DADOS SENSÍVEIS em publicações de lotes de resíduos.

**OBJETIVO EXCLUSIVO:** Identificar se os campos da publicação contêm dados sensíveis que não devem ser expostos publicamente.

**O QUE VOCÊ DEVE FAZER:**
- Analisar APENAS a presença de dados sensíveis nos campos
- Classificar cada campo como: "clean", "sensitive" ou "review"
- Fornecer evidências objetivas quando encontrar dados sensíveis

**O QUE VOCÊ NÃO DEVE FAZER:**
- NÃO avaliar qualidade do texto
- NÃO avaliar gramática ou ortografia
- NÃO avaliar se o lote é "bom" ou "adequado"
- NÃO bloquear publicações por critérios subjetivos
- NÃO gerar mensagens ou sugestões de melhoria

**CHECKLIST DE DADOS SENSÍVEIS:**

CHECK_01: SENHAS E CREDENCIAIS
- Palavras-chave: senha, password, pin, código de acesso, chave, credencial
- Status: "sensitive" se encontrar qualquer menção a senhas/credenciais

CHECK_02: TELEFONES COM DDD
- Padrões: (XX) XXXXX-XXXX, XX XXXXX-XXXX, +55 XX XXXXX-XXXX
- Palavras-chave: telefone, celular, whatsapp, fone, contato seguido de números
- Status: "sensitive" se encontrar número de telefone completo com DDD

CHECK_03: ENDEREÇOS COMPLETOS
- Padrões: Rua X, número Y, CEP, apartamento, complemento
- Status: "sensitive" se encontrar endereço completo com rua E número
- Status: "clean" se apenas mencionar cidade, estado ou região (permitido)

CHECK_04: COORDENADAS GEOGRÁFICAS EM TEXTO
- Padrões: latitude, longitude, coordenadas, GPS, -23.5505, -46.6333
- Status: "sensitive" se encontrar coordenadas precisas no texto
- Nota: Campos estruturados de localização são permitidos, problema é apenas no texto livre

CHECK_05: NOMES COMPLETOS DE PESSOAS
- Padrões: "Meu nome é João Silva", "Falar com Maria Santos", "Sr. Pedro Oliveira"
- Status: "sensitive" se identificar nome completo de pessoa identificável
- Status: "clean" se for nome de empresa, cooperativa ou instituição

CHECK_06: DOCUMENTOS OFICIAIS
- Padrões: CPF (XXX.XXX.XXX-XX), CNPJ (XX.XXX.XXX/XXXX-XX), RG
- Status: "sensitive" se encontrar CPF, CNPJ, RG ou documentos oficiais

CHECK_07: E-MAILS EM CAMPOS INADEQUADOS
- Padrões: usuario@dominio.com
- Status: "sensitive" se encontrar e-mail no título ou descrição
- Nota: E-mail em campo próprio de contato é permitido

**TERMOS PERMITIDOS (NÃO SÃO SENSÍVEIS):**
- Termos comerciais: preço, valor, quantidade, kg, tonelada
- Localizações genéricas: São Paulo, Rio de Janeiro, zona leste, centro
- Termos de negócio: negociável, aceito, pagamento, PIX, boleto
- Nomes de empresas e cooperativas

**DADOS DA PUBLICAÇÃO:**
{publicationDataJson}

**FORMATO DE RESPOSTA OBRIGATÓRIO (JSON válido, sem texto adicional):**
{
  "fields": [
    {
      "field": "titulo",
      "status": "clean" | "sensitive" | "review",
      "evidences": ["evidência 1", "evidência 2"],
      "policy_reference": "REQ-031" | "REQ-200" (apenas se sensitive)
    },
    {
      "field": "descricao",
      "status": "clean" | "sensitive" | "review",
      "evidences": [],
      "policy_reference": "REQ-031" (apenas se sensitive)
    }
  ],
  "overall_status": "approved" | "needs_revision" | "blocked",
  "summary": "Resumo objetivo: X campos limpos, Y campos com dados sensíveis"
}

**REGRAS DE CLASSIFICAÇÃO:**
- "clean": Campo não contém dados sensíveis
- "sensitive": Campo contém dados sensíveis confirmados (bloquear publicação)
- "review": Caso ambíguo que precisa revisão manual (liberar com aviso)
- "approved": Todos os campos clean ou apenas review
- "needs_revision": 1 ou mais campos em review, nenhum sensitive
- "blocked": 1 ou mais campos sensitive

**IMPORTANTE:** Se houver QUALQUER dúvida, classifique como "review" (não bloquear). Apenas bloqueie quando tiver CERTEZA de dado sensível.`;

@Injectable()
export class PublicationSafetyAgent {
  private readonly logger = new Logger(PublicationSafetyAgent.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async checkPublication(
    input: PublicationCheckInput,
  ): Promise<PublicationCheckResult | null> {
    const method = "checkPublication";
    const executionId = this.generateExecutionId();

    try {
      this.logger.log(
        `${method} ENTER, executionId=${executionId}, titulo=${this.sanitizeForLog(input.titulo)}`,
      );

      // CRÍTICO: Sanitizar dados PII antes de enviar para IA externa
      // Conformidade: LGPD Art. 46 § 1º + REQ-200
      // A IA receberá dados ofuscados mas ainda poderá detectar padrões
      const sanitizedInput = {
        titulo: this.sanitizeForPrompt(input.titulo || ""),
        descricao: this.sanitizeForPrompt(input.descricao || ""),
        categoria: input.categoria || "",
      };

      const publicationDataJson = JSON.stringify(sanitizedInput, null, 2);
      const prompt = SAFETY_PROMPT.replace(
        "{publicationDataJson}",
        publicationDataJson,
      );

      const modelId =
        process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

      const response = await this.openRouterService.prompt(prompt, {
        temperature: 0.1, // Mais determinístico para detecção objetiva
        maxTokens: 1200, // Aumentado para acomodar novo formato
      });

      const result = this.parseResponse(response, modelId, executionId);
      this.logger.log(
        `${method} EXIT, executionId=${executionId}, status=${result.status}, sensitiveFields=${result.fields.filter((f) => f.status === "sensitive").length}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `${method} ERROR, executionId=${executionId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Em caso de erro técnico, retornar null para permitir criação (fail-open)
      // O serviço chamador deve tratar null como "validação não disponível, permitir criação"
      return null;
    }
  }

  private parseResponse(
    response: string,
    modelId: string,
    executionId: string,
  ): PublicationCheckResult {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.logger.warn(
          `parseResponse: Resposta não contém JSON válido, aplicando fallback (fail-open)`,
        );
        return this.createFallbackResult(modelId, executionId);
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validar estrutura mínima
      if (!parsed.fields || !Array.isArray(parsed.fields)) {
        this.logger.warn(
          `parseResponse: Resposta sem campo 'fields', aplicando fallback (fail-open)`,
        );
        return this.createFallbackResult(modelId, executionId);
      }

      // Validar status
      const validStatuses = ["approved", "needs_revision", "blocked"];
      const overallStatus = validStatuses.includes(parsed.overall_status)
        ? parsed.overall_status
        : "needs_revision";

      // Processar campos
      const fields: FieldCheck[] = parsed.fields.map((field: any) => ({
        field: String(field.field || "unknown"),
        status: ["clean", "sensitive", "review"].includes(field.status)
          ? field.status
          : "review",
        evidences: Array.isArray(field.evidences) ? field.evidences : [],
        policy_reference: field.policy_reference || undefined,
      }));

      // Gerar reason baseado nos campos
      const sensitiveCount = fields.filter(
        (f) => f.status === "sensitive",
      ).length;
      const reviewCount = fields.filter((f) => f.status === "review").length;

      let reason = parsed.summary || "";
      if (!reason) {
        if (sensitiveCount > 0) {
          reason = `${sensitiveCount} campo(s) contém dados sensíveis que não devem ser expostos publicamente`;
        } else if (reviewCount > 0) {
          reason = `${reviewCount} campo(s) precisa de revisão manual`;
        } else {
          reason = "Nenhum dado sensível detectado";
        }
      }

      return {
        status: overallStatus,
        reason,
        fields,
        prompt_version: PROMPT_VERSION,
        model_id: modelId,
        execution_id: executionId,
      };
    } catch (error) {
      this.logger.error("Erro ao parsear resposta da IA:", error);
      // Em caso de erro de parsing, usar fallback fail-open
      return this.createFallbackResult(modelId, executionId);
    }
  }

  /**
   * Cria resultado fallback que libera a publicação com aviso de revisão
   * Implementa estratégia fail-open para reduzir falsos positivos
   */
  private createFallbackResult(
    modelId: string,
    executionId: string,
  ): PublicationCheckResult {
    return {
      status: "needs_revision",
      reason:
        "Validação automática indisponível. Publicação liberada para revisão manual.",
      fields: [
        {
          field: "titulo",
          status: "review",
          evidences: ["Validação automática falhou"],
        },
        {
          field: "descricao",
          status: "review",
          evidences: ["Validação automática falhou"],
        },
      ],
      prompt_version: PROMPT_VERSION,
      model_id: modelId,
      execution_id: executionId,
    };
  }

  /**
   * Gera ID único para cada execução
   */
  private generateExecutionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `exec_${timestamp}_${random}`;
  }

  /**
   * Sanitiza dados sensíveis antes de enviar para IA externa
   * Conformidade: LGPD Art. 46 § 1º + REQ-200
   *
   * Estratégia: Ofuscar PII mantendo padrões detectáveis
   * - Telefones: (11) 99999-9999 → (XX) XXXXX-XXXX [PHONE_PATTERN_DETECTED]
   * - CPF: 123.456.789-00 → XXX.XXX.XXX-XX [CPF_PATTERN_DETECTED]
   * - E-mails: user@domain.com → xxx@xxx.xxx [EMAIL_PATTERN_DETECTED]
   *
   * A IA ainda pode detectar que havia um padrão suspeito sem ver o dado real
   */
  private sanitizeForPrompt(text: string): string {
    if (!text) return "";

    let sanitized = text;

    // Ofuscar telefones com marcador de detecção (em ordem de especificidade)
    // 1. Formato internacional com +55
    sanitized = sanitized.replace(
      /\+55\s*\d{2}\s*\d{4,5}-?\d{4}/g,
      "(XX) XXXXX-XXXX [PHONE_PATTERN_DETECTED]",
    );
    // 2. Formato com parênteses (11) 99999-9999
    sanitized = sanitized.replace(
      /\(\d{2}\)\s*\d{4,5}-?\d{4}/g,
      "(XX) XXXXX-XXXX [PHONE_PATTERN_DETECTED]",
    );
    // 3. Formato sem parênteses 11 99999-9999
    sanitized = sanitized.replace(
      /\b\d{2}\s*\d{4,5}-?\d{4}\b/g,
      "XX XXXXX-XXXX [PHONE_PATTERN_DETECTED]",
    );

    // Ofuscar CPF/CNPJ com marcador (ordem: mais específico primeiro)
    // 1. CNPJ formatado
    sanitized = sanitized.replace(
      /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g,
      "XX.XXX.XXX/XXXX-XX [CNPJ_PATTERN_DETECTED]",
    );
    // 2. CPF formatado
    sanitized = sanitized.replace(
      /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
      "XXX.XXX.XXX-XX [CPF_PATTERN_DETECTED]",
    );
    // 3. CNPJ sem formatação (14 dígitos)
    sanitized = sanitized.replace(
      /\b\d{14}\b/g,
      "XXXXXXXXXXXXXX [CNPJ_PATTERN_DETECTED]",
    );
    // 4. CPF sem formatação (11 dígitos)
    sanitized = sanitized.replace(
      /\b\d{11}\b/g,
      "XXXXXXXXXXX [CPF_PATTERN_DETECTED]",
    );

    // Ofuscar e-mails com marcador
    sanitized = sanitized.replace(
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
      "xxx@xxx.xxx [EMAIL_PATTERN_DETECTED]",
    );

    return sanitized;
  }

  /**
   * Sanitiza dados sensíveis para logs
   * Remove ou ofusca informações sensíveis antes de registrar
   */
  private sanitizeForLog(text: string): string {
    if (!text) return "";

    let sanitized = text;

    // Ofuscar telefones
    sanitized = sanitized.replace(
      /\(\d{2}\)\s*\d{4,5}-?\d{4}/g,
      "(XX) XXXXX-XXXX",
    );
    sanitized = sanitized.replace(/\d{2}\s*\d{4,5}-?\d{4}/g, "XX XXXXX-XXXX");

    // Ofuscar CPF/CNPJ
    sanitized = sanitized.replace(
      /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
      "XXX.XXX.XXX-XX",
    );
    sanitized = sanitized.replace(
      /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g,
      "XX.XXX.XXX/XXXX-XX",
    );

    // Ofuscar e-mails
    sanitized = sanitized.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "xxx@xxx.xxx",
    );

    // Limitar tamanho para logs
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 97) + "...";
    }

    return sanitized;
  }
}
