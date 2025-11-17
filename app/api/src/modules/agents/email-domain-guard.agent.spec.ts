// app/api/src/modules/agents/email-domain-guard.agent.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmailDomainGuardAgent } from './email-domain-guard.agent';

describe('EmailDomainGuardAgent', () => {
  let agent: EmailDomainGuardAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailDomainGuardAgent],
    }).compile();

    agent = module.get<EmailDomainGuardAgent>(EmailDomainGuardAgent);
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  describe('checkDomain', () => {
    it('should accept gmail.com domains', async () => {
      const result = await agent.checkDomain('user@gmail.com');
      expect(result.valid).toBe(true);
      expect(result.provider).toBe('gmail');
    });

    it('should accept googlemail.com domains', async () => {
      const result = await agent.checkDomain('user@googlemail.com');
      expect(result.valid).toBe(true);
      expect(result.provider).toBe('gmail');
    });

    it('should accept potential Google Workspace domains', async () => {
      const result = await agent.checkDomain('user@company.com');
      expect(result.valid).toBe(true);
      expect(result.provider).toBe('google-workspace');
    });

    it('should reject known non-Google providers', async () => {
      const result = await agent.checkDomain('user@hotmail.com');
      expect(result.valid).toBe(false);
      expect(result.provider).toBe('other');
      expect(result.reason).toContain('Gmail ou Google Workspace');
    });

    it('should reject Yahoo domains', async () => {
      const result = await agent.checkDomain('user@yahoo.com');
      expect(result.valid).toBe(false);
      expect(result.provider).toBe('other');
    });

    it('should reject Outlook domains', async () => {
      const result = await agent.checkDomain('user@outlook.com');
      expect(result.valid).toBe(false);
      expect(result.provider).toBe('other');
    });

    it('should handle invalid email format', async () => {
      const result = await agent.checkDomain('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('E-mail inválido');
    });

    it('should normalize email to lowercase', async () => {
      const result = await agent.checkDomain('User@Gmail.Com');
      expect(result.valid).toBe(true);
      expect(result.provider).toBe('gmail');
    });
  });
});
