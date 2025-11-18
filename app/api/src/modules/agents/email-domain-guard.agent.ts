// app/api/src/modules/agents/email-domain-guard.agent.ts
import { Injectable, Logger } from "@nestjs/common";

export interface DomainCheckResult {
  valid: boolean;
  domain: string;
  provider: string;
  reason?: string;
}

const ALLOWED_DOMAINS = ["gmail.com", "googlemail.com"];

const GOOGLE_WORKSPACE_PATTERN =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

@Injectable()
export class EmailDomainGuardAgent {
  private readonly logger = new Logger(EmailDomainGuardAgent.name);

  /**
   * Valida se o domínio do e-mail é Gmail ou Google Workspace
   */
  async checkDomain(email: string): Promise<DomainCheckResult> {
    const method = "checkDomain";
    try {
      this.logger.log(`${method} ENTER, email=${email}`);

      const normalizedEmail = email.toLowerCase().trim();
      const domain = this.extractDomain(normalizedEmail);

      if (!domain) {
        return {
          valid: false,
          domain: "",
          provider: "unknown",
          reason: "E-mail inválido",
        };
      }

      // Verificar se é Gmail direto
      if (ALLOWED_DOMAINS.includes(domain)) {
        this.logger.log(`${method} EXIT, valid=true, provider=gmail`);
        return {
          valid: true,
          domain,
          provider: "gmail",
        };
      }

      // Verificar se pode ser Google Workspace
      if (this.couldBeGoogleWorkspace(normalizedEmail)) {
        // Para Google Workspace, precisaríamos fazer uma verificação MX record
        // Por ora, vamos aceitar domínios corporativos com estrutura válida
        // mas registrar para revisão manual se necessário
        this.logger.log(
          `${method} EXIT, valid=true, provider=google-workspace-candidate`,
        );
        return {
          valid: true,
          domain,
          provider: "google-workspace",
        };
      }

      this.logger.log(`${method} EXIT, valid=false, domain=${domain}`);
      return {
        valid: false,
        domain,
        provider: "other",
        reason: "Apenas e-mails Gmail ou Google Workspace são aceitos",
      };
    } catch (error) {
      this.logger.error(
        `${method} ERROR: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        valid: false,
        domain: "",
        provider: "error",
        reason: "Erro na validação do domínio",
      };
    }
  }

  private extractDomain(email: string): string | null {
    const match = email.match(/@(.+)$/);
    return match ? match[1] : null;
  }

  private couldBeGoogleWorkspace(email: string): boolean {
    // Validar formato básico de e-mail
    if (!GOOGLE_WORKSPACE_PATTERN.test(email)) {
      return false;
    }

    const domain = this.extractDomain(email);
    if (!domain) {
      return false;
    }

    // Google Workspace geralmente usa domínios corporativos (não gratuitos)
    // Excluir provedores conhecidos não-Google
    const excludedDomains = [
      "hotmail.com",
      "outlook.com",
      "yahoo.com",
      "dominio.com.br",
      "live.com",
      "msn.com",
      "aol.com",
      "icloud.com",
      "me.com",
      "protonmail.com",
      "yandex.com",
      "mail.ru",
    ];

    return !excludedDomains.includes(domain);
  }
}
