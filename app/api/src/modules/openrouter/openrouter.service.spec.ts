// app/api/src/modules/openrouter/openrouter.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { OpenRouterService } from "./openrouter.service";

/**
 * IMPORTANTE: Este teste NÃO faz chamadas reais à API OpenRouter.
 * Ele apenas testa o comportamento quando a API key não está configurada,
 * garantindo que o serviço lança erro antes de fazer qualquer chamada HTTP.
 *
 * Nenhum teste aqui configura OPENROUTER_API_KEY, então nenhuma chamada real é feita.
 */
describe("OpenRouterService", () => {
  let service: OpenRouterService;

  beforeEach(async () => {
    // Garantir que OPENROUTER_API_KEY não está definida no ambiente de teste
    delete process.env.OPENROUTER_API_KEY;

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterService],
    }).compile();

    service = module.get<OpenRouterService>(OpenRouterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("prompt", () => {
    it("should throw error when API key is not configured", async () => {
      await expect(service.prompt("test")).rejects.toThrow(
        "OpenRouter API key não configurada",
      );
    });
  });

  describe("chat", () => {
    it("should throw error when API key is not configured", async () => {
      const messages = [{ role: "user" as const, content: "test" }];
      await expect(service.chat(messages)).rejects.toThrow(
        "OpenRouter API key não configurada",
      );
    });
  });
});
