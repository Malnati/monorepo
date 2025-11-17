// app/api/src/modules/agents/onboarding-eligibility.agent.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingEligibilityAgent } from './onboarding-eligibility.agent';
import { OpenRouterService } from '../openrouter/openrouter.service';

describe('OnboardingEligibilityAgent', () => {
  let agent: OnboardingEligibilityAgent;
  let openRouterService: jest.Mocked<OpenRouterService>;

  beforeEach(async () => {
    const mockOpenRouterService = {
      prompt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingEligibilityAgent,
        {
          provide: OpenRouterService,
          useValue: mockOpenRouterService,
        },
      ],
    }).compile();

    agent = module.get<OnboardingEligibilityAgent>(OnboardingEligibilityAgent);
    openRouterService = module.get(OpenRouterService);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  describe('checkEligibility', () => {
    it('should return eligible result when AI approves', async () => {
      const mockResponse = JSON.stringify({
        eligible: true,
        reason: 'Dados consistentes e legítimos',
        confidence: 0.95,
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkEligibility({
        email: 'test@gmail.com',
        nome: 'João Silva',
      });

      expect(result.eligible).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(openRouterService.prompt).toHaveBeenCalled();
    });

    it('should return not eligible when AI rejects', async () => {
      const mockResponse = JSON.stringify({
        eligible: false,
        reason: 'Dados inconsistentes ou suspeitos',
        confidence: 0.8,
      });

      openRouterService.prompt.mockResolvedValue(mockResponse);

      const result = await agent.checkEligibility({
        email: 'suspicious@example.com',
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('inconsistentes');
    });

    it('should handle AI errors gracefully', async () => {
      openRouterService.prompt.mockRejectedValue(new Error('API Error'));

      const result = await agent.checkEligibility({
        email: 'test@gmail.com',
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Erro na validação automática');
      expect(result.confidence).toBe(0);
    });

    it('should handle invalid JSON response', async () => {
      openRouterService.prompt.mockResolvedValue('Invalid JSON response');

      const result = await agent.checkEligibility({
        email: 'test@gmail.com',
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Resposta da IA inválida');
    });
  });
});
