// app/api/src/modules/lote-residuo/lote-residuo.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
} from "@nestjs/common";
import { LoteResiduoService } from "./lote-residuo.service";
import {
  CreateLoteResiduoDto,
  SearchLotesDto,
  UpdateLocationDto,
} from "./lote-residuo.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * @deprecated This controller is deprecated and will be removed in a future version.
 * Please use OfferController (/offers endpoints) instead.
 * This module is kept for backward compatibility with existing UI.
 * Migration guide: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
 */
@Controller("lotes")
export class LoteResiduoController {
  private readonly logger = new Logger(LoteResiduoController.name);

  constructor(private readonly loteResiduoService: LoteResiduoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateLoteResiduoDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.loteResiduoService.create(createDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: SearchLotesDto, @Request() req: any) {
    try {
      const userId = req.user?.sub || req.user?.id || null;
      return await this.loteResiduoService.findAll(query, userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in findAll: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  @Get("meus")
  @UseGuards(JwtAuthGuard)
  findMyLotes(
    @Request() req: any,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const userId = req.user.sub;
    return this.loteResiduoService.findByUserId(userId, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(@Param("id") id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return this.loteResiduoService.findOne(parseInt(id, 10), userId);
  }

  @Patch(":id/location")
  @UseGuards(JwtAuthGuard)
  updateLocation(
    @Param("id") id: string,
    @Body() updateDto: UpdateLocationDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.loteResiduoService.updateLocation(
      parseInt(id, 10),
      updateDto,
      userId,
    );
  }
}
