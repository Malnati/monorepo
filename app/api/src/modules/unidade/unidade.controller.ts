// app/api/src/modules/unidade/unidade.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UnidadeService } from './unidade.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('unidades')
export class UnidadeController {
  constructor(private readonly unidadeService: UnidadeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.unidadeService.findAll(userId);
  }
}
