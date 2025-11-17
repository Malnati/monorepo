// app/job/src/modules/importer/importer.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { FilesystemService } from '../filesystem/filesystem.service';
import { ApiClientService } from '../api-client/api-client.service';
import { AuditService } from '../audit/audit.service';
import { CsvParserService } from './csv-parser.service';
import { ImportResult } from '../../types/csv-row.interface';
import { CreateOnboardingUserDto } from '../../types/onboarding-user.dto';

@Injectable()
export class ImporterService {
  private readonly logger = new Logger(ImporterService.name);
  private readonly batchSize: number;
  private isProcessing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly filesystemService: FilesystemService,
    private readonly apiClientService: ApiClientService,
    private readonly auditService: AuditService,
    private readonly csvParserService: CsvParserService,
  ) {
    this.batchSize = this.configService.get<number>('job.batchSize') || 100;
  }

  async onModuleInit() {
    await this.filesystemService.ensureDirectories();
    this.logger.log('Importer service initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processInbox() {
    if (this.isProcessing) {
      this.logger.debug('Already processing, skipping this cycle');
      return;
    }

    this.isProcessing = true;

    try {
      const files = await this.filesystemService.findNewCsvFiles();
      
      for (const filename of files) {
        await this.processFile(filename);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error processing inbox: ${errorMessage}`, errorStack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processFile(filename: string): Promise<void> {
    const startTime = Date.now();
    
    // Adquirir lock
    const lockAcquired = await this.filesystemService.acquireLock(filename);
    if (!lockAcquired) {
      this.logger.debug(`File ${filename} is already being processed`);
      return;
    }

    try {
      this.logger.log(`Processing file: ${filename}`);

      // Ler arquivo
      const content = await this.filesystemService.readCsvFile(filename);

      // Parse CSV
      const { rows, errors: parseErrors } = await this.csvParserService.parseCsv(content);
      
      const validationErrors = [...parseErrors];
      const normalizedUsers = [];

      // Normalizar e validar cada linha
      for (let i = 0; i < rows.length; i++) {
        const { user, errors } = this.csvParserService.normalizeUser(rows[i], i + 2); // +2 por causa do header
        
        if (user) {
          normalizedUsers.push(user);
        }
        
        validationErrors.push(...errors);
      }

      // Deduplicar
      const uniqueUsers = this.csvParserService.deduplicateUsers(normalizedUsers);

      this.logger.log(`Parsed ${rows.length} rows, ${uniqueUsers.length} unique valid users, ${validationErrors.length} errors`);

      // Enviar em lotes
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const batchErrors = [];

      for (let i = 0; i < uniqueUsers.length; i += this.batchSize) {
        const batch = uniqueUsers.slice(i, i + this.batchSize);
        
        try {
          const response = await this.apiClientService.sendBatch({
            source: 'job',
            users: batch.map(user => this.toDto(user)),
          });

          created += response.created;
          updated += response.updated;
          skipped += response.skipped;
          batchErrors.push(...response.errors);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to send batch: ${errorMessage}`);
          batchErrors.push({
            email: 'batch',
            reason: errorMessage,
          });
        }
      }

      const processingTimeMs = Date.now() - startTime;

      const result: ImportResult = {
        filename,
        totalRows: rows.length,
        validRows: uniqueUsers.length,
        invalidRows: validationErrors.length,
        created,
        updated,
        skipped,
        errors: validationErrors,
        processingTimeMs,
      };

      // Registrar auditoria
      this.auditService.recordImport(result);

      // Mover arquivo
      if (validationErrors.length === 0 && batchErrors.length === 0) {
        await this.filesystemService.moveToProcessed(filename);
      } else {
        await this.filesystemService.moveToFailed(filename, {
          ...result,
          batchErrors,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error processing file ${filename}: ${errorMessage}`, errorStack);
      this.auditService.recordError(filename, error);
      
      try {
        await this.filesystemService.moveToFailed(filename, {
          error: errorMessage,
          stack: errorStack,
        });
      } catch (moveError) {
        const moveErrorMessage = moveError instanceof Error ? moveError.message : String(moveError);
        this.logger.error(`Failed to move file to failed directory: ${moveErrorMessage}`);
      }
    } finally {
      await this.filesystemService.releaseLock(filename);
    }
  }

  private toDto(user: any): CreateOnboardingUserDto {
    return {
      email: user.email,
      fullName: user.fullName,
      document: user.document,
      birthDate: user.birthDate,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      consent: user.consent,
    };
  }
}
