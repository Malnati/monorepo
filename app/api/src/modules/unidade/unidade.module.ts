// app/api/src/modules/unidade/unidade.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UnidadeEntity } from "./unidade.entity";
import { UnidadeController } from "./unidade.controller";
import { UnidadeService } from "./unidade.service";

@Module({
  imports: [TypeOrmModule.forFeature([UnidadeEntity])],
  controllers: [UnidadeController],
  providers: [UnidadeService],
  exports: [UnidadeService],
})
export class UnidadeModule {}
