// app/api/src/modules/fotos/fotos.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FotosEntity } from './fotos.entity';

@Injectable()
export class FotosService {
  private readonly logger = new Logger(FotosService.name);

  constructor(
    @InjectRepository(FotosEntity)
    private readonly fotosRepository: Repository<FotosEntity>,
  ) {}

  async findOne(id: number, userId: number | null): Promise<FotosEntity | null> {
    this.logger.log(`findOne - User: ${userId || 'anonymous'} - Foto ID: ${id}`);
    const foto = await this.fotosRepository.findOne({ where: { id } });
    if (foto) {
      this.logger.log(`findOne - User: ${userId || 'anonymous'} - Foto ID: ${id} found`);
    } else {
      this.logger.warn(`findOne - User: ${userId || 'anonymous'} - Foto ID: ${id} not found`);
    }
    return foto;
  }

  async create(loteResiduoId: number, imagem: Buffer): Promise<FotosEntity> {
    const foto = this.fotosRepository.create({
      offer_id: loteResiduoId, // Using new column name
      imagem,
    });
    return this.fotosRepository.save(foto);
  }

  async createForOffer(offerId: number, imagem: Buffer): Promise<FotosEntity> {
    return this.create(offerId, imagem);
  }

  async findByLoteResiduoId(loteResiduoId: number): Promise<FotosEntity[]> {
    return this.fotosRepository.find({
      where: { offer_id: loteResiduoId }, // Using new column name
      order: { id: 'ASC' },
    });
  }

  async findByOfferId(offerId: number): Promise<FotosEntity[]> {
    return this.findByLoteResiduoId(offerId);
  }
}
