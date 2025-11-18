// app/api/src/modules/comprador/comprador.service.ts
import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompradorEntity } from "./comprador.entity";

@Injectable()
export class CompradorService {
  private readonly logger = new Logger(CompradorService.name);

  constructor(
    @InjectRepository(CompradorEntity)
    private readonly compradorRepository: Repository<CompradorEntity>,
  ) {}

  async findOne(id: number, userId: number | null): Promise<CompradorEntity> {
    this.logger.log(
      `findOne - User: ${userId || "anonymous"} - Comprador ID: ${id}`,
    );
    const comprador = await this.compradorRepository.findOne({ where: { id } });
    if (!comprador) {
      this.logger.warn(
        `findOne - User: ${userId || "anonymous"} - Comprador ID: ${id} not found`,
      );
      throw new NotFoundException(`Comprador com ID ${id} não encontrado`);
    }
    this.logger.log(
      `findOne - User: ${userId || "anonymous"} - Comprador ID: ${id} found`,
    );
    return comprador;
  }

  async create(
    nome: string,
    email?: string,
    avatar?: Buffer | null,
  ): Promise<CompradorEntity> {
    const comprador = this.compradorRepository.create({
      nome,
      email,
      avatar: avatar || undefined,
    });
    return await this.compradorRepository.save(comprador);
  }

  async findOrCreate(
    nome: string,
    email?: string,
    avatar?: Buffer | null,
  ): Promise<CompradorEntity> {
    const existing = await this.compradorRepository.findOne({
      where: { nome },
    });
    if (existing) {
      // Atualizar email e avatar se não existirem mas estiverem disponíveis
      let needsUpdate = false;
      if (email && !existing.email) {
        existing.email = email;
        needsUpdate = true;
      }
      if (avatar && !existing.avatar) {
        existing.avatar = avatar;
        needsUpdate = true;
      }
      if (needsUpdate) {
        return await this.compradorRepository.save(existing);
      }
      return existing;
    }
    return await this.create(nome, email, avatar);
  }
}
