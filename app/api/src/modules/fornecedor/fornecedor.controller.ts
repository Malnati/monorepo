// app/api/src/modules/fornecedor/fornecedor.controller.ts
import { Controller, Get, Param, NotFoundException, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { FornecedorService } from './fornecedor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fornecedores')
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}

  @Get(':id/avatar')
  @UseGuards(JwtAuthGuard)
  async getAvatar(@Param('id') id: string, @Res() res: Response, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    const fornecedor = await this.fornecedorService.findOne(parseInt(id, 10), userId);
    if (!fornecedor || !fornecedor.avatar) {
      throw new NotFoundException(`Avatar do fornecedor com ID ${id} não encontrado`);
    }
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(fornecedor.avatar);
  }
}

