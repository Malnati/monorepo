// app/api/src/modules/fornecedor/fornecedor.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FornecedorEntity } from "./fornecedor.entity";
import { FornecedorController } from "./fornecedor.controller";
import { FornecedorService } from "./fornecedor.service";

@Module({
  imports: [TypeOrmModule.forFeature([FornecedorEntity])],
  controllers: [FornecedorController],
  providers: [FornecedorService],
  exports: [FornecedorService],
})
export class FornecedorModule {}
