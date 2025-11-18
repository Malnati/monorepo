// app/api/src/modules/fotos/fotos.controller.ts
import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Res,
  UseGuards,
  Request,
} from "@nestjs/common";
import { Response } from "express";
import { FotosService } from "./fotos.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("fotos")
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param("id") id: string,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || null;
    const foto = await this.fotosService.findOne(parseInt(id, 10), userId);
    if (!foto) {
      throw new NotFoundException(`Foto com ID ${id} não encontrada`);
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(foto.imagem);
  }
}
