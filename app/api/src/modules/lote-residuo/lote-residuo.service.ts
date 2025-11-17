// app/api/src/modules/lote-residuo/lote-residuo.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoteResiduoEntity } from './lote-residuo.entity';
import { CreateLoteResiduoDto, SearchLotesDto, UpdateLocationDto } from './lote-residuo.dto';
import { TipoService } from '../tipo/tipo.service';
import { UnidadeService } from '../unidade/unidade.service';
import { FotosService } from '../fotos/fotos.service';
import { GoogleMapsService } from '../google-maps/google-maps.service';
import { ModerationService } from '../moderation/moderation.service';
import { MailingService } from '../mailing/mailing.service';
import { UserService } from '../user/user.service';
import { MAX_FOTOS_PER_LOTE } from '../../constants';
import { MIN_LATITUDE, MAX_LATITUDE, MIN_LONGITUDE, MAX_LONGITUDE } from '../../constants/coordinates';

interface LoteWithCoordinates extends LoteResiduoEntity {
  latitude: string;
  longitude: string;
}

/**
 * @deprecated This service is deprecated and will be removed in a future version.
 * Please use OfferService instead.
 * This service is kept for backward compatibility with existing UI.
 * Migration guide: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
 */
@Injectable()
export class LoteResiduoService {
  constructor(
    @InjectRepository(LoteResiduoEntity)
    private readonly loteResiduoRepository: Repository<LoteResiduoEntity>,
    private readonly tipoService: TipoService,
    private readonly unidadeService: UnidadeService,
    private readonly fotosService: FotosService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly moderationService: ModerationService,
    private readonly mailingService: MailingService,
    private readonly userService: UserService,
  ) {}

