// app/api/src/modules/tipo/tipo.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoEntity } from './tipo.entity';

@Injectable()
export class TipoService {
  private readonly logger = new Logger(TipoService.name);

  constructor(
    @InjectRepository(TipoEntity)
    private readonly tipoRepository: Repository<TipoEntity>,
  ) {}

  async findAll(userId: number | null) {
    this.logger.log(`findAll - User: ${userId || 'anonymous'}`);
    const tipos = await this.tipoRepository.find({
      order: { id: 'ASC' },
    });
    this.logger.log(`findAll - User: ${userId || 'anonymous'} - Found ${tipos.length} tipos`);
    return { data: tipos };
  }
}
