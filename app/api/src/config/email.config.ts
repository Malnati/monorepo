// app/api/src/config/email.config.ts

/**
 * Configuração centralizada de variáveis de ambiente para Gmail API
 * Utilizado pelo GmailModule para autenticação OAuth2 e envio de mensagens
 * Referência: REQ-GMAIL-001 (OAuth2 com escopo gmail.send)
 */

export const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || '';
export const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || '';
export const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || '';
export const GMAIL_SENDER = process.env.GMAIL_SENDER || 'noreply@dominio.com.br';

/**
 * Validar que todas as credenciais necessárias estão configuradas
 * Lançar erro explícito se variáveis críticas estiverem ausentes
 */
export function validateGmailConfig(): void {
  const missingVars: string[] = [];

  if (!GMAIL_CLIENT_ID) missingVars.push('GMAIL_CLIENT_ID');
  if (!GMAIL_CLIENT_SECRET) missingVars.push('GMAIL_CLIENT_SECRET');
  if (!GMAIL_REFRESH_TOKEN) missingVars.push('GMAIL_REFRESH_TOKEN');

  if (missingVars.length > 0) {
    throw new Error(
      `Configuração Gmail incompleta. Variáveis ausentes: ${missingVars.join(', ')}. ` +
      `Consulte docs/rup/99-anexos/MVP/plano-integration-gmail.md para instruções.`
    );
  }
}
