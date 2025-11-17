// app/api/src/modules/openrouter/openrouter.module.ts
import { Module } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';

@Module({
  providers: [OpenRouterService],
  exports: [OpenRouterService],
})
export class OpenRouterModule {}
