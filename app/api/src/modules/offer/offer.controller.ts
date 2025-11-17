// app/api/src/modules/offer/offer.controller.ts
import { Controller, Get, Post, Body, Param, Query, Patch, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto, SearchOffersDto, UpdateLocationDto } from './offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateOfferDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.offerService.create(createDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: SearchOffersDto, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.offerService.findAll(query, userId);
  }

  @Get('meus')
  @UseGuards(JwtAuthGuard)
  findMyOffers(@Request() req: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const userId = req.user.sub;
    return this.offerService.findByUserId(userId, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return this.offerService.findOne(parseInt(id, 10), userId);
  }

  @Patch(':id/location')
  @UseGuards(JwtAuthGuard)
  updateLocation(@Param('id') id: string, @Body() updateDto: UpdateLocationDto, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || null;
    return this.offerService.updateLocation(parseInt(id, 10), updateDto, userId);
  }
}
