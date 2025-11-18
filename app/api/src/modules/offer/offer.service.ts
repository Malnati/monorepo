// app/api/src/modules/offer/offer.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OfferEntity } from "./offer.entity";
import {
  CreateOfferDto,
  SearchOffersDto,
  UpdateLocationDto,
} from "./offer.dto";
import { TipoService } from "../tipo/tipo.service";
import { UnidadeService } from "../unidade/unidade.service";
import { FotosService } from "../fotos/fotos.service";
import { GoogleMapsService } from "../google-maps/google-maps.service";
import { ModerationService } from "../moderation/moderation.service";
import { MailingService } from "../mailing/mailing.service";
import { UserService } from "../user/user.service";
import { MAX_FOTOS_PER_OFFER } from "../../constants";
import {
  MIN_LATITUDE,
  MAX_LATITUDE,
  MIN_LONGITUDE,
  MAX_LONGITUDE,
} from "../../constants/coordinates";

interface OfferWithCoordinates extends OfferEntity {
  latitude: string;
  longitude: string;
}

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(OfferEntity)
    private readonly offerRepository: Repository<OfferEntity>,
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
  private buildLocationLayers(offer: OfferEntity) {
    const layers: any = {};

    // Camada real (sempre presente se houver localização)
    if (offer.location) {
      const [lat, lng] = offer.location.split(",").map(parseFloat);
      layers.real = {
        latitude: lat,
        longitude: lng,
        label: offer.formatted_address || offer.location,
      };
    }

    // Camada de bairro
    if (offer.neighborhood_name && offer.neighborhood_location_raw) {
      const [neighLat, neighLng] = offer.neighborhood_location_raw
        .split(",")
        .map(parseFloat);
      layers.neighborhood = {
        latitude: neighLat,
        longitude: neighLng,
        label: offer.neighborhood_name,
      };
    }

    // Camada de cidade
    if (offer.city_name && offer.city_location_raw) {
      const [cityLat, cityLng] = offer.city_location_raw
        .split(",")
        .map(parseFloat);
      layers.city = {
        latitude: cityLat,
        longitude: cityLng,
        label: offer.city_name,
      };
    }

    return Object.keys(layers).length > 0 ? layers : null;
  }

  /**
   * Constrói objeto de camadas de localização aproximada (ponto de referência)
   * Retorna neighborhood e city quando disponíveis
   */
  private buildApproxLocationLayers(offer: OfferEntity) {
    const layers: any = {};

    // Camada de bairro aproximado
    if (
      offer.approx_neighborhood_name &&
      offer.approx_neighborhood_location_raw
    ) {
      const [neighLat, neighLng] = offer.approx_neighborhood_location_raw
        .split(",")
        .map(parseFloat);
      layers.neighborhood = {
        latitude: neighLat,
        longitude: neighLng,
        label: offer.approx_neighborhood_name,
      };
    }

    // Camada de cidade aproximada
    if (offer.approx_city_name && offer.approx_city_location_raw) {
      const [cityLat, cityLng] = offer.approx_city_location_raw
        .split(",")
        .map(parseFloat);
      layers.city = {
        latitude: cityLat,
        longitude: cityLng,
        label: offer.approx_city_name,
      };
    }

    return Object.keys(layers).length > 0 ? layers : null;
  }

  async create(createDto: CreateOfferDto, userId: number) {
    const logger = new Logger(OfferService.name);
    logger.log(`create - User: ${userId} - Creating offer: ${createDto.title}`);
    // Validar tipo e unidade
    const tipos = await this.tipoService.findAll(userId);
    const tipoExists = tipos.data.find((t) => t.id === createDto.tipo_id);
    if (!tipoExists) {
      throw new BadRequestException(
        `Tipo com ID ${createDto.tipo_id} não encontrado`,
      );
    }

    const unidades = await this.unidadeService.findAll(userId);
    const unidadeExists = unidades.data.find(
      (u) => u.id === createDto.unidade_id,
    );
    if (!unidadeExists) {
      throw new BadRequestException(
        `Unidade com ID ${createDto.unidade_id} não encontrado`,
      );
    }

    // Validar fotos
    if (createDto.fotos && createDto.fotos.length > MAX_FOTOS_PER_OFFER) {
      throw new BadRequestException(
        `Máximo de ${MAX_FOTOS_PER_OFFER} fotos por offer`,
      );
    }

    // VALIDAÇÃO DE IA: Verificar conteúdo antes de criar o offer
    try {
      const tipoNome = tipoExists.nome;
      const validationResult = await this.moderationService.checkPublication(
        {
          title: createDto.title,
          description: createDto.description,
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
        if (
          validationResult.status === "blocked" ||
          validationResult.status === "needs_revision"
        ) {
          logger.warn(
            `create - User: ${userId} - Publication blocked/rejected: ${validationResult.reason}`,
          );

          // Buscar e-mail do usuário para enviar orientação
          const user = await this.userService.findById(userId);
          if (user && user.email) {
            try {
              await this.mailingService.sendPublicationGuidanceEmail(
                user.email,
                user.email.split("@")[0] || "Usuário",
                validationResult.status,
                validationResult.reason,
                validationResult.issues,
                validationResult.suggestions,
              );
              logger.log(
                `create - User: ${userId} - Guidance email sent to ${user.email}`,
              );
            } catch (emailError) {
              logger.error(
                `create - User: ${userId} - Failed to send guidance email: ${emailError instanceof Error ? emailError.message : String(emailError)}`,
              );
            }
          }

          // Montar mensagem de erro detalhada
          const errorMessage =
            validationResult.status === "blocked"
              ? `Publicação bloqueada: ${validationResult.reason}. ${validationResult.issues.join(". ")}`
              : `Publicação precisa de revisão: ${validationResult.reason}. ${validationResult.issues.join(". ")}${validationResult.suggestions ? ` Sugestões: ${validationResult.suggestions.join(". ")}` : ""}`;

          throw new BadRequestException(errorMessage);
        }

        logger.log(
          `create - User: ${userId} - Publication approved by AI validation`,
        );
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
    const fornecedorResult = await this.offerRepository.manager
      .createQueryBuilder()
      .select("f.id", "id")
      .from("tb_user_fornecedor", "uf")
      .innerJoin("tb_fornecedor", "f", "f.id = uf.fornecedor_id")
      .where("uf.user_id = :userId", { userId })
      .limit(1)
      .getRawOne();

    if (!fornecedorResult || !fornecedorResult.id) {
      throw new BadRequestException(
        "Usuário não possui fornecedor associado. Faça login novamente.",
      );
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
        locationData = await this.googleMapsService.validatePlaceId(
          createDto.address.placeId,
        );
        // Extrair camadas de localização (real, bairro, cidade)
        locationLayers =
          this.googleMapsService.extractLocationLayers(locationData);

        // Se o frontend enviou localização sugerida (com busca por estabelecimentos), usar ela
        // Caso contrário, gerar localização aproximada automaticamente
        if (createDto.suggestedAddress && createDto.suggestedLocation) {
          // Usar localização sugerida enviada pelo frontend (já validada com Places API)
          approxLocationData = {
            formattedAddress: createDto.suggestedAddress.formattedAddress,
            placeId: createDto.suggestedAddress.placeId,
            latitude: createDto.suggestedAddress.latitude,
            longitude: createDto.suggestedAddress.longitude,
            accuracy:
              createDto.suggestedAddress.geocodingAccuracy || "APPROXIMATE",
          };

          // Validar place_id da localização sugerida se disponível
          if (approxLocationData.placeId) {
            try {
              const validatedSuggested =
                await this.googleMapsService.validatePlaceId(
                  approxLocationData.placeId,
                );
              approxLocationData = validatedSuggested;
            } catch (error) {
              // Se validação falhar, usar dados enviados
              logger.warn(
                `Failed to validate suggested location place_id: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }

          if (approxLocationData) {
            approxLocationLayers =
              this.googleMapsService.extractLocationLayers(approxLocationData);
            // Se houver label na localização sugerida (nome do estabelecimento), usar ele
            if (createDto.suggestedLocation.label && approxLocationLayers) {
              // Adicionar label ao neighborhood se não existir
              if (
                !approxLocationLayers.neighborhood &&
                approxLocationLayers.city
              ) {
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
          approxLocationData =
            await this.googleMapsService.generateApproximateLocation(
              locationData.latitude,
              locationData.longitude,
            );

          if (approxLocationData) {
            approxLocationLayers =
              this.googleMapsService.extractLocationLayers(approxLocationData);
          }
        }
      } catch (error) {
        // Se a validação falhar, usar dados fornecidos sem validação
        locationData = {
          formattedAddress: createDto.address.formattedAddress,
          placeId: createDto.address.placeId,
          latitude: createDto.address.latitude,
          longitude: createDto.address.longitude,
          accuracy: createDto.address.geocodingAccuracy || "APPROXIMATE",
        };
      }
    }

    // Criar offer
    const lat =
      locationData?.latitude ||
      createDto.address?.latitude ||
      createDto.location?.latitude;
    const lng =
      locationData?.longitude ||
      createDto.address?.longitude ||
      createDto.location?.longitude;

    const offer = this.offerRepository.create({
      title: createDto.title,
      description: createDto.description,
      preco: createDto.preco,
      quantidade: createDto.quantidade,
      quantidade_vendida: 0,
      location: lat && lng ? `${lat},${lng}` : undefined,
      formatted_address:
        locationData?.formattedAddress || createDto.address?.formattedAddress,
      place_id: locationData?.placeId || createDto.address?.placeId,
      geocoding_accuracy:
        locationData?.accuracy || createDto.address?.geocodingAccuracy,
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

    const savedLote = await this.offerRepository.save(offer);

    // Popular location_geog usando query raw para PostGIS (todas as camadas)
    if (lat && lng) {
      const updateSet: any = {
        location_geog: () =>
          `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`,
      };

      // Adicionar neighborhood_location_geog se disponível
      if (locationLayers?.neighborhood) {
        const neighLat = locationLayers.neighborhood.latitude;
        const neighLng = locationLayers.neighborhood.longitude;
        updateSet.neighborhood_location_geog = () =>
          `ST_SetSRID(ST_MakePoint(${neighLng}, ${neighLat}), 4326)::geography`;
      }

      // Adicionar city_location_geog se disponível
      if (locationLayers?.city) {
        const cityLat = locationLayers.city.latitude;
        const cityLng = locationLayers.city.longitude;
        updateSet.city_location_geog = () =>
          `ST_SetSRID(ST_MakePoint(${cityLng}, ${cityLat}), 4326)::geography`;
      }

      // Adicionar localizações aproximadas
      if (approxLocationData) {
        const approxLat = approxLocationData.latitude;
        const approxLng = approxLocationData.longitude;
        updateSet.approx_location_geog = () =>
          `ST_SetSRID(ST_MakePoint(${approxLng}, ${approxLat}), 4326)::geography`;

        if (approxLocationLayers?.neighborhood) {
          const neighLat = approxLocationLayers.neighborhood.latitude;
          const neighLng = approxLocationLayers.neighborhood.longitude;
          updateSet.approx_neighborhood_location_geog = () =>
            `ST_SetSRID(ST_MakePoint(${neighLng}, ${neighLat}), 4326)::geography`;
        }

        if (approxLocationLayers?.city) {
          const cityLat = approxLocationLayers.city.latitude;
          const cityLng = approxLocationLayers.city.longitude;
          updateSet.approx_city_location_geog = () =>
            `ST_SetSRID(ST_MakePoint(${cityLng}, ${cityLat}), 4326)::geography`;
        }
      }

      await this.offerRepository
        .createQueryBuilder()
        .update(OfferEntity)
        .set(updateSet)
        .where("id = :id", { id: savedLote.id })
        .execute();
    }

    // Processar fotos
    const fotos = [];
    if (createDto.fotos && createDto.fotos.length > 0) {
      for (const fotoBase64 of createDto.fotos) {
        const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, "");
        const imagem = Buffer.from(base64Data, "base64");
        const foto = await this.fotosService.create(savedLote.id, imagem);
        fotos.push({
          id: foto.id,
          url: `/app/api/fotos/${foto.id}`,
        });
      }
    }

    // Buscar relacionamentos
    const fullLote = await this.offerRepository.findOne({
      where: { id: savedLote.id },
      relations: ["tipo", "unidade"],
    });

    if (!fullLote) {
      throw new NotFoundException(
        `Lote criado mas não encontrado após criação`,
      );
    }

    // Salvar formas de pagamento se fornecidas
    if (
      createDto.payment_method_ids &&
      createDto.payment_method_ids.length > 0
    ) {
      const paymentMethodValues = createDto.payment_method_ids
        .map((pmId) => `(${savedLote.id}, ${pmId})`)
        .join(", ");

      await this.offerRepository.query(`
        INSERT INTO tb_lote_forma_pagamento (offer_id, forma_pagamento_id)
        VALUES ${paymentMethodValues}
        ON CONFLICT DO NOTHING
      `);
    }

    const result = {
      id: fullLote.id,
      title: fullLote.title,
      description: fullLote.description,
      preco: fullLote.preco,
      quantidade: fullLote.quantidade,
      quantidade_vendida: fullLote.quantidade_vendida,
      location: fullLote.location
        ? {
            latitude: parseFloat(fullLote.location.split(",")[0]),
            longitude: parseFloat(fullLote.location.split(",")[1]),
          }
        : null,
      address: fullLote.formatted_address
        ? {
            formattedAddress: fullLote.formatted_address,
            placeId: fullLote.place_id || "",
            latitude: fullLote.location
              ? parseFloat(fullLote.location.split(",")[0])
              : 0,
            longitude: fullLote.location
              ? parseFloat(fullLote.location.split(",")[1])
              : 0,
            geocodingAccuracy: fullLote.geocoding_accuracy || "APPROXIMATE",
          }
        : null,
      locationLayers: this.buildLocationLayers(fullLote),
      tipo: fullLote.tipo
        ? { id: fullLote.tipo.id, nome: fullLote.tipo.nome }
        : null,
      unidade: fullLote.unidade
        ? { id: fullLote.unidade.id, nome: fullLote.unidade.nome }
        : null,
      fotos,
      created_at: fullLote.created_at,
      updated_at: fullLote.updated_at,
    };
    logger.log(
      `create - User: ${userId} - Lote created successfully with ID: ${fullLote.id}`,
    );
    return result;
  }

  async findAll(query: SearchOffersDto, userId: number | null) {
    const logger = new Logger(OfferService.name);
    logger.log(
      `findAll - User: ${userId || "anonymous"} - Query: ${JSON.stringify(query)}`,
    );
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const queryBuilder = this.offerRepository
      .createQueryBuilder("offer")
      .select([
        "offer.id",
        "offer.title",
        "offer.description",
        "offer.preco",
        "offer.quantidade",
        "offer.quantidade_vendida",
        "offer.location",
        "offer.formatted_address",
        "offer.place_id",
        "offer.geocoding_accuracy",
        "offer.city_name",
        "offer.city_location_raw",
        "offer.neighborhood_name",
        "offer.neighborhood_location_raw",
        "offer.created_at",
        "offer.tipo_id",
        "offer.unidade_id",
        "offer.fornecedor_id",
      ])
      .addSelect("ST_X(offer.location_geog::geometry)", "longitude")
      .addSelect("ST_Y(offer.location_geog::geometry)", "latitude")
      .leftJoinAndSelect("offer.tipo", "tipo")
      .leftJoinAndSelect("offer.unidade", "unidade")
      .leftJoinAndSelect("offer.fornecedor", "fornecedor")
      .leftJoinAndSelect("offer.fotos", "fotos")
      .leftJoin("tb_transacao", "t", "t.offer_id = offer.id")
      .where("t.id IS NULL") // Apenas lotes sem transação (disponíveis para venda)
      .andWhere("offer.quantidade_vendida = 0"); // Salvaguarda adicional: apenas lotes não vendidos

    // Text search
    if (query.search) {
      queryBuilder.andWhere("offer.title ILIKE :search", {
        search: `%${query.search}%`,
      });
    }

    // Geospatial filters
    if (query.bounds) {
      // Bounding box filter: "southWestLat,southWestLng,northEastLat,northEastLng"
      const [swLat, swLng, neLat, neLng] = query.bounds.split(",").map(Number);
      queryBuilder.andWhere(
        `offer.location_geog && ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326)::geography`,
        { swLat, swLng, neLat, neLng },
      );
    } else if (query.near && query.radius) {
      // Radial search: find lotes within radius meters of point
      const [lat, lng] = query.near.split(",").map(Number);
      queryBuilder.andWhere(
        `ST_DWithin(offer.location_geog, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius)`,
        { lat, lng, radius: query.radius },
      );
    }

    queryBuilder.orderBy("offer.created_at", "DESC").skip(skip).take(limit);

    const [lotes, total] = await queryBuilder.getManyAndCount();

    const data = (lotes as OfferWithCoordinates[]).map((offer) => {
      // Extrair coordenadas de location_geog (PostGIS) com fallback para location
      let latitude = 0;
      let longitude = 0;

      // Priorizar coordenadas de location_geog
      if (offer.latitude && offer.longitude) {
        latitude = parseFloat(offer.latitude);
        longitude = parseFloat(offer.longitude);
      } else if (offer.location) {
        // Fallback para location VARCHAR(255)
        const coords = offer.location.split(",");
        if (coords.length === 2) {
          latitude = parseFloat(coords[0]);
          longitude = parseFloat(coords[1]);
        }
      }

      // Validar coordenadas
      const hasValidCoords = this.validateCoordinates(latitude, longitude);

      return {
        id: offer.id,
        nome: offer.title,
        title: offer.title,
        description: offer.description,
        preco: offer.preco,
        quantidade: offer.quantidade,
        quantidade_vendida: offer.quantidade_vendida,
        location: hasValidCoords ? { latitude, longitude } : null,
        address: offer.formatted_address
          ? {
              formattedAddress: offer.formatted_address,
              placeId: offer.place_id || "",
              latitude,
              longitude,
            }
          : null,
        locationLayers: this.buildLocationLayers(offer as OfferEntity),
        tipo: offer.tipo ? { id: offer.tipo.id, nome: offer.tipo.nome } : null,
        unidade: offer.unidade
          ? { id: offer.unidade.id, nome: offer.unidade.nome }
          : null,
        fornecedor: offer.fornecedor
          ? {
              id: offer.fornecedor.id,
              nome: offer.fornecedor.nome,
              avatar_url: `/app/api/fornecedores/${offer.fornecedor.id}/avatar`,
            }
          : null,
        foto_principal:
          offer.fotos && offer.fotos.length > 0
            ? {
                id: offer.fotos[0].id,
                url: `/app/api/fotos/${offer.fotos[0].id}`,
              }
            : null,
        created_at: offer.created_at,
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
    logger.log(
      `findAll - User: ${userId || "anonymous"} - Found ${total} lotes`,
    );
    return result;
  }

  async findOne(id: number, userId?: number) {
    const offer = await this.offerRepository
      .createQueryBuilder("offer")
      .select([
        "offer.id",
        "offer.title",
        "offer.description",
        "offer.preco",
        "offer.quantidade",
        "offer.quantidade_vendida",
        "offer.location",
        "offer.formatted_address",
        "offer.place_id",
        "offer.geocoding_accuracy",
        "offer.city_name",
        "offer.city_location_raw",
        "offer.neighborhood_name",
        "offer.neighborhood_location_raw",
        "offer.approx_location_raw",
        "offer.approx_formatted_address",
        "offer.approx_city_name",
        "offer.approx_city_location_raw",
        "offer.approx_neighborhood_name",
        "offer.approx_neighborhood_location_raw",
        "offer.created_at",
        "offer.updated_at",
        "offer.tipo_id",
        "offer.unidade_id",
        "offer.fornecedor_id",
      ])
      .addSelect("ST_X(offer.location_geog::geometry)", "longitude")
      .addSelect("ST_Y(offer.location_geog::geometry)", "latitude")
      .leftJoinAndSelect("offer.tipo", "tipo")
      .leftJoinAndSelect("offer.unidade", "unidade")
      .leftJoinAndSelect("offer.fornecedor", "fornecedor")
      .leftJoinAndSelect("offer.fotos", "fotos")
      .where("offer.id = :id", { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException(`Oferta com ID ${id} não encontrada`);
    }

    const loteData = offer as OfferWithCoordinates;
    const quantidade_disponivel =
      Number(offer.quantidade) - Number(offer.quantidade_vendida);

    // Verificar se o offer já tem transações (quantidade_vendida > 0)
    const hasTransacao = Number(offer.quantidade_vendida || 0) > 0;

    // Verificar se o usuário logado é fornecedor do offer
    let isUserFornecedor = false;
    if (userId && offer.fornecedor_id) {
      const userFornecedorCheck = await this.offerRepository
        .createQueryBuilder("offer")
        .innerJoin(
          "tb_user_fornecedor",
          "uf",
          "uf.fornecedor_id = offer.fornecedor_id",
        )
        .where("offer.id = :id", { id })
        .andWhere("uf.user_id = :userId", { userId })
        .getCount();

      isUserFornecedor = userFornecedorCheck > 0;
    }

    // Extrair coordenadas de location_geog (PostGIS) com fallback para location
    let latitude = 0;
    let longitude = 0;

    // Priorizar coordenadas de location_geog
    if (loteData.latitude && loteData.longitude) {
      latitude = parseFloat(loteData.latitude);
      longitude = parseFloat(loteData.longitude);
    } else if (offer.location) {
      // Fallback para location VARCHAR(255)
      const coords = offer.location.split(",");
      if (coords.length === 2) {
        latitude = parseFloat(coords[0]);
        longitude = parseFloat(coords[1]);
      }
    }

    // Validar coordenadas
    const hasValidCoords = this.validateCoordinates(latitude, longitude);

    return {
      id: offer.id,
      nome: offer.title,
      title: offer.title,
      description: offer.description,
      preco: offer.preco,
      quantidade: offer.quantidade,
      quantidade_vendida: offer.quantidade_vendida,
      quantidade_disponivel,
      location: hasValidCoords ? { latitude, longitude } : null,
      address: offer.formatted_address
        ? {
            formattedAddress: offer.formatted_address,
            placeId: offer.place_id || "",
            latitude,
            longitude,
            geocodingAccuracy: offer.geocoding_accuracy || "APPROXIMATE",
          }
        : null,
      locationLayers: this.buildLocationLayers(offer as OfferEntity),
      approxLocationLayers: this.buildApproxLocationLayers(
        offer as OfferEntity,
      ),
      approx_formatted_address: offer.approx_formatted_address || null,
      tipo: offer.tipo ? { id: offer.tipo.id, nome: offer.tipo.nome } : null,
      unidade: offer.unidade
        ? { id: offer.unidade.id, nome: offer.unidade.nome }
        : null,
      fornecedor: offer.fornecedor
        ? {
            id: offer.fornecedor.id,
            nome: offer.fornecedor.nome,
            whatsapp: offer.fornecedor.whatsapp,
            avatar_url: `/app/api/fornecedores/${offer.fornecedor.id}/avatar`,
          }
        : null,
      foto_principal:
        offer.fotos && offer.fotos.length > 0
          ? {
              id: offer.fotos[0].id,
              url: `/app/api/fotos/${offer.fotos[0].id}`,
            }
          : null,
      fotos:
        offer.fotos?.map((foto) => ({
          id: foto.id,
          url: `/app/api/fotos/${foto.id}`,
          alt: `${offer.title} - Foto ${foto.id}`,
        })) || [],
      created_at: offer.created_at,
      updated_at: offer.updated_at,
      // Informações adicionais para o front-end
      is_user_fornecedor: isUserFornecedor,
      has_transacao: hasTransacao,
    };
  }

  async updateLocation(
    id: number,
    updateDto: UpdateLocationDto,
    userId: number | null,
  ) {
    const logger = new Logger(OfferService.name);
    logger.log(
      `updateLocation - User: ${userId || "anonymous"} - Offer ID: ${id}`,
    );
    const offer = await this.offerRepository.findOne({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException(`Lote com ID ${id} não encontrado`);
    }

    // Validar place_id com Google Maps API
    let locationData = null;
    let locationLayers = null;
    try {
      locationData = await this.googleMapsService.validatePlaceId(
        updateDto.address.placeId,
      );
      // Extrair camadas de localização (real, bairro, cidade)
      locationLayers =
        this.googleMapsService.extractLocationLayers(locationData);
    } catch (error) {
      // Se a validação falhar, usar dados fornecidos
      locationData = {
        formattedAddress: updateDto.address.formattedAddress,
        placeId: updateDto.address.placeId,
        latitude: updateDto.address.latitude,
        longitude: updateDto.address.longitude,
        accuracy: updateDto.address.geocodingAccuracy || "APPROXIMATE",
      };
    }

    // Atualizar campos de localização
    offer.location = `${locationData.latitude},${locationData.longitude}`;
    offer.formatted_address = locationData.formattedAddress;
    offer.place_id = locationData.placeId;
    offer.geocoding_accuracy = locationData.accuracy;

    // Preencher camadas de localização se disponíveis
    if (locationLayers) {
      offer.neighborhood_name = locationLayers.neighborhood?.label;
      offer.neighborhood_location_raw = locationLayers.neighborhood
        ? `${locationLayers.neighborhood.latitude},${locationLayers.neighborhood.longitude}`
        : undefined;
      offer.city_name = locationLayers.city?.label;
      offer.city_location_raw = locationLayers.city
        ? `${locationLayers.city.latitude},${locationLayers.city.longitude}`
        : undefined;
    }

    await this.offerRepository.save(offer);

    // Atualizar location_geog usando query raw para PostGIS (todas as camadas)
    const updateSet: any = {
      location_geog: () =>
        `ST_SetSRID(ST_MakePoint(${locationData.longitude}, ${locationData.latitude}), 4326)::geography`,
    };

    // Adicionar neighborhood_location_geog se disponível
    if (locationLayers?.neighborhood) {
      const neighLat = locationLayers.neighborhood.latitude;
      const neighLng = locationLayers.neighborhood.longitude;
      updateSet.neighborhood_location_geog = () =>
        `ST_SetSRID(ST_MakePoint(${neighLng}, ${neighLat}), 4326)::geography`;
    }

    // Adicionar city_location_geog se disponível
    if (locationLayers?.city) {
      const cityLat = locationLayers.city.latitude;
      const cityLng = locationLayers.city.longitude;
      updateSet.city_location_geog = () =>
        `ST_SetSRID(ST_MakePoint(${cityLng}, ${cityLat}), 4326)::geography`;
    }

    await this.offerRepository
      .createQueryBuilder()
      .update(OfferEntity)
      .set(updateSet)
      .where("id = :id", { id })
      .execute();

    // Buscar offer atualizado com relacionamentos
    const updatedLote = await this.offerRepository.findOne({
      where: { id },
      relations: ["tipo", "unidade", "fornecedor"],
    });

    if (!updatedLote) {
      throw new NotFoundException(`Lote atualizado mas não encontrado`);
    }

    const result = {
      id: updatedLote.id,
      nome: updatedLote.title,
      address: updatedLote.formatted_address
        ? {
            formattedAddress: updatedLote.formatted_address,
            placeId: updatedLote.place_id || "",
            latitude: parseFloat(updatedLote.location!.split(",")[0]),
            longitude: parseFloat(updatedLote.location!.split(",")[1]),
            geocodingAccuracy: updatedLote.geocoding_accuracy || "APPROXIMATE",
          }
        : null,
      locationLayers: this.buildLocationLayers(updatedLote),
      updated_at: updatedLote.updated_at,
    };
    logger.log(
      `updateLocation - User: ${userId || "anonymous"} - Lote ID: ${id} updated successfully`,
    );
    return result;
  }

  async findByUserId(
    userId: number,
    pagination: { page: number; pageSize: number },
  ) {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    // Buscar lotes vendidos com dados da transação usando getRawAndEntities
    const lotesVendidosResult = await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.tipo", "tipo")
      .leftJoinAndSelect("offer.unidade", "unidade")
      .leftJoinAndSelect("offer.fornecedor", "fornecedor")
      .leftJoinAndSelect("offer.fotos", "fotos")
      .innerJoin(
        "tb_user_fornecedor",
        "uf",
        "uf.fornecedor_id = offer.fornecedor_id",
      )
      .innerJoin("tb_transacao", "t", "t.offer_id = offer.id")
      .leftJoin("t.comprador", "comprador")
      .addSelect(["comprador.id", "comprador.nome"])
      .addSelect("t.id", "transacao_id")
      .addSelect("t.quantidade", "transacao_quantidade")
      .addSelect("t.created_at", "transacao_created_at")
      .where("uf.user_id = :userId", { userId })
      .orderBy("offer.created_at", "DESC")
      .skip(skip)
      .take(pageSize)
      .getRawAndEntities();

    // Buscar ofertas compradas com dados da transação
    const lotesCompradosResult = await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.tipo", "tipo")
      .leftJoinAndSelect("offer.unidade", "unidade")
      .leftJoinAndSelect("offer.fornecedor", "fornecedor")
      .leftJoinAndSelect("offer.fotos", "fotos")
      .innerJoin("tb_transacao", "t", "t.offer_id = offer.id")
      .addSelect("t.id", "transacao_id")
      .addSelect("t.quantidade", "transacao_quantidade")
      .addSelect("t.created_at", "transacao_created_at")
      .innerJoin("tb_user_comprador", "uc", "uc.comprador_id = t.comprador_id")
      .where("uc.user_id = :userId", { userId })
      .orderBy("offer.created_at", "DESC")
      .skip(skip)
      .take(pageSize)
      .getRawAndEntities();

    // Mapear ofertas vendidas com dados de transação dos raw results
    const lotesVendidos = lotesVendidosResult.entities.map((offer, index) => {
      const raw = lotesVendidosResult.raw[index];
      return {
        id: offer.id,
        nome: offer.title,
        title: offer.title,
        description: offer.description,
        preco: offer.preco,
        quantidade: offer.quantidade,
        quantidade_vendida: offer.quantidade_vendida,
        locationLayers: this.buildLocationLayers(offer as OfferEntity),
        approx_formatted_address: offer.approx_formatted_address || null,
        fornecedor: offer.fornecedor
          ? {
              id: offer.fornecedor.id,
              nome: offer.fornecedor.nome,
              avatar_url: `/app/api/fornecedores/${offer.fornecedor.id}/avatar`,
            }
          : null,
        comprador: raw.comprador_id
          ? {
              id: raw.comprador_id,
              nome: raw.comprador_nome,
            }
          : null,
        tipo: offer.tipo ? { id: offer.tipo.id, nome: offer.tipo.nome } : null,
        unidade: offer.unidade
          ? { id: offer.unidade.id, nome: offer.unidade.nome }
          : null,
        foto_principal:
          offer.fotos && offer.fotos.length > 0
            ? {
                id: offer.fotos[0].id,
                url: `/app/api/fotos/${offer.fotos[0].id}`,
              }
            : null,
        transacao: {
          id: raw.transacao_id,
          quantidade_negociada: raw.transacao_quantidade,
          data_transacao: raw.transacao_created_at,
        },
        created_at: offer.created_at,
      };
    });

    // Mapear ofertas compradas com dados de transação dos raw results
    const lotesComprados = lotesCompradosResult.entities.map((offer, index) => {
      const raw = lotesCompradosResult.raw[index];
      return {
        id: offer.id,
        nome: offer.title,
        title: offer.title,
        description: offer.description,
        preco: offer.preco,
        quantidade: offer.quantidade,
        quantidade_vendida: offer.quantidade_vendida,
        locationLayers: this.buildLocationLayers(offer as OfferEntity),
        approx_formatted_address: offer.approx_formatted_address || null,
        fornecedor: offer.fornecedor
          ? {
              id: offer.fornecedor.id,
              nome: offer.fornecedor.nome,
              avatar_url: `/app/api/fornecedores/${offer.fornecedor.id}/avatar`,
            }
          : null,
        tipo: offer.tipo ? { id: offer.tipo.id, nome: offer.tipo.nome } : null,
        unidade: offer.unidade
          ? { id: offer.unidade.id, nome: offer.unidade.nome }
          : null,
        foto_principal:
          offer.fotos && offer.fotos.length > 0
            ? {
                id: offer.fotos[0].id,
                url: `/app/api/fotos/${offer.fotos[0].id}`,
              }
            : null,
        transacao: {
          id: raw.transacao_id,
          quantidade_negociada: raw.transacao_quantidade,
          data_transacao: raw.transacao_created_at,
        },
        created_at: offer.created_at,
      };
    });

    return {
      offersVendidos: lotesVendidos,
      offersComprados: lotesComprados,
      // Legacy aliases for backward compatibility
      lotesVendidos,
      lotesComprados,
      pagination: {
        page,
        pageSize,
        totalItems: lotesVendidos.length + lotesComprados.length,
        totalPages: Math.ceil(
          (lotesVendidos.length + lotesComprados.length) / pageSize,
        ),
      },
    };
  }
}
