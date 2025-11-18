// app/api/src/modules/forma-pagamento/forma-pagamento.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { FormaPagamentoEntity } from "./forma-pagamento.entity";

@Injectable()
export class FormaPagamentoService {
  private readonly logger = new Logger(FormaPagamentoService.name);

  constructor(
    @InjectRepository(FormaPagamentoEntity)
    private readonly formaPagamentoRepository: Repository<FormaPagamentoEntity>,
  ) {}

  async findAll(): Promise<{ data: FormaPagamentoEntity[] }> {
    this.logger.log("findAll - Buscando formas de pagamento ativas");
    const formasPagamento = await this.formaPagamentoRepository.find({
      where: { ativo: true },
      order: { nome: "ASC" },
    });
    this.logger.log(
      `findAll - Found ${formasPagamento.length} formas de pagamento`,
    );
    return { data: formasPagamento };
  }

  async findByIds(ids: number[]): Promise<FormaPagamentoEntity[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.formaPagamentoRepository.find({
      where: { id: In(ids) },
      order: { nome: "ASC" },
    });
  }
}
