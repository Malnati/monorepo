// app/api/src/modules/fotos/fotos.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tb_fotos')
export class FotosEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Database column is now 'offer_id' after migration 026
  @Column({ name: 'offer_id' })
  offer_id!: number;

  // Legacy support - same as offer_id
  get lote_residuo_id(): number {
    return this.offer_id;
  }
  set lote_residuo_id(value: number) {
    this.offer_id = value;
  }

  @ManyToOne(() => require('../offer/offer.entity').OfferEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offer_id' })
  offer: any;

  // Legacy alias
  get lote_residuo(): any {
    return this.offer;
  }
  set lote_residuo(value: any) {
    this.offer = value;
  }

  @Column({ type: 'bytea' })
  imagem!: Buffer;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
