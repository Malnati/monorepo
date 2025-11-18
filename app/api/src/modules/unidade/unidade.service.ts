// app/api/src/modules/unidade/unidade.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnidadeEntity } from "./unidade.entity";

@Injectable()
export class UnidadeService {
  private readonly logger = new Logger(UnidadeService.name);

  constructor(
    @InjectRepository(UnidadeEntity)
    private readonly unidadeRepository: Repository<UnidadeEntity>,
  ) {}

  async findAll(userId: number | null) {
    this.logger.log(`findAll - User: ${userId || "anonymous"}`);
    const unidades = await this.unidadeRepository.find({
      order: { id: "ASC" },
    });
    this.logger.log(
      `findAll - User: ${userId || "anonymous"} - Found ${unidades.length} unidades`,
    );
    return { data: unidades };
  }
}
