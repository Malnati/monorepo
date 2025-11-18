// app/api/src/modules/lote-residuo/lote-residuo.entity.ts
/**
 * @deprecated This entity is deprecated and will be removed in a future version.
 * Please use OfferEntity instead.
 * This entity is kept for backward compatibility with existing UI.
 * Migration guide: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { TipoEntity } from "../tipo/tipo.entity";
import { UnidadeEntity } from "../unidade/unidade.entity";
import { FornecedorEntity } from "../fornecedor/fornecedor.entity";
import { FotosEntity } from "../fotos/fotos.entity";

@Entity("tb_offer")
export class LoteResiduoEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "title", type: "varchar", length: 255 })
  titulo!: string;

  @Column({ name: "description", type: "text" })
  descricao!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  preco?: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  quantidade!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  quantidade_vendida!: number;

  @Column({ name: "location", type: "varchar", length: 255, nullable: true })
  localizacao?: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  neighborhood?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  location_geog?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  formatted_address?: string;

  @Column({ type: "varchar", length: 64, nullable: true })
  place_id?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  geocoding_accuracy?: string;

  // Campos de localização da cidade
  @Column({ type: "varchar", length: 120, nullable: true })
  city_name?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  city_location_raw?: string;

  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  city_location_geog?: string;

  // Campos de localização do bairro
  @Column({ type: "varchar", length: 120, nullable: true })
  neighborhood_name?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  neighborhood_location_raw?: string;

  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  neighborhood_location_geog?: string;

  // Campos de localização aproximada (para preservar privacidade)
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  approx_location_geog?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  approx_location_raw?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  approx_formatted_address?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  approx_geocoding_accuracy?: string;

  @Column({ type: "varchar", length: 64, nullable: true })
  approx_place_id?: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  approx_city_name?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  approx_city_location_raw?: string;

  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  approx_city_location_geog?: string;

  @Column({ type: "varchar", length: 120, nullable: true })
  approx_neighborhood_name?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  approx_neighborhood_location_raw?: string;

  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  approx_neighborhood_location_geog?: string;

  @Column({ name: "tipo_id", nullable: true })
  tipo_id?: number;

  @ManyToOne(() => TipoEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "tipo_id" })
  tipo?: TipoEntity;

  @Column({ name: "unidade_id", nullable: true })
  unidade_id?: number;

  @ManyToOne(() => UnidadeEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "unidade_id" })
  unidade?: UnidadeEntity;

  @Column({ name: "fornecedor_id", nullable: true })
  fornecedor_id?: number;

  @ManyToOne(() => FornecedorEntity)
  @JoinColumn({ name: "fornecedor_id" })
  fornecedor?: FornecedorEntity;

  @OneToMany(() => FotosEntity, (foto) => foto.offer)
  fotos?: FotosEntity[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
