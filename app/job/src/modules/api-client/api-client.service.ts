// app/jobsrc/modules/api-client/api-client.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BatchOnboardingDto } from '../../types/onboarding-user.dto';

interface BatchResponse {
  batchId: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    email: string;
    reason: string;
  }>;
}

@Injectable()
export class ApiClientService {
  private readonly logger = new Logger(ApiClientService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly maxRetries: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('api.baseUrl') || '';
    this.token = this.configService.get<string>('api.token') || '';
    this.maxRetries = this.configService.get<number>('job.maxRetries') || 3;
  }

  async sendBatch(payload: BatchOnboardingDto): Promise<BatchResponse> {
    const url = `${this.baseUrl}/app/api/internal/onboarding/batch`;
    let attempt = 0;
    let lastError: Error = new Error('Unknown error');

    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        this.logger.log(`Batch sent successfully: ${data.created} created, ${data.skipped} skipped`);
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
          this.logger.warn(`Retry ${attempt}/${this.maxRetries} after ${delay}ms: ${lastError.message}`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
