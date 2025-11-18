// app/api/src/modules/tipo/tipo.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TipoEntity } from "./tipo.entity";
import { TipoController } from "./tipo.controller";
import { TipoService } from "./tipo.service";

@Module({
  imports: [TypeOrmModule.forFeature([TipoEntity])],
  controllers: [TipoController],
  providers: [TipoService],
  exports: [TipoService],
})
export class TipoModule {}
