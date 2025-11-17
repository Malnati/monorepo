// app/job/src/modules/api-client/api-client.module.ts

import { Module } from '@nestjs/common';
import { ApiClientService } from './api-client.service';

@Module({
  providers: [ApiClientService],
  exports: [ApiClientService],
})
export class ApiClientModule {}
