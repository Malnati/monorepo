// app/api/src/modules/transacao/transacao.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Request,
} from "@nestjs/common";
import { TransacaoService } from "./transacao.service";
import { CreateTransacaoDto } from "./transacao.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("transacoes")
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateTransacaoDto, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.transacaoService.create(createDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.transacaoService.findAllByUserId(userId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(@Param("id") id: string, @Request() req: any) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException(
        `ID inválido: ${id}. Deve ser um número inteiro positivo.`,
      );
    }
    const userId = req.user?.sub || req.user?.id || null;
    return this.transacaoService.findOne(parsedId, userId);
  }
}
