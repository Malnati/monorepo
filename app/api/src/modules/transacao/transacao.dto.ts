// app/api/src/modules/transacao/transacao.dto.ts
import { IsNumber, Min } from "class-validator";

export class CreateTransacaoDto {
  @IsNumber()
  fornecedor_id!: number;

  @IsNumber()
  comprador_id!: number;

  @IsNumber()
  offer_id!: number;

  // Legacy alias for compatibility
  get lote_residuo_id(): number {
    return this.offer_id;
  }
  set lote_residuo_id(value: number) {
    this.offer_id = value;
  }

  @IsNumber()
  @Min(0)
  quantidade!: number;
}
