// app/api/src/modules/gmail/gmail.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { google } from 'googleapis';
import { 
  GMAIL_CLIENT_ID, 
  GMAIL_CLIENT_SECRET, 
  GMAIL_REFRESH_TOKEN, 
  GMAIL_SENDER,
  validateGmailConfig
} from '../../config/email.config';

interface TransactionEmailPayload {
  fornecedor: {
    nome: string;
    email: string;
    whatsapp?: string;
  };
  comprador: {
    nome: string;
    email: string;
    whatsapp?: string;
  };
  lote: {
    titulo: string;
    quantidade: number;
    unidade: string;
    preco_unitario: number;
    preco_total: number;
  };
  transacao_id: number;
}

@Injectable()
export class GmailService implements OnModuleInit {
  private readonly logger = new Logger(GmailService.name);
  private oauth2Client: any;

  onModuleInit() {
    // Validar configuração no startup
    try {
      validateGmailConfig();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Gmail configuration incomplete - email notifications will be disabled');
      this.logger.warn(errorMessage);
    }
  }

  constructor() {
    this.initializeOAuth2Client();
  }

  private initializeOAuth2Client(): void {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        'urn:ietf:wg:oauth:2.0:oob'
      );

      this.oauth2Client.setCredentials({
        refresh_token: GMAIL_REFRESH_TOKEN,
      });

