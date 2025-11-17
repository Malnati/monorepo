// app/api/src/modules/lote-residuo/lote-residuo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteResiduoEntity } from './lote-residuo.entity';
import { LoteResiduoController } from './lote-residuo.controller';
import { LoteResiduoService } from './lote-residuo.service';
import { TipoModule } from '../tipo/tipo.module';
import { UnidadeModule } from '../unidade/unidade.module';
import { FornecedorModule } from '../fornecedor/fornecedor.module';
import { FotosModule } from '../fotos/fotos.module';
import { GoogleMapsModule } from '../google-maps/google-maps.module';
import { ModerationModule } from '../moderation/moderation.module';
import { MailingModule } from '../mailing/mailing.module';
import { UserModule } from '../user/user.module';

/**
 * @deprecated This module is deprecated and will be removed in a future version.
 * Please use OfferModule instead.
 * This module is kept for backward compatibility with existing UI.
 * Migration guide: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LoteResiduoEntity]),
    TipoModule,
    UnidadeModule,
    FornecedorModule,
    FotosModule,
    GoogleMapsModule,
    ModerationModule,
    MailingModule,
    UserModule,
  ],
  controllers: [LoteResiduoController],
  providers: [LoteResiduoService],
  exports: [LoteResiduoService],
})
export class LoteResiduoModule {}
