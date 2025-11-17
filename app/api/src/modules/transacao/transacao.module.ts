// app/api/src/modules/transacao/transacao.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransacaoEntity } from './transacao.entity';
import { TransacaoController } from './transacao.controller';
import { TransacaoService } from './transacao.service';
import { FornecedorModule } from '../fornecedor/fornecedor.module';
import { CompradorModule } from '../comprador/comprador.module';
import { OfferModule } from '../offer/offer.module';
import { GmailModule } from '../gmail/gmail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransacaoEntity]),
    FornecedorModule,
    CompradorModule,
    OfferModule,
    GmailModule,
  ],
  controllers: [TransacaoController],
  providers: [TransacaoService],
  exports: [TransacaoService],
})
export class TransacaoModule {}
