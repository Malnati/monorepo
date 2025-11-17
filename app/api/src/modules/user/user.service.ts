// app/api/src/modules/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['fornecedores', 'compradores'],
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['fornecedores', 'compradores'],
    });
  }

  async updateGoogleId(id: number, googleId: string): Promise<void> {
    await this.userRepository.update(id, { google_id: googleId });
  }

  async getFornecedores(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['fornecedores'],
    });
    return user?.fornecedores || [];
  }

  async getCompradores(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['compradores'],
    });
    return user?.compradores || [];
  }

  async addFornecedor(userId: number, fornecedorId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['fornecedores'],
    });
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado`);
    }
    const fornecedorRepo = this.userRepository.manager.getRepository('tb_fornecedor');
    const fornecedor = await fornecedorRepo.findOne({ where: { id: fornecedorId } });
    if (!fornecedor) {
      throw new Error(`Fornecedor com ID ${fornecedorId} não encontrado`);
    }
    if (!user.fornecedores.some(f => f.id === fornecedorId)) {
      user.fornecedores.push(fornecedor as any);
      await this.userRepository.save(user);
    }
  }

  async addComprador(userId: number, compradorId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['compradores'],
    });
    if (!user) {
      throw new Error(`Usuário com ID ${userId} não encontrado`);
    }
    const compradorRepo = this.userRepository.manager.getRepository('tb_comprador');
    const comprador = await compradorRepo.findOne({ where: { id: compradorId } });
    if (!comprador) {
      throw new Error(`Comprador com ID ${compradorId} não encontrado`);
    }
    if (!user.compradores.some(c => c.id === compradorId)) {
      user.compradores.push(comprador as any);
      await this.userRepository.save(user);
    }
  }
}
