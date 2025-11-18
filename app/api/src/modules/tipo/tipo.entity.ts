// app/api/src/modules/tipo/tipo.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("tb_tipo")
export class TipoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, unique: true })
  nome!: string;
}
