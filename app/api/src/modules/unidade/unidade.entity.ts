// app/api/src/modules/unidade/unidade.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("tb_unidade")
export class UnidadeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, unique: true })
  nome!: string;
}
