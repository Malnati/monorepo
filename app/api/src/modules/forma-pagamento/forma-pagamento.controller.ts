// app/api/src/modules/forma-pagamento/forma-pagamento.controller.ts
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { FormaPagamentoService } from './forma-pagamento.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('formas-pagamento')
export class FormaPagamentoController {
  private readonly logger = new Logger(FormaPagamentoController.name);

  constructor(private readonly formaPagamentoService: FormaPagamentoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    this.logger.log('GET /app/api/formas-pagamento');
    return this.formaPagamentoService.findAll();
  }
}
