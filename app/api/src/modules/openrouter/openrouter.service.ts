// app/api/src/modules/openrouter/openrouter.service.ts
import { Injectable, Logger } from '@nestjs/common';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/app/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;
const REQUEST_MAX_ATTEMPTS = 3;
const REQUEST_RETRY_DELAY_MS = 1500;

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly httpReferer: string;
  private readonly appTitle: string;
  private readonly defaultModel: string;

  constructor() {
    this.baseUrl = process.env.OPENROUTER_BASE_URL || OPENROUTER_BASE_URL;
    this.apiKey = (process.env.OPENROUTER_API_KEY || '').trim();
    this.httpReferer = (process.env.OPENROUTER_HTTP_REFERER || '').trim();
    this.appTitle = (process.env.OPENROUTER_APP_TITLE || 'APP').trim();
    this.defaultModel = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    if (!this.apiKey) {
      this.logger.warn('OPENROUTER_API_KEY não configurada');
    }
  }

  /**
   * Envia mensagem de chat para OpenRouter
   */
  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {},
  ): Promise<string> {
    const method = 'chat';
    const t0 = Date.now();

    try {
      this.logger.log(`${method} ENTER, model=${options.model || this.defaultModel}`);

      if (!this.apiKey) {
        throw new Error('OpenRouter API key não configurada');
      }

      const payload = {
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      };

      const result = await this.executeRequest(payload);
      const dt = Date.now() - t0;

      this.logger.log(`${method} EXIT, durationMs=${dt}, resultLength=${result.length}`);
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR: ${error instanceof Error ? error.message : String(error)}, durationMs=${dt}`,
      );
      throw error;
    }
  }

  /**
   * Envia prompt simples (conveniência)
   */
  async prompt(text: string, options: ChatOptions = {}): Promise<string> {
    return this.chat([{ role: 'user', content: text }], options);
  }

  private async executeRequest(payload: Record<string, unknown>): Promise<string> {
    const headers = this.buildHeaders();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= REQUEST_MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data: any = await response.json();

        if (!response.ok) {
          const errorMessage = this.extractErrorMessage(data, response.status);
          throw new Error(errorMessage);
        }

        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error('Resposta vazia ou inválida do OpenRouter');
        }

        return content.trim();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.isRetryableError(lastError) && attempt < REQUEST_MAX_ATTEMPTS) {
          this.logger.warn(`Tentativa ${attempt} falhou, retrying...`);
          await this.delay(REQUEST_RETRY_DELAY_MS);
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Falha após múltiplas tentativas');
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (this.httpReferer) {
      headers['HTTP-Referer'] = this.httpReferer;
    }

    if (this.appTitle) {
      headers['X-Title'] = this.appTitle;
    }

    return headers;
  }

  private extractErrorMessage(data: any, status: number): string {
    if (data?.error) {
      if (typeof data.error === 'string') {
        return data.error;
      }
      if (data.error.message) {
        return data.error.message;
      }
    }
    return `OpenRouter request failed with status ${status}`;
  }

  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('502') ||
      message.includes('503')
    );
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
