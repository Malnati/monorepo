// app/api/src/modules/transacao/transacao.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { FornecedorEntity } from "../fornecedor/fornecedor.entity";
import { CompradorEntity } from "../comprador/comprador.entity";
import { OfferEntity } from "../offer/offer.entity";

@Entity("tb_transacao")
export class TransacaoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "fornecedor_id" })
  fornecedor_id!: number;

  @ManyToOne(() => FornecedorEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "fornecedor_id" })
  fornecedor!: FornecedorEntity;

  @Column({ name: "comprador_id" })
  comprador_id!: number;

  @ManyToOne(() => CompradorEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "comprador_id" })
  comprador!: CompradorEntity;

  // Database column is now 'offer_id' after migration 026
  @Column({ name: "offer_id" })
  offer_id!: number;

  // Legacy support - same as offer_id
  get lote_residuo_id(): number {
    return this.offer_id;
  }
  set lote_residuo_id(value: number) {
    this.offer_id = value;
  }

  @ManyToOne(() => OfferEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_id" })
  offer!: OfferEntity;

  // Legacy alias
  get lote_residuo(): OfferEntity {
    return this.offer;
  }
  set lote_residuo(value: OfferEntity) {
    this.offer = value;
  }

  @Column({ type: "decimal", precision: 12, scale: 2 })
  quantidade!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
