// app/api/src/modules/fornecedor/fornecedor.service.ts
import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FornecedorEntity } from "./fornecedor.entity";

@Injectable()
export class FornecedorService {
  private readonly logger = new Logger(FornecedorService.name);

  constructor(
    @InjectRepository(FornecedorEntity)
    private readonly fornecedorRepository: Repository<FornecedorEntity>,
  ) {}

  async findOne(id: number, userId: number | null): Promise<FornecedorEntity> {
    this.logger.log(
      `findOne - User: ${userId || "anonymous"} - Fornecedor ID: ${id}`,
    );
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { id },
    });
    if (!fornecedor) {
      this.logger.warn(
        `findOne - User: ${userId || "anonymous"} - Fornecedor ID: ${id} not found`,
      );
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
    }
    this.logger.log(
      `findOne - User: ${userId || "anonymous"} - Fornecedor ID: ${id} found`,
    );
    return fornecedor;
  }

  async create(
    nome: string,
    email?: string,
    avatar?: Buffer | null,
  ): Promise<FornecedorEntity> {
    const fornecedor = this.fornecedorRepository.create({
      nome,
      email,
      avatar: avatar || undefined,
    });
    return await this.fornecedorRepository.save(fornecedor);
  }

  async findOrCreate(
    nome: string,
    email?: string,
    avatar?: Buffer | null,
  ): Promise<FornecedorEntity> {
    const existing = await this.fornecedorRepository.findOne({
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
        return await this.fornecedorRepository.save(existing);
      }
      return existing;
    }
    return await this.create(nome, email, avatar);
  }
}