  private validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= MIN_LATITUDE &&
      latitude <= MAX_LATITUDE &&
      longitude >= MIN_LONGITUDE &&
      longitude <= MAX_LONGITUDE &&
      latitude !== 0 &&
      longitude !== 0
    );
  }

  /**
   * Constrói objeto de camadas de localização a partir de uma entidade LoteResiduo
   * Retorna real, neighborhood e city quando disponíveis
   */
  private buildLocationLayers(lote: LoteResiduoEntity) {
    const layers: any = {};

    // Camada real (sempre presente se houver localização)
    if (lote.localizacao) {
      const [lat, lng] = lote.localizacao.split(',').map(parseFloat);
      layers.real = {
        latitude: lat,
        longitude: lng,
        label: lote.formatted_address || lote.localizacao,
      };
    }

    // Camada de bairro
    if (lote.neighborhood_name && lote.neighborhood_location_raw) {
      const [neighLat, neighLng] = lote.neighborhood_location_raw.split(',').map(parseFloat);
      layers.neighborhood = {
        latitude: neighLat,
        longitude: neighLng,
        label: lote.neighborhood_name,
      };
    }

    // Camada de cidade
    if (lote.city_name && lote.city_location_raw) {
      const [cityLat, cityLng] = lote.city_location_raw.split(',').map(parseFloat);
      layers.city = {
        latitude: cityLat,
        longitude: cityLng,
        label: lote.city_name,
      };
    }

    return Object.keys(layers).length > 0 ? layers : null;
  }

  /**
   * Constrói objeto de camadas de localização aproximada (ponto de referência)
   * Retorna neighborhood e city quando disponíveis
   */
  private buildApproxLocationLayers(lote: LoteResiduoEntity) {
    const layers: any = {};

    // Camada de bairro aproximado
    if (lote.approx_neighborhood_name && lote.approx_neighborhood_location_raw) {
      const [neighLat, neighLng] = lote.approx_neighborhood_location_raw.split(',').map(parseFloat);
      layers.neighborhood = {
        latitude: neighLat,
        longitude: neighLng,
        label: lote.approx_neighborhood_name,
      };
    }

    // Camada de cidade aproximada
    if (lote.approx_city_name && lote.approx_city_location_raw) {
      const [cityLat, cityLng] = lote.approx_city_location_raw.split(',').map(parseFloat);
      layers.city = {
        latitude: cityLat,
        longitude: cityLng,
        label: lote.approx_city_name,
      };
    }

    return Object.keys(layers).length > 0 ? layers : null;
  }

  async create(createDto: CreateLoteResiduoDto, userId: number) {
    const logger = new Logger(LoteResiduoService.name);
    logger.log(`create - User: ${userId} - Creating lote: ${createDto.titulo}`);
    // Validar tipo e unidade
    const tipos = await this.tipoService.findAll(userId);
    const tipoExists = tipos.data.find((t) => t.id === createDto.tipo_id);
    if (!tipoExists) {
      throw new BadRequestException(`Tipo com ID ${createDto.tipo_id} não encontrado`);
    }

    const unidades = await this.unidadeService.findAll(userId);
    const unidadeExists = unidades.data.find((u) => u.id === createDto.unidade_id);
    if (!unidadeExists) {
      throw new BadRequestException(`Unidade com ID ${createDto.unidade_id} não encontrado`);
    }

    // Validar fotos
    if (createDto.fotos && createDto.fotos.length > MAX_FOTOS_PER_LOTE) {
      throw new BadRequestException(`Máximo de ${MAX_FOTOS_PER_LOTE} fotos por lote`);
    }

    // VALIDAÇÃO DE IA: Verificar conteúdo antes de criar o lote
    try {
      const tipoNome = tipoExists.nome;
      const validationResult = await this.moderationService.checkPublication(
        {
          titulo: createDto.titulo,
          descricao: createDto.descricao,
          categoria: tipoNome,
        },
        userId,
      );

      // Se validação retornou null, significa erro técnico - permitir criação (fail-open)
      if (!validationResult) {
        logger.warn(
          `create - User: ${userId} - AI validation unavailable (allowing creation)`,
        );
      } else {
        // Se a publicação foi bloqueada ou precisa de revisão, bloquear criação
        if (validationResult.status === 'blocked' || validationResult.status === 'needs_revision') {
          logger.warn(
            `create - User: ${userId} - Publication blocked/rejected: ${validationResult.reason}`,
          );

          // Buscar e-mail do usuário para enviar orientação
          const user = await this.userService.findById(userId);
          if (user && user.email) {
            try {
              await this.mailingService.sendPublicationGuidanceEmail(
                user.email,
                user.email.split('@')[0] || 'Usuário',
                validationResult.status,
                validationResult.reason,
                validationResult.issues,
                validationResult.suggestions,
              );
              logger.log(`create - User: ${userId} - Guidance email sent to ${user.email}`);
            } catch (emailError) {
              logger.error(
                `create - User: ${userId} - Failed to send guidance email: ${emailError instanceof Error ? emailError.message : String(emailError)}`,
              );
            }
          }

          // Montar mensagem de erro detalhada
          const errorMessage = validationResult.status === 'blocked'
            ? `Publicação bloqueada: ${validationResult.reason}. ${validationResult.issues.join('. ')}`
            : `Publicação precisa de revisão: ${validationResult.reason}. ${validationResult.issues.join('. ')}${validationResult.suggestions ? ` Sugestões: ${validationResult.suggestions.join('. ')}` : ''}`;

          throw new BadRequestException(errorMessage);
        }

        logger.log(`create - User: ${userId} - Publication approved by AI validation`);
      }
    } catch (error) {
      // Se já é BadRequestException (bloqueio da validação), re-lançar
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Se houver erro na validação de IA, logar mas permitir criação (fail-open)
      logger.error(
        `create - User: ${userId} - AI validation error (allowing creation): ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Buscar fornecedor do usuário logado
    const fornecedorResult = await this.loteResiduoRepository.manager
      .createQueryBuilder()
      .select('f.id', 'id')
      .from('tb_user_fornecedor', 'uf')
      .innerJoin('tb_fornecedor', 'f', 'f.id = uf.fornecedor_id')
      .where('uf.user_id = :userId', { userId })
      .limit(1)
      .getRawOne();

    if (!fornecedorResult || !fornecedorResult.id) {
      throw new BadRequestException('Usuário não possui fornecedor associado. Faça login novamente.');
    }

    const fornecedorId = fornecedorResult.id;

    // Validar e processar endereço se fornecido
    let locationData = null;
    let locationLayers = null;
    let approxLocationData = null;
    let approxLocationLayers = null;
    if (createDto.address) {
      // Validar place_id com Google Maps API
      try {
        locationData = await this.googleMapsService.validatePlaceId(createDto.address.placeId);
        // Extrair camadas de localização (real, bairro, cidade)
        locationLayers = this.googleMapsService.extractLocationLayers(locationData);
        
        // Se o frontend enviou localização sugerida (com busca por estabelecimentos), usar ela
        // Caso contrário, gerar localização aproximada automaticamente
        if (createDto.suggestedAddress && createDto.suggestedLocation) {
          // Usar localização sugerida enviada pelo frontend (já validada com Places API)
          approxLocationData = {
            formattedAddress: createDto.suggestedAddress.formattedAddress,
            placeId: createDto.suggestedAddress.placeId,
            latitude: createDto.suggestedAddress.latitude,
            longitude: createDto.suggestedAddress.longitude,
            accuracy: createDto.suggestedAddress.geocodingAccuracy || 'APPROXIMATE',
          };
          
          // Validar place_id da localização sugerida se disponível
          if (approxLocationData.placeId) {
            try {
              const validatedSuggested = await this.googleMapsService.validatePlaceId(approxLocationData.placeId);
              approxLocationData = validatedSuggested;
            } catch (error) {
              // Se validação falhar, usar dados enviados
              logger.warn(`Failed to validate suggested location place_id: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          
          if (approxLocationData) {
            approxLocationLayers = this.googleMapsService.extractLocationLayers(approxLocationData);
            // Se houver label na localização sugerida (nome do estabelecimento), usar ele
            if (createDto.suggestedLocation.label && approxLocationLayers) {
              // Adicionar label ao neighborhood se não existir
              if (!approxLocationLayers.neighborhood && approxLocationLayers.city) {
                approxLocationLayers.neighborhood = {
                  latitude: approxLocationData.latitude,
                  longitude: approxLocationData.longitude,
                  label: createDto.suggestedLocation.label,
                };
              }
            }
          }
        } else {
          // Gerar localização aproximada automaticamente (~15km de deslocamento)
          approxLocationData = await this.googleMapsService.generateApproximateLocation(
            locationData.latitude,
            locationData.longitude
          );
          
          if (approxLocationData) {
            approxLocationLayers = this.googleMapsService.extractLocationLayers(approxLocationData);
          }
        }
      } catch (error) {
        // Se a validação falhar, usar dados fornecidos sem validação
        locationData = {
          formattedAddress: createDto.address.formattedAddress,
          placeId: createDto.address.placeId,
          latitude: createDto.address.latitude,
          longitude: createDto.address.longitude,
          accuracy: createDto.address.geocodingAccuracy || 'APPROXIMATE',
        };
      }
    }

    // Criar lote
    const lat = locationData?.latitude || createDto.address?.latitude || createDto.localizacao?.latitude;
    const lng = locationData?.longitude || createDto.address?.longitude || createDto.localizacao?.longitude;

    const lote = this.loteResiduoRepository.create({
      titulo: createDto.titulo,
      descricao: createDto.descricao,
      preco: createDto.preco,
      quantidade: createDto.quantidade,
      quantidade_vendida: 0,
      localizacao: lat && lng ? `${lat},${lng}` : undefined,
      formatted_address: locationData?.formattedAddress || createDto.address?.formattedAddress,
      place_id: locationData?.placeId || createDto.address?.placeId,
      geocoding_accuracy: locationData?.accuracy || createDto.address?.geocodingAccuracy,
      // Preencher camadas de localização se disponíveis
      neighborhood_name: locationLayers?.neighborhood?.label,
      neighborhood_location_raw: locationLayers?.neighborhood 
        ? `${locationLayers.neighborhood.latitude},${locationLayers.neighborhood.longitude}`
        : undefined,
      city_name: locationLayers?.city?.label,
      city_location_raw: locationLayers?.city
        ? `${locationLayers.city.latitude},${locationLayers.city.longitude}`
        : undefined,
      // Campos de localização aproximada
      approx_location_raw: approxLocationData
        ? `${approxLocationData.latitude},${approxLocationData.longitude}`
        : undefined,
      approx_formatted_address: approxLocationData?.formattedAddress,
      approx_place_id: approxLocationData?.placeId,
      approx_geocoding_accuracy: approxLocationData?.accuracy,
      approx_neighborhood_name: approxLocationLayers?.neighborhood?.label,
      approx_neighborhood_location_raw: approxLocationLayers?.neighborhood
        ? `${approxLocationLayers.neighborhood.latitude},${approxLocationLayers.neighborhood.longitude}`
        : undefined,
      approx_city_name: approxLocationLayers?.city?.label,
      approx_city_location_raw: approxLocationLayers?.city
        ? `${approxLocationLayers.city.latitude},${approxLocationLayers.city.longitude}`
        : undefined,
      tipo_id: createDto.tipo_id,
      unidade_id: createDto.unidade_id,
      fornecedor_id: fornecedorId,
    });

    const savedLote = await this.loteResiduoRepository.save(lote);

    // Popular location_geog usando query raw para PostGIS (todas as camadas)
    if (lat && lng) {
      const updateSet: any = {
        location_geog: () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`,
      };
      
      // Adicionar neighborhood_location_geog se disponível
      if (locationLayers?.neighborhood) {
        const neighLat = locationLayers.neighborhood.latitude;
        const neighLng = locationLayers.neighborhood.longitude;
        updateSet.neighborhood_location_geog = () => `ST_SetSRID(ST_MakePoint(${neighLng}, ${neighLat}), 4326)::geography`;
      }
      
      // Adicionar city_location_geog se disponível
      if (locationLayers?.city) {
        const cityLat = locationLayers.city.latitude;
        const cityLng = locationLayers.city.longitude;
        updateSet.city_location_geog = () => `ST_SetSRID(ST_MakePoint(${cityLng}, ${cityLat}), 4326)::geography`;
      }
      
      // Adicionar localizações aproximadas
      if (approxLocationData) {
        const approxLat = approxLocationData.latitude;
        const approxLng = approxLocationData.longitude;
        updateSet.approx_location_geog = () => `ST_SetSRID(ST_MakePoint(${approxLng}, ${approxLat}), 4326)::geography`;
        
        if (approxLocationLayers?.neighborhood) {
          const neighLat = approxLocationLayers.neighborhood.latitude;
          const neighLng = approxLocationLayers.neighborhood.longitude;
          updateSet.approx_neighborhood_location_geog = () => `ST_SetSRID(ST_MakePoint(${neighLng}, ${neighLat}), 4326)::geography`;
        }
        
        if (approxLocationLayers?.city) {
          const cityLat = approxLocationLayers.city.latitude;
          const cityLng = approxLocationLayers.city.longitude;
          updateSet.approx_city_location_geog = () => `ST_SetSRID(ST_MakePoint(${cityLng}, ${cityLat}), 4326)::geography`;
        }
      }

      await this.loteResiduoRepository
        .createQueryBuilder()
        .update(LoteResiduoEntity)
        .set(updateSet)
        .where('id = :id', { id: savedLote.id })
        .execute();
    }

    // Processar fotos
    const fotos = [];
    if (createDto.fotos && createDto.fotos.length > 0) {
      for (const fotoBase64 of createDto.fotos) {
        const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
        const imagem = Buffer.from(base64Data, 'base64');
        const foto = await this.fotosService.create(savedLote.id, imagem);
        fotos.push({
          id: foto.id,
          url: `/app/api/fotos/${foto.id}`,
        });
      }
    }

    // Buscar relacionamentos
    const fullLote = await this.loteResiduoRepository.findOne({
      where: { id: savedLote.id },
      relations: ['tipo', 'unidade'],
    });

    if (!fullLote) {
      throw new NotFoundException(`Lote criado mas não encontrado após criação`);
    }

    // Salvar formas de pagamento se fornecidas
    if (createDto.payment_method_ids && createDto.payment_method_ids.length > 0) {
      const paymentMethodValues = createDto.payment_method_ids.map(pmId => 
        `(${savedLote.id}, ${pmId})`
      ).join(', ');
      
      await this.loteResiduoRepository.query(`
        INSERT INTO tb_payment_method_offer (offer_id, forma_pagamento_id)
        VALUES ${paymentMethodValues}
        ON CONFLICT DO NOTHING
      `);
    }

    const result = {
      id: fullLote.id,
      titulo: fullLote.titulo,
      descricao: fullLote.descricao,
      preco: fullLote.preco,
      quantidade: fullLote.quantidade,
      quantidade_vendida: fullLote.quantidade_vendida,
      localizacao: fullLote.localizacao
        ? {
            latitude: parseFloat(fullLote.localizacao.split(',')[0]),
            longitude: parseFloat(fullLote.localizacao.split(',')[1]),
          }
        : null,
      address: fullLote.formatted_address
        ? {
            formattedAddress: fullLote.formatted_address,
            placeId: fullLote.place_id || '',
            latitude: fullLote.localizacao ? parseFloat(fullLote.localizacao.split(',')[0]) : 0,
            longitude: fullLote.localizacao ? parseFloat(fullLote.localizacao.split(',')[1]) : 0,
            geocodingAccuracy: fullLote.geocoding_accuracy || 'APPROXIMATE',
          }
        : null,
      locationLayers: this.buildLocationLayers(fullLote),
      tipo: fullLote.tipo ? { id: fullLote.tipo.id, nome: fullLote.tipo.nome } : null,
      unidade: fullLote.unidade ? { id: fullLote.unidade.id, nome: fullLote.unidade.nome } : null,
      fotos,
      created_at: fullLote.created_at,
      updated_at: fullLote.updated_at,
    };
    logger.log(`create - User: ${userId} - Lote created successfully with ID: ${fullLote.id}`);
    return result;
  }

  async findAll(query: SearchLotesDto, userId: number | null) {
    const logger = new Logger(LoteResiduoService.name);
    logger.log(`findAll - User: ${userId || 'anonymous'} - Query: ${JSON.stringify(query)}`);
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const queryBuilder = this.loteResiduoRepository
      .createQueryBuilder('lote')
      .select([
        'lote.id',
        'lote.titulo',
        'lote.descricao',
        'lote.preco',
        'lote.quantidade',
        'lote.quantidade_vendida',
        'lote.localizacao',
        'lote.formatted_address',
        'lote.place_id',
        'lote.geocoding_accuracy',
        'lote.city_name',
        'lote.city_location_raw',
        'lote.neighborhood_name',
        'lote.neighborhood_location_raw',
        'lote.created_at',
        'lote.tipo_id',
        'lote.unidade_id',
        'lote.fornecedor_id',
      ])
      .addSelect('CASE WHEN lote.location_geog IS NOT NULL THEN ST_X(lote.location_geog::geometry)::text ELSE NULL END', 'longitude')
      .addSelect('CASE WHEN lote.location_geog IS NOT NULL THEN ST_Y(lote.location_geog::geometry)::text ELSE NULL END', 'latitude')
      .leftJoinAndSelect('lote.tipo', 'tipo')
      .leftJoinAndSelect('lote.unidade', 'unidade')
      .leftJoinAndSelect('lote.fornecedor', 'fornecedor')
      .leftJoinAndSelect('lote.fotos', 'fotos')
      .leftJoin('tb_transacao', 't', 't.offer_id = lote.id')
      .where('t.id IS NULL') // Apenas lotes sem transação (disponíveis para venda)
      .andWhere('lote.quantidade_vendida = 0'); // Salvaguarda adicional: apenas lotes não vendidos

    // Text search
    if (query.search) {
      queryBuilder.andWhere('lote.titulo ILIKE :search', { search: `%${query.search}%` });
    }

    // Geospatial filters
    if (query.bounds) {
      // Bounding box filter: "southWestLat,southWestLng,northEastLat,northEastLng"
      const [swLat, swLng, neLat, neLng] = query.bounds.split(',').map(Number);
      queryBuilder.andWhere(
        `lote.location_geog IS NOT NULL AND lote.location_geog && ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326)::geography`,
        { swLat, swLng, neLat, neLng }
      );
    } else if (query.near && query.radius) {
      // Radial search: find lotes within radius meters of point
      const [lat, lng] = query.near.split(',').map(Number);
      queryBuilder.andWhere(
        `lote.location_geog IS NOT NULL AND ST_DWithin(lote.location_geog, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
        { lat, lng, radius: query.radius }
      );
    }

    queryBuilder
      .orderBy('lote.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [lotes, total] = await queryBuilder.getManyAndCount();

    const data = (lotes as LoteWithCoordinates[]).map((lote) => {
      // Extrair coordenadas de location_geog (PostGIS) com fallback para localizacao
      let latitude = 0;
      let longitude = 0;

      // Priorizar coordenadas de location_geog
      if (lote.latitude && lote.longitude) {
        latitude = parseFloat(lote.latitude);
        longitude = parseFloat(lote.longitude);
      } else if (lote.localizacao) {
        // Fallback para localizacao VARCHAR(255)
        const coords = lote.localizacao.split(',');
        if (coords.length === 2) {
          latitude = parseFloat(coords[0]);
          longitude = parseFloat(coords[1]);
        }
      }

      // Validar coordenadas
      const hasValidCoords = this.validateCoordinates(latitude, longitude);

      return {
        id: lote.id,
        nome: lote.titulo,
        titulo: lote.titulo,
        descricao: lote.descricao,
        preco: lote.preco,
        quantidade: lote.quantidade,
        quantidade_vendida: lote.quantidade_vendida,
        localizacao: hasValidCoords ? { latitude, longitude } : null,
        address: lote.formatted_address
          ? {
              formattedAddress: lote.formatted_address,
              placeId: lote.place_id || '',
              latitude,
              longitude,
            }
          : null,
        locationLayers: this.buildLocationLayers(lote as LoteResiduoEntity),
        tipo: lote.tipo ? { id: lote.tipo.id, nome: lote.tipo.nome } : null,
        unidade: lote.unidade ? { id: lote.unidade.id, nome: lote.unidade.nome } : null,
        fornecedor: lote.fornecedor
          ? {
              id: lote.fornecedor.id,
              nome: lote.fornecedor.nome,
              avatar_url: `/app/api/fornecedores/${lote.fornecedor.id}/avatar`,
            }
          : null,
        foto_principal: lote.fotos && lote.fotos.length > 0
          ? { id: lote.fotos[0].id, url: `/app/api/fotos/${lote.fotos[0].id}` }
          : null,
        created_at: lote.created_at,
      };
    });

    const result = {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
    logger.log(`findAll - User: ${userId || 'anonymous'} - Found ${total} lotes`);
    return result;
  }

  async findOne(id: number, userId?: number) {
    const lote = await this.loteResiduoRepository
      .createQueryBuilder('lote')
      .select([
        'lote.id',
        'lote.titulo',
        'lote.descricao',
        'lote.preco',
        'lote.quantidade',
        'lote.quantidade_vendida',
        'lote.localizacao',
        'lote.formatted_address',
        'lote.place_id',
        'lote.geocoding_accuracy',
        'lote.city_name',
        'lote.city_location_raw',
        'lote.neighborhood_name',
        'lote.neighborhood_location_raw',
        'lote.approx_location_raw',
        'lote.approx_formatted_address',
        'lote.approx_city_name',
        'lote.approx_city_location_raw',
        'lote.approx_neighborhood_name',
        'lote.approx_neighborhood_location_raw',
        'lote.created_at',
        'lote.updated_at',
        'lote.tipo_id',
        'lote.unidade_id',
        'lote.fornecedor_id',
      ])
      .addSelect('CASE WHEN lote.location_geog IS NOT NULL THEN ST_X(lote.location_geog::geometry)::text ELSE NULL END', 'longitude')
      .addSelect('CASE WHEN lote.location_geog IS NOT NULL THEN ST_Y(lote.location_geog::geometry)::text ELSE NULL END', 'latitude')
      .leftJoinAndSelect('lote.tipo', 'tipo')
      .leftJoinAndSelect('lote.unidade', 'unidade')
      .leftJoinAndSelect('lote.fornecedor', 'fornecedor')
      .leftJoinAndSelect('lote.fotos', 'fotos')
      .where('lote.id = :id', { id })
      .getOne();

    if (!lote) {
      throw new NotFoundException(`Lote com ID ${id} não encontrado`);
    }

    const loteData = lote as LoteWithCoordinates;
    const quantidade_disponivel = Number(lote.quantidade) - Number(lote.quantidade_vendida);

    // Verificar se o lote já tem transações (quantidade_vendida > 0)
    const hasTransacao = Number(lote.quantidade_vendida || 0) > 0;

    // Verificar se o usuário logado é fornecedor do lote
    let isUserFornecedor = false;
    if (userId && lote.fornecedor_id) {
      const userFornecedorCheck = await this.loteResiduoRepository
        .createQueryBuilder('lote')
        .innerJoin('tb_user_fornecedor', 'uf', 'uf.fornecedor_id = lote.fornecedor_id')
        .where('lote.id = :id', { id })
        .andWhere('uf.user_id = :userId', { userId })
        .getCount();
      
      isUserFornecedor = userFornecedorCheck > 0;
    }

    // Extrair coordenadas de location_geog (PostGIS) com fallback para localizacao
    let latitude = 0;
    let longitude = 0;

    // Priorizar coordenadas de location_geog
    if (loteData.latitude && loteData.longitude) {
      latitude = parseFloat(loteData.latitude);
      longitude = parseFloat(loteData.longitude);
    } else if (lote.localizacao) {
      // Fallback para localizacao VARCHAR(255)
      const coords = lote.localizacao.split(',');
      if (coords.length === 2) {
        latitude = parseFloat(coords[0]);
        longitude = parseFloat(coords[1]);
      }
    }

    // Validar coordenadas
    const hasValidCoords = this.validateCoordinates(latitude, longitude);

    return {
      id: lote.id,
      nome: lote.titulo,
      titulo: lote.titulo,
      descricao: lote.descricao,
      preco: lote.preco,
      quantidade: lote.quantidade,
      quantidade_vendida: lote.quantidade_vendida,
      quantidade_disponivel,
      localizacao: hasValidCoords ? { latitude, longitude } : null,
      address: lote.formatted_address
        ? {
            formattedAddress: lote.formatted_address,
            placeId: lote.place_id || '',
            latitude,
            longitude,
            geocodingAccuracy: lote.geocoding_accuracy || 'APPROXIMATE',
          }
        : null,
      locationLayers: this.buildLocationLayers(lote as LoteResiduoEntity),
      approxLocationLayers: this.buildApproxLocationLayers(lote as LoteResiduoEntity),
      approx_formatted_address: lote.approx_formatted_address || null,
      tipo: lote.tipo ? { id: lote.tipo.id, nome: lote.tipo.nome } : null,
      unidade: lote.unidade ? { id: lote.unidade.id, nome: lote.unidade.nome } : null,
      fornecedor: lote.fornecedor
        ? {
            id: lote.fornecedor.id,
            nome: lote.fornecedor.nome,
            whatsapp: lote.fornecedor.whatsapp,
            avatar_url: `/app/api/fornecedores/${lote.fornecedor.id}/avatar`,
          }
        : null,
      foto_principal: lote.fotos && lote.fotos.length > 0
        ? { id: lote.fotos[0].id, url: `/app/api/fotos/${lote.fotos[0].id}` }
        : null,
      fotos: lote.fotos?.map((foto) => ({
        id: foto.id,
        url: `/app/api/fotos/${foto.id}`,
        alt: `${lote.titulo} - Foto ${foto.id}`,
      })) || [],
      created_at: lote.created_at,
      updated_at: lote.updated_at,
      // Informações adicionais para o front-end
      is_user_fornecedor: isUserFornecedor,
      has_transacao: hasTransacao,
    };
  }

  async updateLocation(id: number, updateDto: UpdateLocationDto, userId: number | null) {
    const logger = new Logger(LoteResiduoService.name);
    logger.log(`updateLocation - User: ${userId || 'anonymous'} - Lote ID: ${id}`);
    const lote = await this.loteResiduoRepository.findOne({
      where: { id },
    });

    if (!lote) {
      throw new NotFoundException(`Lote com ID ${id} não encontrado`);
    }

    // Validar place_id com Google Maps API
    let locationData = null;
    let locationLayers = null;
    try {
      locationData = await this.googleMapsService.validatePlaceId(updateDto.address.placeId);
      // Extrair camadas de localização (real, bairro, cidade)
      locationLayers = this.googleMapsService.extractLocationLayers(locationData);
    } catch (error) {
      // Se a validação falhar, usar dados fornecidos
      locationData = {
        formattedAddress: updateDto.address.formattedAddress,
        placeId: updateDto.address.placeId,
        latitude: updateDto.address.latitude,
        longitude: updateDto.address.longitude,
        accuracy: updateDto.address.geocodingAccuracy || 'APPROXIMATE',
      };
    }

    // Atualizar campos de localização
    lote.localizacao = `${locationData.latitude},${locationData.longitude}`;
    lote.formatted_address = locationData.formattedAddress;
    lote.place_id = locationData.placeId;
    lote.geocoding_accuracy = locationData.accuracy;

    // Preencher camadas de localização se disponíveis
    if (locationLayers) {
      lote.neighborhood_name = locationLayers.neighborhood?.label;
      lote.neighborhood_location_raw = locationLayers.neighborhood 
        ? `${locationLayers.neighborhood.latitude},${locationLayers.neighborhood.longitude}`
        : undefined;
      lote.city_name = locationLayers.city?.label;
      lote.city_location_raw = locationLayers.city
        ? `${locationLayers.city.latitude},${locationLayers.city.longitude}`
        : undefined;
    }

    await this.loteResiduoRepository.save(lote);

    // Atualizar location_geog usando query raw para PostGIS (todas as camadas)
    const updateSet: any = {
      location_geog: () => `ST_SetSRID(ST_MakePoint(${locationData.longitude}, ${locationData.latitude}), 4326)::geography`,
    };
    
    // Adicionar neighborhood_location_geog se disponível
    if (locationLayers?.neighborhood) {
      const neighLat = locationLayers.neighborhood.latitude;
      const neighLng = locationLayers.neighborhood.longitude;
      updateSet.neighborhood_location_geog = () => `ST_SetSRID(ST_MakePoint(${neighLng}, ${neighLat}), 4326)::geography`;
    }
    
    // Adicionar city_location_geog se disponível
    if (locationLayers?.city) {
      const cityLat = locationLayers.city.latitude;
      const cityLng = locationLayers.city.longitude;
      updateSet.city_location_geog = () => `ST_SetSRID(ST_MakePoint(${cityLng}, ${cityLat}), 4326)::geography`;
    }

    await this.loteResiduoRepository
      .createQueryBuilder()
      .update(LoteResiduoEntity)
      .set(updateSet)
      .where('id = :id', { id })
      .execute();

    // Buscar lote atualizado com relacionamentos
    const updatedLote = await this.loteResiduoRepository.findOne({
      where: { id },
      relations: ['tipo', 'unidade', 'fornecedor'],
    });

    if (!updatedLote) {
      throw new NotFoundException(`Lote atualizado mas não encontrado`);
    }

    const result = {
      id: updatedLote.id,
      nome: updatedLote.titulo,
      address: updatedLote.formatted_address
        ? {
            formattedAddress: updatedLote.formatted_address,
            placeId: updatedLote.place_id || '',
            latitude: parseFloat(updatedLote.localizacao!.split(',')[0]),
            longitude: parseFloat(updatedLote.localizacao!.split(',')[1]),
            geocodingAccuracy: updatedLote.geocoding_accuracy || 'APPROXIMATE',
          }
        : null,
      locationLayers: this.buildLocationLayers(updatedLote),
      updated_at: updatedLote.updated_at,
    };
    logger.log(`updateLocation - User: ${userId || 'anonymous'} - Lote ID: ${id} updated successfully`);
    return result;
  }

  async findByUserId(userId: number, pagination: { page: number; pageSize: number }) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    // Buscar lotes vendidos com dados da transação usando getRawAndEntities
    const lotesVendidosResult = await this.loteResiduoRepository
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.tipo', 'tipo')
      .leftJoinAndSelect('lote.unidade', 'unidade')
      .leftJoinAndSelect('lote.fornecedor', 'fornecedor')
      .leftJoinAndSelect('lote.fotos', 'fotos')
      .innerJoin('tb_user_fornecedor', 'uf', 'uf.fornecedor_id = lote.fornecedor_id')
      .innerJoin('tb_transacao', 't', 't.offer_id = lote.id')
      .leftJoin('t.comprador', 'comprador')
      .addSelect(['comprador.id', 'comprador.nome'])
      .addSelect('t.id', 'transacao_id')
      .addSelect('t.quantidade', 'transacao_quantidade')
      .addSelect('t.created_at', 'transacao_created_at')
      .where('uf.user_id = :userId', { userId })
      .orderBy('lote.created_at', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getRawAndEntities();

    // Buscar lotes comprados com dados da transação
    const lotesCompradosResult = await this.loteResiduoRepository
      .createQueryBuilder('lote')
      .leftJoinAndSelect('lote.tipo', 'tipo')
      .leftJoinAndSelect('lote.unidade', 'unidade')
      .leftJoinAndSelect('lote.fornecedor', 'fornecedor')
      .leftJoinAndSelect('lote.fotos', 'fotos')
      .innerJoin('tb_transacao', 't', 't.offer_id = lote.id')
      .addSelect('t.id', 'transacao_id')
      .addSelect('t.quantidade', 'transacao_quantidade')
      .addSelect('t.created_at', 'transacao_created_at')
      .innerJoin('tb_user_comprador', 'uc', 'uc.comprador_id = t.comprador_id')
      .where('uc.user_id = :userId', { userId })
      .orderBy('lote.created_at', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getRawAndEntities();

    // Mapear lotes vendidos com dados de transação dos raw results
    const lotesVendidos = lotesVendidosResult.entities.map((lote, index) => {
      const raw = lotesVendidosResult.raw[index];
      return {
        id: lote.id,
        nome: lote.titulo,
        titulo: lote.titulo,
        descricao: lote.descricao,
        preco: lote.preco,
        quantidade: lote.quantidade,
        quantidade_vendida: lote.quantidade_vendida,
        locationLayers: this.buildLocationLayers(lote as LoteResiduoEntity),
        approx_formatted_address: lote.approx_formatted_address || null,
        fornecedor: lote.fornecedor
          ? {
              id: lote.fornecedor.id,
              nome: lote.fornecedor.nome,
              avatar_url: `/app/api/fornecedores/${lote.fornecedor.id}/avatar`,
            }
          : null,
        comprador: raw.comprador_id
          ? {
              id: raw.comprador_id,
              nome: raw.comprador_nome,
            }
          : null,
        tipo: lote.tipo ? { id: lote.tipo.id, nome: lote.tipo.nome } : null,
        unidade: lote.unidade ? { id: lote.unidade.id, nome: lote.unidade.nome } : null,
        foto_principal: lote.fotos && lote.fotos.length > 0
          ? { id: lote.fotos[0].id, url: `/app/api/fotos/${lote.fotos[0].id}` }
          : null,
        transacao: {
          id: raw.transacao_id,
          quantidade_negociada: raw.transacao_quantidade,
          data_transacao: raw.transacao_created_at,
        },
        created_at: lote.created_at,
      };
    });

    // Mapear lotes comprados com dados de transação dos raw results
    const lotesComprados = lotesCompradosResult.entities.map((lote, index) => {
      const raw = lotesCompradosResult.raw[index];
      return {
        id: lote.id,
        nome: lote.titulo,
        titulo: lote.titulo,
        descricao: lote.descricao,
        preco: lote.preco,
        quantidade: lote.quantidade,
        quantidade_vendida: lote.quantidade_vendida,
        locationLayers: this.buildLocationLayers(lote as LoteResiduoEntity),
        approx_formatted_address: lote.approx_formatted_address || null,
        fornecedor: lote.fornecedor
          ? {
              id: lote.fornecedor.id,
              nome: lote.fornecedor.nome,
              avatar_url: `/app/api/fornecedores/${lote.fornecedor.id}/avatar`,
            }
          : null,
        tipo: lote.tipo ? { id: lote.tipo.id, nome: lote.tipo.nome } : null,
        unidade: lote.unidade ? { id: lote.unidade.id, nome: lote.unidade.nome } : null,
        foto_principal: lote.fotos && lote.fotos.length > 0
          ? { id: lote.fotos[0].id, url: `/app/api/fotos/${lote.fotos[0].id}` }
          : null,
        transacao: {
          id: raw.transacao_id,
          quantidade_negociada: raw.transacao_quantidade,
          data_transacao: raw.transacao_created_at,
        },
        created_at: lote.created_at,
      };
    });

    return {
      lotesVendidos,
      lotesComprados,
      pagination: {
        page,
        pageSize,
        totalItems: lotesVendidos.length + lotesComprados.length,
        totalPages: Math.ceil((lotesVendidos.length + lotesComprados.length) / pageSize),
      },
    };
  }
}
