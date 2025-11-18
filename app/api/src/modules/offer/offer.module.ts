// app/api/src/modules/offer/offer.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OfferEntity } from "./offer.entity";
import { OfferController } from "./offer.controller";
import { OfferService } from "./offer.service";
import { TipoModule } from "../tipo/tipo.module";
import { UnidadeModule } from "../unidade/unidade.module";
import { FotosModule } from "../fotos/fotos.module";
import { GoogleMapsModule } from "../google-maps/google-maps.module";
import { ModerationModule } from "../moderation/moderation.module";
import { MailingModule } from "../mailing/mailing.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([OfferEntity]),
    TipoModule,
    UnidadeModule,
    FotosModule,
    GoogleMapsModule,
    ModerationModule,
    MailingModule,
    UserModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
