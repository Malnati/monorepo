// app/api/src/modules/tipo/tipo.controller.ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { TipoService } from './tipo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipos')
export class TipoController {
  constructor(private readonly tipoService: TipoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.tipoService.findAll(userId);
  }
}
