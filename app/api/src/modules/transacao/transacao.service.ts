// app/api/src/modules/transacao/transacao.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TransacaoEntity } from './transacao.entity';
import { CreateTransacaoDto } from './transacao.dto';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { CompradorService } from '../comprador/comprador.service';
import { OfferService } from '../offer/offer.service';
import { GmailService } from '../gmail/gmail.service';
import { ERROR_CODES } from '../../constants';

@Injectable()
export class TransacaoService {
  constructor(
    @InjectRepository(TransacaoEntity)
    private readonly transacaoRepository: Repository<TransacaoEntity>,
    private readonly fornecedorService: FornecedorService,
    private readonly compradorService: CompradorService,
    private readonly offerService: OfferService,
    private readonly gmailService: GmailService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateTransacaoDto, userId: number | null) {
    const logger = new Logger(TransacaoService.name);
    logger.log(`create - User: ${userId || 'anonymous'} - Creating transacao for offer: ${createDto.offer_id}`);
    
    // Validar fornecedor, comprador e offer
    await this.fornecedorService.findOne(createDto.fornecedor_id, userId);
    await this.compradorService.findOne(createDto.comprador_id, userId);
    const offer = await this.offerService.findOne(createDto.offer_id, userId ?? undefined);

    // VALIDAÇÃO 1: Bloquear compra de offer já vendido (has_transacao)
    if (offer.has_transacao) {
      logger.warn(`create - User: ${userId || 'anonymous'} - Attempt to purchase already sold offer: ${createDto.offer_id}`);
      throw new BadRequestException({
        code: ERROR_CODES.OFFER_ALREADY_SOLD,
        message: 'Esta oferta já foi vendida e não está mais disponível para compra',
        details: {
          offer_id: createDto.offer_id,
          offer_title: offer.title,
        },
      });
    }

    // VALIDAÇÃO 2: Bloquear auto-compra (usuário não pode comprar sua própria oferta)
    if (userId && offer.fornecedor?.id) {
      // Verificar se o usuário logado é fornecedor da oferta
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      try {
        const isUserFornecedor = await queryRunner.manager
          .createQueryBuilder()
          .select('uf.id')
          .from('tb_user_fornecedor', 'uf')
          .where('uf.user_id = :userId', { userId })
          .andWhere('uf.fornecedor_id = :fornecedorId', { fornecedorId: offer.fornecedor.id })
          .getCount();
        
        if (isUserFornecedor > 0) {
          logger.warn(`create - User: ${userId} - Attempt to purchase own offer: ${createDto.offer_id}`);
          throw new BadRequestException({
            code: ERROR_CODES.OWN_OFFER_PURCHASE,
            message: 'Você não pode comprar sua própria oferta',
            details: {
              offer_id: createDto.offer_id,
              offer_title: offer.title,
            },
          });
        }
      } finally {
        await queryRunner.release();
      }
    }

    // VALIDAÇÃO 3: Validar quantidade disponível
    const quantidadeDisponivel = Number(offer.quantidade) - Number(offer.quantidade_vendida);
    if (createDto.quantidade > quantidadeDisponivel) {
      throw new BadRequestException({
        code: ERROR_CODES.INSUFFICIENT_QUANTITY,
        message: 'Quantidade solicitada excede a disponível',
        details: {
          quantidade_solicitada: createDto.quantidade,
          quantidade_disponivel: quantidadeDisponivel,
          offer_id: createDto.offer_id,
        },
      });
    }

    // Criar transação e atualizar quantidade_vendida em uma transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // VALIDAÇÃO 4: Verificar novamente se já existe transação (race condition prevention)
      const existingTransacao = await queryRunner.manager
        .createQueryBuilder()
        .select('t.id')
        .from('tb_transacao', 't')
        .where('t.offer_id = :offerId', { offerId: createDto.offer_id })
        .getCount();
      
      if (existingTransacao > 0) {
        logger.warn(`create - User: ${userId || 'anonymous'} - Race condition detected for offer: ${createDto.offer_id}`);
        throw new BadRequestException({
          code: ERROR_CODES.LOT_ALREADY_SOLD,
          message: 'Esta oferta já foi vendida enquanto você estava processando a compra',
          details: {
            offer_id: createDto.offer_id,
          },
        });
      }

      // Atualizar quantidade_vendida com verificação de estoque (usando WHERE para evitar overselling)
      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update('tb_offer')
        .set({
          quantidade_vendida: () => `quantidade_vendida + ${createDto.quantidade}`,
        })
        .where('id = :id', { id: createDto.offer_id })
        .andWhere('quantidade - quantidade_vendida >= :quantidade', { quantidade: createDto.quantidade })
        .execute();

      // Verificar se a atualização foi bem-sucedida
      if (updateResult.affected === 0) {
        logger.warn(`create - User: ${userId || 'anonymous'} - Insufficient quantity for offer: ${createDto.offer_id}`);
        throw new BadRequestException({
          code: ERROR_CODES.INSUFFICIENT_QUANTITY,
          message: 'Quantidade disponível insuficiente',
          details: {
            offer_id: createDto.offer_id,
            quantidade_solicitada: createDto.quantidade,
          },
        });
      }

      const transacao = queryRunner.manager.create(TransacaoEntity, {
        fornecedor_id: createDto.fornecedor_id,
        comprador_id: createDto.comprador_id,
        offer_id: createDto.offer_id,
        quantidade: createDto.quantidade,
      });

      const savedTransacao = await queryRunner.manager.save(transacao);

      await queryRunner.commitTransaction();

      logger.log(`create - User: ${userId || 'anonymous'} - Transacao created successfully with ID: ${savedTransacao.id}`);

      // Buscar transação completa com relacionamentos
      const transacaoCompleta = await this.findOne(savedTransacao.id, userId);

      // Enviar e-mails de confirmação em background (REQ-GMAIL-002)
      // Não bloquear resposta HTTP em caso de falha no envio (REQ-GMAIL-005)
      this.sendTransactionEmails(transacaoCompleta, logger).catch(error => {
        logger.error(`Failed to send transaction emails for ID ${savedTransacao.id}`, error);
      });

      return transacaoCompleta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByUserId(userId: number | null) {
    const logger = new Logger(TransacaoService.name);
    logger.log(`findAllByUserId - User: ${userId || 'anonymous'}`);

    if (!userId) {
      return [];
    }

    // Buscar transações onde o usuário é fornecedor OU comprador
    const transacoes = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .leftJoinAndSelect('transacao.fornecedor', 'fornecedor')
      .leftJoinAndSelect('transacao.comprador', 'comprador')
      .leftJoinAndSelect('transacao.offer', 'offer')
      .leftJoinAndSelect('offer.unidade', 'unidade')
      .leftJoin('tb_user_fornecedor', 'uf', 'uf.fornecedor_id = transacao.fornecedor_id')
      .leftJoin('tb_user_comprador', 'uc', 'uc.comprador_id = transacao.comprador_id')
      .select([
        'transacao.id',
        'transacao.quantidade',
        'transacao.created_at',
        'transacao.updated_at',
        'fornecedor.id',
        'fornecedor.nome',
        'fornecedor.email',
        'fornecedor.whatsapp',
        'comprador.id',
        'comprador.nome',
        'comprador.email',
        'comprador.whatsapp',
        'offer.id',
        'offer.title',
        'offer.description',
        'offer.preco',
        'offer.location',
        'offer.formatted_address',
        'offer.city_name',
        'offer.city_location_raw',
        'offer.neighborhood_name',
        'offer.neighborhood_location_raw',
        'offer.place_id',
        'offer.geocoding_accuracy',
        'unidade.id',
        'unidade.nome',
      ])
      .where('uf.user_id = :userId OR uc.user_id = :userId', { userId })
      .orderBy('transacao.created_at', 'DESC')
      .getMany();

    // Transformar cada transação no mesmo formato do findOne
    return transacoes.map((transacao) => {
      const precoTotal = Number(transacao.offer.preco) * Number(transacao.quantidade);

      // Construir camadas de localização (mesma lógica do findOne)
      const locationLayers: any = {};

      // Camada real (sempre presente se houver localização)
      if (transacao.offer.location) {
        const [lat, lng] = transacao.offer.location.split(',').map(parseFloat);
        locationLayers.real = {
          latitude: lat,
          longitude: lng,
          label: transacao.offer.formatted_address || transacao.offer.location,
        };
      }

      // Camada de bairro
      if (transacao.offer.neighborhood_name && transacao.offer.neighborhood_location_raw) {
        const [neighLat, neighLng] = transacao.offer.neighborhood_location_raw.split(',').map(parseFloat);
        locationLayers.neighborhood = {
          latitude: neighLat,
          longitude: neighLng,
          label: transacao.offer.neighborhood_name,
        };
      }

      // Camada de cidade
      if (transacao.offer.city_name && transacao.offer.city_location_raw) {
        const [cityLat, cityLng] = transacao.offer.city_location_raw.split(',').map(parseFloat);
        locationLayers.city = {
          latitude: cityLat,
          longitude: cityLng,
          label: transacao.offer.city_name,
        };
      }

      const finalLocationLayers = Object.keys(locationLayers).length > 0 ? locationLayers : null;

      return {
        id: transacao.id,
        fornecedor: transacao.fornecedor
          ? {
              id: transacao.fornecedor.id,
              nome: transacao.fornecedor.nome,
              email: transacao.fornecedor.email || null,
              whatsapp: transacao.fornecedor.whatsapp || null,
              avatar_url: `/app/api/fornecedores/${transacao.fornecedor.id}/avatar`,
            }
          : null,
        comprador: transacao.comprador
          ? {
              id: transacao.comprador.id,
              nome: transacao.comprador.nome,
              email: transacao.comprador.email || null,
              whatsapp: transacao.comprador.whatsapp || null,
              avatar_url: `/app/api/compradores/${transacao.comprador.id}/avatar`,
            }
          : null,
        offer: {
          id: transacao.offer.id,
          nome: transacao.offer.title,
          title: transacao.offer.title,
          description: transacao.offer.description || null,
          preco: transacao.offer.preco,
          formatted_address: transacao.offer.formatted_address || null,
          unidade: transacao.offer.unidade
            ? {
                id: transacao.offer.unidade.id,
                nome: transacao.offer.unidade.nome,
              }
            : null,
          locationLayers: finalLocationLayers,
        },
        // Legacy alias for backward compatibility
        lote_residuo: {
          id: transacao.offer.id,
          nome: transacao.offer.title,
          titulo: transacao.offer.title,
          descricao: transacao.offer.description || null,
          preco: transacao.offer.preco,
          formatted_address: transacao.offer.formatted_address || null,
          unidade: transacao.offer.unidade
            ? {
                id: transacao.offer.unidade.id,
                nome: transacao.offer.unidade.nome,
              }
            : null,
          locationLayers: finalLocationLayers,
        },
        quantidade: transacao.quantidade,
        preco_total: precoTotal,
        created_at: transacao.created_at,
        updated_at: transacao.updated_at,
      };
    });
  }

  async findOne(id: number, userId: number | null) {
    const logger = new Logger(TransacaoService.name);
    logger.log(`findOne - User: ${userId || 'anonymous'} - Transacao ID: ${id}`);
    const transacao = await this.transacaoRepository
      .createQueryBuilder('transacao')
      .leftJoinAndSelect('transacao.fornecedor', 'fornecedor')
      .leftJoinAndSelect('transacao.comprador', 'comprador')
      .leftJoinAndSelect('transacao.offer', 'offer')
      .leftJoinAndSelect('offer.unidade', 'unidade')
      .select([
        'transacao.id',
        'transacao.quantidade',
        'transacao.created_at',
        'transacao.updated_at',
        'fornecedor.id',
        'fornecedor.nome',
        'fornecedor.email',
        'fornecedor.whatsapp',
        'comprador.id',
        'comprador.nome',
        'comprador.email',
        'comprador.whatsapp',
        'offer.id',
        'offer.title',
        'offer.description',
        'offer.preco',
        'offer.location',
        'offer.formatted_address',
        'offer.city_name',
        'offer.city_location_raw',
        'offer.neighborhood_name',
        'offer.neighborhood_location_raw',
        'offer.place_id',
        'offer.geocoding_accuracy',
        'unidade.id',
        'unidade.nome',
      ])
      .where('transacao.id = :id', { id })
      .getOne();

    if (!transacao) {
      throw new NotFoundException(`Transação com ID ${id} não encontrada`);
    }

    const precoTotal = Number(transacao.offer.preco) * Number(transacao.quantidade);

    // Construir camadas de localização (mesma lógica do OfferService.buildLocationLayers)
    const locationLayers: any = {};

    // Camada real (sempre presente se houver localização)
    if (transacao.offer.location) {
      const [lat, lng] = transacao.offer.location.split(',').map(parseFloat);
      locationLayers.real = {
        latitude: lat,
        longitude: lng,
        label: transacao.offer.formatted_address || transacao.offer.location,
      };
    }

    // Camada de bairro
    if (transacao.offer.neighborhood_name && transacao.offer.neighborhood_location_raw) {
      const [neighLat, neighLng] = transacao.offer.neighborhood_location_raw.split(',').map(parseFloat);
      locationLayers.neighborhood = {
        latitude: neighLat,
        longitude: neighLng,
        label: transacao.offer.neighborhood_name,
      };
    }

    // Camada de cidade
    if (transacao.offer.city_name && transacao.offer.city_location_raw) {
      const [cityLat, cityLng] = transacao.offer.city_location_raw.split(',').map(parseFloat);
      locationLayers.city = {
        latitude: cityLat,
        longitude: cityLng,
        label: transacao.offer.city_name,
      };
    }

    const finalLocationLayers = Object.keys(locationLayers).length > 0 ? locationLayers : null;

    const result = {
      id: transacao.id,
      fornecedor: transacao.fornecedor
        ? {
            id: transacao.fornecedor.id,
            nome: transacao.fornecedor.nome,
            email: transacao.fornecedor.email || null,
            whatsapp: transacao.fornecedor.whatsapp || null,
            avatar_url: `/app/api/fornecedores/${transacao.fornecedor.id}/avatar`,
          }
        : null,
      comprador: transacao.comprador
        ? {
            id: transacao.comprador.id,
            nome: transacao.comprador.nome,
            email: transacao.comprador.email || null,
            whatsapp: transacao.comprador.whatsapp || null,
            avatar_url: `/app/api/compradores/${transacao.comprador.id}/avatar`,
          }
        : null,
      offer: {
        id: transacao.offer.id,
        nome: transacao.offer.title,
        title: transacao.offer.title,
        description: transacao.offer.description || null,
        preco: transacao.offer.preco,
        formatted_address: transacao.offer.formatted_address || null,
        unidade: transacao.offer.unidade
          ? {
              id: transacao.offer.unidade.id,
              nome: transacao.offer.unidade.nome,
            }
          : null,
        // Adicionar camadas de localização (real, neighborhood, city)
        locationLayers: finalLocationLayers,
      },
      // Legacy alias for backward compatibility
      lote_residuo: {
        id: transacao.offer.id,
        nome: transacao.offer.title,
        titulo: transacao.offer.title,
        descricao: transacao.offer.description || null,
        preco: transacao.offer.preco,
        formatted_address: transacao.offer.formatted_address || null,
        unidade: transacao.offer.unidade
          ? {
              id: transacao.offer.unidade.id,
              nome: transacao.offer.unidade.nome,
            }
          : null,
        // Adicionar camadas de localização (real, neighborhood, city)
        locationLayers: finalLocationLayers,
      },
      quantidade: transacao.quantidade,
      preco_total: precoTotal,
      created_at: transacao.created_at,
      updated_at: transacao.updated_at,
    };
    logger.log(`findOne - User: ${userId || 'anonymous'} - Transacao ID: ${id} found`);
    return result;
  }

  /**
   * Enviar e-mails de confirmação de transação para fornecedor e comprador
   * REQ-GMAIL-002: Envio transacional imediato
   * REQ-GMAIL-005: Não impedir confirmação da transação em caso de falha
   */
  private async sendTransactionEmails(transacao: any, logger: Logger): Promise<void> {
    try {
      // Buscar emails do fornecedor e comprador
      // Se não tiverem email cadastrado, buscar do usuário associado
      let fornecedorEmail = transacao.fornecedor?.email?.trim();
      let compradorEmail = transacao.comprador?.email?.trim();

      // Se fornecedor não tem email, buscar do usuário associado
      if (!fornecedorEmail && transacao.fornecedor?.id) {
        logger.log({
          event: 'fornecedor_email_lookup',
          transacao_id: transacao.id,
          fornecedor_id: transacao.fornecedor.id,
          fornecedor_email_from_db: transacao.fornecedor?.email || null,
        });
        
        const users = await this.dataSource
          .createQueryBuilder()
          .select('u.email', 'email')
          .from('tb_user', 'u')
          .innerJoin('tb_user_fornecedor', 'uf', 'uf.user_id = u.id')
          .where('uf.fornecedor_id = :fornecedorId', { fornecedorId: transacao.fornecedor.id })
          .limit(1)
          .getRawOne();
        
        logger.log({
          event: 'fornecedor_email_query_result',
          transacao_id: transacao.id,
          fornecedor_id: transacao.fornecedor.id,
          query_result: users,
        });
        
        if (users?.email) {
          fornecedorEmail = users.email.trim();
          logger.log({
            event: 'fornecedor_email_from_user',
            transacao_id: transacao.id,
            fornecedor_id: transacao.fornecedor.id,
            email: fornecedorEmail,
          });
        } else {
          logger.warn({
            event: 'fornecedor_email_not_found_in_user',
            transacao_id: transacao.id,
            fornecedor_id: transacao.fornecedor.id,
          });
        }
      }

      // Se comprador não tem email, buscar do usuário associado
      if (!compradorEmail && transacao.comprador?.id) {
        logger.log({
          event: 'comprador_email_lookup',
          transacao_id: transacao.id,
          comprador_id: transacao.comprador.id,
          comprador_email_from_db: transacao.comprador?.email || null,
        });
        
        const users = await this.dataSource
          .createQueryBuilder()
          .select('u.email', 'email')
          .from('tb_user', 'u')
          .innerJoin('tb_user_comprador', 'uc', 'uc.user_id = u.id')
          .where('uc.comprador_id = :compradorId', { compradorId: transacao.comprador.id })
          .limit(1)
          .getRawOne();
        
        logger.log({
          event: 'comprador_email_query_result',
          transacao_id: transacao.id,
          comprador_id: transacao.comprador.id,
          query_result: users,
        });
        
        if (users?.email) {
          compradorEmail = users.email.trim();
          logger.log({
            event: 'comprador_email_from_user',
            transacao_id: transacao.id,
            comprador_id: transacao.comprador.id,
            email: compradorEmail,
          });
        } else {
          logger.warn({
            event: 'comprador_email_not_found_in_user',
            transacao_id: transacao.id,
            comprador_id: transacao.comprador.id,
          });
        }
      }

      if (!fornecedorEmail && !compradorEmail) {
        logger.warn({
          event: 'transaction_emails_skipped',
          transacao_id: transacao.id,
          reason: 'No email addresses configured for fornecedor or comprador',
        });
        return;
      }

      // Preparar payload para o serviço de e-mail
      const emailPayload = {
        fornecedor: {
          nome: transacao.fornecedor?.nome || 'Fornecedor',
          email: fornecedorEmail || '',
          whatsapp: transacao.fornecedor?.whatsapp || '',
        },
        comprador: {
          nome: transacao.comprador?.nome || 'Comprador',
          email: compradorEmail || '',
          whatsapp: transacao.comprador?.whatsapp || '',
        },
        lote: {
          titulo: transacao.offer?.title || '',
          quantidade: Number(transacao.quantidade) || 0,
          unidade: transacao.offer?.unidade?.nome || '',
          preco_unitario: Number(transacao.offer?.preco) || 0,
          preco_total: Number(transacao.preco_total) || 0,
        },
        transacao_id: transacao.id,
      };

      // Enviar e-mails apenas para quem tem endereço configurado
      const emailPromises = [];
      
      if (fornecedorEmail) {
        emailPromises.push(
          this.gmailService.sendTransactionSuccessEmail(emailPayload, 'fornecedor')
        );
      } else {
        logger.warn({
          event: 'fornecedor_email_missing',
          transacao_id: transacao.id,
        });
      }

      if (compradorEmail) {
        emailPromises.push(
          this.gmailService.sendTransactionSuccessEmail(emailPayload, 'comprador')
        );
      } else {
        logger.warn({
          event: 'comprador_email_missing',
          transacao_id: transacao.id,
        });
      }

      if (emailPromises.length === 0) {
        return;
      }

      // Enviar e-mails em paralelo usando Promise.allSettled
      // Para não falhar se um dos envios falhar
      const results = await Promise.allSettled(emailPromises);

      // Registrar resultados
      let successCount = 0;
      results.forEach((result, index) => {
        const recipient = index === 0 && fornecedorEmail ? 'fornecedor' : 'comprador';
        if (result.status === 'fulfilled') {
          logger.log({
            event: 'transaction_email_result',
            transacao_id: transacao.id,
            recipient,
            result_value: result.value,
            success: result.value.success,
            message_id: result.value.messageId,
            error: result.value.error,
          });
          
          if (result.value.success) {
            successCount++;
            logger.log({
              event: 'transaction_email_sent',
              transacao_id: transacao.id,
              recipient,
              message_id: result.value.messageId,
            });
          } else {
            logger.warn({
              event: 'transaction_email_failed',
              transacao_id: transacao.id,
              recipient,
              error: result.value.error,
            });
          }
        } else {
          logger.error({
            event: 'transaction_email_error',
            transacao_id: transacao.id,
            recipient,
            error: result.reason,
          });
        }
      });

      logger.log({
        event: 'transaction_emails_completed',
        transacao_id: transacao.id,
        total_sent: successCount,
        total_attempted: emailPromises.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({
        event: 'send_transaction_emails_failed',
        transacao_id: transacao.id,
        error: errorMessage,
      });
    }
  }
}