      this.logger.log('OAuth2 client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OAuth2 client', error);
      throw error;
    }
  }

  /**
   * Enviar e-mail de confirmação de transação
   * REQ-GMAIL-002: Envio transacional imediato após criação da transação
   * REQ-GMAIL-003: Mensagem com resumo completo do lote e contatos
   * REQ-GMAIL-004: Registrar messageId para auditoria
   */
  async sendTransactionSuccessEmail(
    payload: TransactionEmailPayload,
    recipient: 'fornecedor' | 'comprador'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const recipientData = recipient === 'fornecedor' ? payload.fornecedor : payload.comprador;
    const otherParty = recipient === 'fornecedor' ? payload.comprador : payload.fornecedor;
    const otherPartyLabel = recipient === 'fornecedor' ? 'Comprador' : 'Fornecedor';
    const recipientEmail = recipientData.email || '';

    try {

      if (!recipientData.email) {
        this.logger.warn(`No email found for ${recipient} in transaction ${payload.transacao_id}`);
        return {
          success: false,
          error: `Email não cadastrado para ${recipient}`,
        };
      }

      const subject = `Confirmação de Transação #${payload.transacao_id} - APP`;
      const emailBody = this.buildEmailBody(payload, recipient, otherParty, otherPartyLabel);

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const rawMessage = this.createRawMessage(
        recipientData.email,
        subject,
        emailBody
      );

      this.logger.log({
        event: 'gmail.send.attempt',
        transacao_id: payload.transacao_id,
        recipient_type: recipient,
        recipient_email: recipientData.email,
        sender: GMAIL_SENDER,
      });

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMessage,
        },
      });

      const messageId = response.data.id || undefined;

      this.logger.log({
        event: 'gmail.send',
        success: true,
        transacao_id: payload.transacao_id,
        recipient_type: recipient,
        recipient_email: recipientData.email,
        message_id: messageId,
        response_data: response.data,
      });

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorDetails = error instanceof Error && 'response' in error 
        ? (error as any).response?.data 
        : undefined;

      this.logger.error({
        event: 'gmail.send',
        success: false,
        transacao_id: payload.transacao_id,
        recipient_type: recipient,
        recipient_email: recipientEmail,
        error: errorMessage,
        error_stack: errorStack,
        error_details: errorDetails,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Construir corpo do e-mail seguindo UX Writing e checklist de linguagem
   * REQ-GMAIL-003: Resumo do lote, dados de contato e número da transação
   * Sanitiza nomes para prevenir injeção de conteúdo malicioso
   */
  private buildEmailBody(
    payload: TransactionEmailPayload,
    recipient: 'fornecedor' | 'comprador',
    otherParty: { nome: string; email: string; whatsapp?: string },
    otherPartyLabel: string
  ): string {
    const isSupplier = recipient === 'fornecedor';
    const action = isSupplier ? 'vendeu' : 'comprou';

    // Sanitizar nomes para prevenir injeção de conteúdo
    const sanitizeName = (name: string): string => {
      return name.replace(/[<>]/g, '').substring(0, 255);
    };

    const recipientName = sanitizeName(isSupplier ? payload.fornecedor.nome : payload.comprador.nome);
    const otherPartyName = sanitizeName(otherParty.nome);
    const loteName = sanitizeName(payload.lote.titulo);

    // Função para escapar HTML e prevenir XSS
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const nextSteps = isSupplier
      ? [
          'Entre em contato com o comprador para combinar a entrega',
          'Confirme os detalhes de pagamento',
          'Acompanhe o status na plataforma APP',
        ]
      : [
          'Entre em contato com o fornecedor para combinar a retirada',
          'Providencie o pagamento conforme acordado',
          'Acompanhe o status na plataforma APP',
        ];

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Transação #${payload.transacao_id} - APP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F5FB; line-height: 1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F5FB; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2D0F55; padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 32px; font-weight: 600; line-height: 1.25; color: #FFFFFF;">
                APP
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #1C1D22;">
                Olá <strong>${escapeHtml(recipientName)}</strong>,
              </p>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.5; color: #1C1D22;">
                Sua transação foi confirmada com sucesso!
              </p>
              
              <!-- Transaction Summary Card -->
              <div style="background-color: #F4F5FB; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 24px 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 600; line-height: 1.33; color: #1C1D22;">
                  Resumo da Transação #${payload.transacao_id}
                </h2>
                
                <div style="margin-bottom: 24px;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1C1D22;">
                    Você ${escapeHtml(action)}:
                  </p>
                  <ul style="margin: 0; padding-left: 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">
                    <li style="margin-bottom: 8px;">${escapeHtml(loteName)}</li>
                    <li style="margin-bottom: 8px;">Quantidade: ${payload.lote.quantidade} ${escapeHtml(payload.lote.unidade)}</li>
                    <li style="margin-bottom: 8px;">Valor unitário: R$ ${payload.lote.preco_unitario.toFixed(2)}</li>
                    <li style="margin-bottom: 8px;">Valor total: <strong>R$ ${payload.lote.preco_total.toFixed(2)}</strong></li>
                  </ul>
                </div>
                
                <div style="border-top: 1px solid #D9DBE7; padding-top: 24px;">
                  <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1C1D22;">
                    ${escapeHtml(otherPartyLabel)}:
                  </p>
                  <ul style="margin: 0; padding-left: 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">
                    <li style="margin-bottom: 8px;">Nome: ${escapeHtml(otherPartyName)}</li>
                    <li style="margin-bottom: 8px;">E-mail: <a href="mailto:${escapeHtml(otherParty.email)}" style="color: #00B5B8; text-decoration: none;">${escapeHtml(otherParty.email)}</a></li>
                    ${otherParty.whatsapp ? `<li style="margin-bottom: 8px;">WhatsApp: <a href="https://wa.me/${otherParty.whatsapp.replace(/\D/g, '')}" style="color: #00B5B8; text-decoration: none;">${escapeHtml(otherParty.whatsapp)}</a></li>` : ''}
                  </ul>
                </div>
              </div>
              
              <!-- Next Steps -->
              <div style="margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 600; line-height: 1.33; color: #1C1D22;">
                  Próximos Passos
                </h2>
                <ol style="margin: 0; padding-left: 24px; font-size: 16px; line-height: 1.5; color: #1C1D22;">
                  ${nextSteps.map((step, index) => `<li style="margin-bottom: ${index < nextSteps.length - 1 ? '8px' : '0'};">${escapeHtml(step)}</li>`).join('')}
                </ol>
              </div>
              
              <!-- Success Badge -->
              <div style="background-color: #1DB954; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #FFFFFF;">
                  ✓ Transação Confirmada
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F4F5FB; padding: 24px; text-align: center; border-top: 1px solid #D9DBE7;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.4; color: #6B7280;">
                Este é um e-mail automático da plataforma APP.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.4; color: #6B7280;">
                Para dúvidas ou suporte, acesse: <a href="https://example.com" style="color: #00B5B8; text-decoration: none;">https://example.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: #6B7280;">
                <strong>APP</strong> - Template Corporation<br>
                Conectando resíduos recicláveis a novas oportunidades.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Codificar assunto usando RFC 2047 para caracteres não-ASCII
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
   * Criar mensagem MIME base64url para Gmail API
   * Conforme especificação RFC 2822
   */
  private createRawMessage(to: string, subject: string, body: string): string {
    const encodedSubject = this.encodeSubject(subject);
    
    const message = [
      `From: APP <${GMAIL_SENDER}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer.from(message, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  }
}
