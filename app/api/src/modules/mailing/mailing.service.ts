// app/api/src/modules/mailing/mailing.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || '';
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';
const GMAIL_SENDER = process.env.GMAIL_SENDER || 'noreply@dominio.com.br';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5174';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class MailingService {
  private readonly logger = new Logger(MailingService.name);
  private readonly oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
    );
    this.oauth2Client.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN,
    });
  }

  /**
   * Envia e-mail usando Gmail API
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const rawMessage = this.createRawMessage(options);
      
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMessage,
        },
      });

      this.logger.log(`E-mail enviado com sucesso para ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Envia e-mail de ativação de conta
   */
  async sendActivationEmail(
    email: string,
    token: string,
    nome?: string,
  ): Promise<boolean> {
    const activationLink = `${APP_BASE_URL}/ativacao?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    
    const html = this.getActivationEmailHtml(activationLink, nome || 'Usuário');
    const text = this.getActivationEmailText(activationLink, nome || 'Usuário');

    return this.sendEmail({
      to: email,
      subject: 'Ative sua conta na APP',
      html,
      text,
    });
  }

  /**
   * Codifica assunto usando RFC 2047 para caracteres não-ASCII
   */
  private encodeSubject(subject: string): string {
    // Verificar se contém caracteres não-ASCII
    const hasNonAscii = /[^\x00-\x7F]/.test(subject);
    
    if (!hasNonAscii) {
      return subject;
    }

    // Codificar em base64 com prefixo RFC 2047
    const encoded = Buffer.from(subject, 'utf-8').toString('base64');
    return `=?UTF-8?B?${encoded}?=`;
  }

  /**
   * Cria mensagem RFC 2822 codificada em base64
   */
  private createRawMessage(options: EmailOptions): string {
    const encodedSubject = this.encodeSubject(options.subject);
    
    const messageParts = [
      `From: APP <${GMAIL_SENDER}>`,
      `To: ${options.to}`,
      `Subject: ${encodedSubject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary-mixed"',
      '',
      '--boundary-mixed',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      options.text,
      '',
      '--boundary-mixed',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      options.html,
      '',
      '--boundary-mixed--',
    ];

    const message = messageParts.join('\r\n');
    return Buffer.from(message, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Retorna HTML do e-mail de ativação
   */
  private getActivationEmailHtml(activationLink: string, nome: string): string {
    const templatePath = path.join(__dirname, 'templates', 'welcome-activation.html');
    
    try {
      let html = fs.readFileSync(templatePath, 'utf-8');
      html = html.replace(/\{\{nome\}\}/g, nome);
      html = html.replace(/\{\{activationLink\}\}/g, activationLink);
      return html;
    } catch (error) {
      this.logger.error('Erro ao ler template de e-mail, usando fallback', error);
      return this.getActivationEmailHtmlFallback(activationLink, nome);
    }
  }

  /**
   * Fallback HTML se template não estiver disponível
   */
  private getActivationEmailHtmlFallback(activationLink: string, nome: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ative sua conta na APP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F5FB;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F5FB; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 48px 32px; text-align: center;">
                            <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 600; color: #2D0F55; font-family: 'Manrope', sans-serif;">Bem-vindo à APP!</h1>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.5; color: #1C1D22;">Olá, ${nome}! Para ativar sua conta, clique no botão abaixo:</p>
                            <a href="${activationLink}" style="display: inline-block; padding: 16px 32px; background-color: #00B5B8; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Ativar minha conta</a>
                            <p style="margin: 32px 0 0; font-size: 12px; line-height: 1.4; color: #6B7280;">Este link expira em 24 horas. Se você não solicitou esta conta, ignore este e-mail.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 32px; background-color: #F4F5FB; text-align: center;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #6B7280;">Precisa de ajuda? Entre em contato com nosso suporte.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Retorna versão texto puro do e-mail de ativação
   */
  private getActivationEmailText(activationLink: string, nome: string): string {
    return `
Bem-vindo à APP!

Olá, ${nome}!

Para ativar sua conta, acesse o link abaixo:

${activationLink}

Este link expira em 24 horas. Se você não solicitou esta conta, ignore este e-mail.

Precisa de ajuda? Entre em contato com nosso suporte.

---
APP - CLImate INvestment
    `.trim();
  }

  /**
   * Envia e-mail de rejeição de domínio
   */
  async sendDomainRejectionEmail(
    email: string,
    nome?: string,
  ): Promise<boolean> {
    const html = this.getDomainRejectionEmailHtml(nome || 'Usuário');
    const text = this.getDomainRejectionEmailText(nome || 'Usuário');

    return this.sendEmail({
      to: email,
      subject: 'Cadastro na APP - Domínio de e-mail não aceito',
      html,
      text,
    });
  }

  /**
   * Retorna HTML do e-mail de rejeição de domínio
   */
  private getDomainRejectionEmailHtml(nome: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro na APP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F5FB;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F5FB; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 48px 32px; text-align: center;">
                            <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 600; color: #2D0F55; font-family: 'Manrope', sans-serif;">Cadastro na APP</h1>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">Olá, ${nome}!</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">Recebemos sua tentativa de cadastro, mas apenas e-mails <strong>Gmail</strong> ou <strong>Google Workspace</strong> são aceitos atualmente.</p>
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.5; color: #1C1D22;">Para se cadastrar, por favor acesse:</p>
                            <a href="https://dominio.com.br" style="display: inline-block; padding: 16px 32px; background-color: #00B5B8; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">Acessar APP</a>
                            <p style="margin: 32px 0 0; font-size: 12px; line-height: 1.4; color: #6B7280;">Use um e-mail Gmail ou Google Workspace para criar sua conta.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 32px; background-color: #F4F5FB; text-align: center;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #6B7280;">Precisa de ajuda? Entre em contato com nosso suporte.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Retorna versão texto puro do e-mail de rejeição de domínio
   */
  private getDomainRejectionEmailText(nome: string): string {
    return `
Cadastro na APP

Olá, ${nome}!

Recebemos sua tentativa de cadastro, mas apenas e-mails Gmail ou Google Workspace são aceitos atualmente.

Para se cadastrar, por favor acesse: https://dominio.com.br

Use um e-mail Gmail ou Google Workspace para criar sua conta.

Precisa de ajuda? Entre em contato com nosso suporte.

---
APP - CLImate INvestment
    `.trim();
  }

  /**
   * Envia e-mail de orientação quando publicação é rejeitada ou precisa de revisão
   */
  async sendPublicationGuidanceEmail(
    email: string,
    nome: string,
    status: string,
    reason: string,
    issues: string[],
    suggestions?: string[],
  ): Promise<boolean> {
    const html = this.getPublicationGuidanceEmailHtml(nome, status, reason, issues, suggestions);
    const text = this.getPublicationGuidanceEmailText(nome, status, reason, issues, suggestions);

    const subject = status === 'blocked'
      ? 'Publicação bloqueada na APP - Orientações'
      : 'Publicação precisa de revisão na APP - Orientações';

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Retorna HTML do e-mail de orientação de publicação
   */
  private getPublicationGuidanceEmailHtml(
    nome: string,
    status: string,
    reason: string,
    issues: string[],
    suggestions?: string[],
  ): string {
    const isBlocked = status === 'blocked';
    const title = isBlocked ? 'Publicação bloqueada' : 'Publicação precisa de revisão';
    const titleColor = isBlocked ? '#E63946' : '#FF9F1C';

    const issuesList = issues.map((issue) => `<li style="margin-bottom: 8px;">${this.escapeHtml(issue)}</li>`).join('');
    const suggestionsList = suggestions && suggestions.length > 0
      ? suggestions.map((suggestion) => `<li style="margin-bottom: 8px;">${this.escapeHtml(suggestion)}</li>`).join('')
      : '';

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - APP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F5FB;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F5FB; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 48px 32px; text-align: left;">
                            <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 600; color: ${titleColor}; font-family: 'Manrope', sans-serif;">${title}</h1>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">Olá, ${this.escapeHtml(nome)}!</p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">${this.escapeHtml(reason)}</p>
                            
                            ${issues.length > 0 ? `
                            <div style="margin: 24px 0; padding: 16px; background-color: #F4F5FB; border-radius: 8px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #1C1D22;">Problemas encontrados:</h2>
                                <ul style="margin: 0; padding-left: 20px; color: #1C1D22;">
                                    ${issuesList}
                                </ul>
                            </div>
                            ` : ''}
                            
                            ${suggestionsList ? `
                            <div style="margin: 24px 0; padding: 16px; background-color: #F4F5FB; border-radius: 8px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #1C1D22;">Sugestões de correção:</h2>
                                <ul style="margin: 0; padding-left: 20px; color: #1C1D22;">
                                    ${suggestionsList}
                                </ul>
                            </div>
                            ` : ''}
                            
                            <div style="margin: 32px 0 0; padding: 16px; background-color: #F4F5FB; border-radius: 8px;">
                                <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #1C1D22;">O que fazer agora:</h2>
                                <ul style="margin: 0; padding-left: 20px; color: #1C1D22;">
                                    <li style="margin-bottom: 8px;">Revise sua publicação e remova informações pessoais (telefone, e-mail, endereço completo)</li>
                                    <li style="margin-bottom: 8px;">Use apenas informações comerciais permitidas (nome do fornecedor, tipo de resíduo, quantidade, preço)</li>
                                    <li style="margin-bottom: 8px;">Tente publicar novamente após fazer as correções</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 32px 0 0; font-size: 12px; line-height: 1.4; color: #6B7280;">Precisa de ajuda? Entre em contato com nosso suporte.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 32px; background-color: #F4F5FB; text-align: center;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #6B7280;">APP - CLImate INvestment</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Retorna versão texto puro do e-mail de orientação de publicação
   */
  private getPublicationGuidanceEmailText(
    nome: string,
    status: string,
    reason: string,
    issues: string[],
    suggestions?: string[],
  ): string {
    const title = status === 'blocked' ? 'Publicação bloqueada' : 'Publicação precisa de revisão';
    
    let text = `
${title} - APP

Olá, ${nome}!

${reason}

`;

    if (issues.length > 0) {
      text += `Problemas encontrados:\n`;
      issues.forEach((issue) => {
        text += `- ${issue}\n`;
      });
      text += `\n`;
    }

    if (suggestions && suggestions.length > 0) {
      text += `Sugestões de correção:\n`;
      suggestions.forEach((suggestion) => {
        text += `- ${suggestion}\n`;
      });
      text += `\n`;
    }

    text += `O que fazer agora:\n`;
    text += `- Revise sua publicação e remova informações pessoais (telefone, e-mail, endereço completo)\n`;
    text += `- Use apenas informações comerciais permitidas (nome do fornecedor, tipo de resíduo, quantidade, preço)\n`;
    text += `- Tente publicar novamente após fazer as correções\n\n`;

    text += `Precisa de ajuda? Entre em contato com nosso suporte.\n\n`;
    text += `---\n`;
    text += `APP - CLImate INvestment\n`;

    return text.trim();
  }

  /**
   * Escapa HTML para prevenir XSS
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
