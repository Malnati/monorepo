// app/api/src/modules/user/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { FornecedorEntity } from "../fornecedor/fornecedor.entity";
import { CompradorEntity } from "../comprador/comprador.entity";

@Entity("tb_user")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  google_id!: string | null;

  @Column({ type: "varchar", length: 20, default: "pendente" })
  status_ativacao!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  token_ativacao!: string | null;

  @Column({ type: "timestamp", nullable: true })
  token_expires_at!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  data_ativacao!: Date | null;

  @Column({ type: "timestamp", nullable: true })
  email_validado_em!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToMany(() => FornecedorEntity)
  @JoinTable({
    name: "tb_user_fornecedor",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "fornecedor_id", referencedColumnName: "id" },
  })
  fornecedores!: FornecedorEntity[];

  @ManyToMany(() => CompradorEntity)
  @JoinTable({
    name: "tb_user_comprador",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "comprador_id", referencedColumnName: "id" },
  })
  compradores!: CompradorEntity[];
}
