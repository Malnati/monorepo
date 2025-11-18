// app/api/src/modules/agents/publication-safety.agent.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { PublicationSafetyAgent } from "./publication-safety.agent";
import { OpenRouterService } from "../openrouter/openrouter.service";

describe("PublicationSafetyAgent", () => {
  let agent: PublicationSafetyAgent;
  let openRouterService: jest.Mocked<OpenRouterService>;

  beforeEach(async () => {
    const mockOpenRouterService = {
      prompt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicationSafetyAgent,
        {
          provide: OpenRouterService,
          useValue: mockOpenRouterService,
        },
      ],
    }).compile();

    agent = module.get<PublicationSafetyAgent>(PublicationSafetyAgent);
    openRouterService = module.get(OpenRouterService);
  });

  it("should be defined", () => {
    expect(agent).toBeDefined();
  });

  describe("checkPublication - Detecção de Dados Sensíveis", () => {
    it("should approve clean publications without sensitive data", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "clean",
            evidences: [],
          },
        ],
        overall_status: "approved",
        summary: "Nenhum dado sensível detectado",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Lote de papelão disponível em São Paulo",
        descricao:
          "100kg de papelão limpo e seco, pronto para retirada. Aceito PIX e boleto.",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("approved");
      expect(result!.fields).toHaveLength(2);
      expect(result!.fields.every((f) => f.status === "clean")).toBe(true);
      expect(result!.prompt_version).toBeDefined();
      expect(result!.execution_id).toBeDefined();
    });

    it("should block publications with phone numbers (CHECK_02)", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "sensitive",
            evidences: ["Padrão de telefone detectado"],
            policy_reference: "REQ-031",
          },
        ],
        overall_status: "blocked",
        summary: "1 campo contém dados sensíveis",
      });

      let promptSent = "";
      openRouterService.prompt.mockImplementation(async (prompt: string) => {
        promptSent = prompt;
        return mockResponse;
      });

      const result = await agent.checkPublication({
        titulo: "Material disponível",
        descricao: "Entre em contato: (11) 99999-9999",
      });

      // Verificar que o prompt está sanitizado (dados ofuscados antes de enviar para IA)
      expect(promptSent).toContain("[PHONE_PATTERN_DETECTED]");
      expect(promptSent).not.toContain("99999-9999");

      expect(result).not.toBeNull();
      expect(result!.status).toBe("blocked");

      const sensitiveFields = result!.fields.filter(
        (f) => f.status === "sensitive",
      );
      expect(sensitiveFields).toHaveLength(1);
      expect(sensitiveFields[0].field).toBe("descricao");
      expect(sensitiveFields[0].policy_reference).toBe("REQ-031");
    });

    it("should block publications with complete addresses (CHECK_03)", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "sensitive",
            evidences: ["Endereço completo detectado: Rua das Flores, 123"],
            policy_reference: "REQ-031",
          },
        ],
        overall_status: "blocked",
        summary: "1 campo contém dados sensíveis",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Plástico PET disponível",
        descricao: "Material localizado na Rua das Flores, 123, Bairro Centro",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("blocked");

      const sensitiveFields = result!.fields.filter(
        (f) => f.status === "sensitive",
      );
      expect(sensitiveFields).toHaveLength(1);
      expect(sensitiveFields[0].evidences.length).toBeGreaterThan(0);
    });

    it("should allow generic locations (cities/states)", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "clean",
            evidences: [],
          },
        ],
        overall_status: "approved",
        summary: "Nenhum dado sensível detectado",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Lote em São Paulo",
        descricao:
          "Material disponível na zona leste de São Paulo, próximo ao centro",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("approved");
      expect(result!.fields.every((f) => f.status === "clean")).toBe(true);
    });

    it("should block publications with CPF/CNPJ (CHECK_06)", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "sensitive",
            evidences: ["CPF detectado no texto"],
            policy_reference: "REQ-200",
          },
        ],
        overall_status: "blocked",
        summary: "1 campo contém dados sensíveis",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Material reciclável",
        descricao: "Favor enviar proposta para CPF 123.456.789-00",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("blocked");

      const sensitiveFields = result!.fields.filter(
        (f) => f.status === "sensitive",
      );
      expect(sensitiveFields).toHaveLength(1);
      expect(sensitiveFields[0].policy_reference).toBe("REQ-200");
    });

    it("should block publications with personal names (CHECK_05)", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "sensitive",
            evidences: ["Nome completo detectado: João Silva"],
            policy_reference: "REQ-031",
          },
        ],
        overall_status: "blocked",
        summary: "1 campo contém dados sensíveis",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Plásticos disponíveis",
        descricao: "Entre em contato com João Silva para mais informações",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("blocked");
    });

    it("should allow company/cooperative names", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "clean",
            evidences: [],
          },
        ],
        overall_status: "approved",
        summary: "Nenhum dado sensível detectado",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Material da Cooperativa Recicla Mais",
        descricao:
          "Oferecido pela Cooperativa Recicla Mais, parceira certificada",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("approved");
    });

    it('should use "review" status for ambiguous cases', async () => {
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "review",
            evidences: ["Possível nome próprio - requer revisão manual"],
          },
        ],
        overall_status: "needs_revision",
        summary: "1 campo precisa revisão manual",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Material PET",
        descricao: "Material coletado por Marcos Pereira da Silva",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("needs_revision");

      const reviewFields = result!.fields.filter((f) => f.status === "review");
      expect(reviewFields).toHaveLength(1);
    });

    it("should handle AI errors by returning null (fail-open)", async () => {
      openRouterService.prompt.mockRejectedValue(new Error("API Error"));

      const result = await agent.checkPublication({
        titulo: "Teste",
        descricao: "Descrição",
      });

      expect(result).toBeNull();
    });

    it("should apply fail-open strategy for invalid JSON response", async () => {
      openRouterService.prompt.mockResolvedValue(
        "Invalid response without JSON",
      );

      const result = await agent.checkPublication({
        titulo: "Teste",
        descricao: "Descrição",
      });

      expect(result).not.toBeNull();
      // Com fail-open, deve liberar para revisão em vez de bloquear
      expect(result!.status).toBe("needs_revision");
      expect(result!.reason).toContain("indisponível");
      expect(result!.fields.every((f) => f.status === "review")).toBe(true);
    });

    it("should include tracking fields in all responses", async () => {
      const mockResponse = JSON.stringify({
        fields: [
          { field: "titulo", status: "clean", evidences: [] },
          { field: "descricao", status: "clean", evidences: [] },
        ],
        overall_status: "approved",
        summary: "OK",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkPublication({
        titulo: "Teste",
        descricao: "Descrição",
      });

      expect(result).not.toBeNull();
      expect(result!.prompt_version).toBeDefined();
      expect(result!.prompt_version).toMatch(/^\d{4}-\d{2}-\d{2}-v\d+$/);
      expect(result!.execution_id).toBeDefined();
      expect(result!.execution_id).toMatch(/^exec_\d+_[a-z0-9]+$/);
      expect(result!.model_id).toBeDefined();
    });

    it("should NOT block publications based on quality issues", async () => {
      // Testa que o agente foca APENAS em dados sensíveis
      const mockResponse = JSON.stringify({
        fields: [
          {
            field: "titulo",
            status: "clean",
            evidences: [],
          },
          {
            field: "descricao",
            status: "clean",
            evidences: [],
          },
        ],
        overall_status: "approved",
        summary: "Nenhum dado sensível detectado",
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      // Descrição com erros de gramática mas sem dados sensíveis
      const result = await agent.checkPublication({
        titulo: "material",
        descricao: "tem material aqui pra vender barato muito bom",
      });

      expect(result).not.toBeNull();
      expect(result!.status).toBe("approved");
      // Não deve bloquear por qualidade textual
    });

    it("should sanitize PII before sending to external AI (LGPD compliance)", async () => {
      // CRÍTICO: Verificar que dados pessoais são ofuscados antes de enviar para IA externa
      const mockResponse = JSON.stringify({
        fields: [
          { field: "titulo", status: "clean", evidences: [] },
          {
            field: "descricao",
            status: "sensitive",
            evidences: ["Padrões sensíveis detectados"],
            policy_reference: "REQ-200",
          },
        ],
        overall_status: "blocked",
        summary: "Dados sensíveis detectados",
      });

      let promptSentToAI = "";
      openRouterService.prompt.mockImplementation((prompt: string) => {
        promptSentToAI = prompt;
        return Promise.resolve(mockResponse);
      });

      await agent.checkPublication({
        titulo: "Contato urgente",
        descricao:
          "Meu CPF é 123.456.789-00, telefone (11) 98765-4321 e email teste@exemplo.com",
      });

      // Verificar que o prompt enviado NÃO contém dados reais
      expect(promptSentToAI).not.toContain("123.456.789-00");
      expect(promptSentToAI).not.toContain("98765-4321");
      expect(promptSentToAI).not.toContain("teste@exemplo.com");

      // Verificar que marcadores de detecção estão presentes
      expect(promptSentToAI).toContain("[CPF_PATTERN_DETECTED]");
      expect(promptSentToAI).toContain("[PHONE_PATTERN_DETECTED]");
      expect(promptSentToAI).toContain("[EMAIL_PATTERN_DETECTED]");
    });
  });
});
