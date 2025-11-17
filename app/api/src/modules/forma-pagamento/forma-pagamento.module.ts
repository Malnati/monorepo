// app/api/src/modules/forma-pagamento/forma-pagamento.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormaPagamentoEntity } from './forma-pagamento.entity';
import { FormaPagamentoService } from './forma-pagamento.service';
import { FormaPagamentoController } from './forma-pagamento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FormaPagamentoEntity])],
  controllers: [FormaPagamentoController],
  providers: [FormaPagamentoService],
  exports: [FormaPagamentoService],
})
export class FormaPagamentoModule {}
