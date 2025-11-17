// app/job/src/modules/importer/importer.module.ts

import { Module } from '@nestjs/common';
import { ImporterService } from './importer.service';
import { CsvParserService } from './csv-parser.service';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { ApiClientModule } from '../api-client/api-client.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [FilesystemModule, ApiClientModule, AuditModule],
  providers: [ImporterService, CsvParserService],
  exports: [ImporterService],
})
export class ImporterModule {}
