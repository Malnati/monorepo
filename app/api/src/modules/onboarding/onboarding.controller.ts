// app/api/src/modules/onboarding/onboarding.controller.ts
import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { RegisterDto } from './dto/register.dto';
import { ActivateDto } from './dto/activate.dto';
import { ResendDto } from './dto/resend.dto';
import { Request } from 'express';

@Controller('onboarding')
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * POST /onboarding/register
   * Registra novo usuário e envia e-mail de ativação
   */
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    this.logger.log(`Registro iniciado para: ${dto.email}`);

    return this.onboardingService.register(dto, ipAddress, userAgent);
  }

  /**
   * POST /onboarding/activate
   * Ativa conta de usuário com token
   */
  @Post('activate')
  async activate(@Body() dto: ActivateDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    this.logger.log(`Ativação iniciada para: ${dto.email}`);

    return this.onboardingService.activate(dto, ipAddress, userAgent);
  }

  /**
   * POST /onboarding/resend
   * Reenvia e-mail de ativação
   */
  @Post('resend')
  async resend(@Body() dto: ResendDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    this.logger.log(`Reenvio solicitado para: ${dto.email}`);

    return this.onboardingService.resend(dto, ipAddress, userAgent);
  }
}
