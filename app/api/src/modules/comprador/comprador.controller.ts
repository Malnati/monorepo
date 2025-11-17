// app/api/src/modules/comprador/comprador.controller.ts
import { Controller, Get, Param, NotFoundException, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { CompradorService } from './comprador.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('compradores')
export class CompradorController {
  constructor(private readonly compradorService: CompradorService) {}

  @Get(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async getAvatar(@Param('id') id: string, @Res() res: Response, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    const comprador = await this.compradorService.findOne(parseInt(id, 10), userId);
    if (!comprador || !comprador.avatar) {
      throw new NotFoundException(`Avatar do comprador com ID ${id} não encontrado`);
    }
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(comprador.avatar);
  }
}

