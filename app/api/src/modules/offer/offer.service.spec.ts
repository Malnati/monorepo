// app/api/src/modules/offer/offer.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferEntity } from './offer.entity';
import { TipoService } from '../tipo/tipo.service';
import { UnidadeService } from '../unidade/unidade.service';
import { FotosService } from '../fotos/fotos.service';
import { GoogleMapsService } from '../google-maps/google-maps.service';
import { ModerationService } from '../moderation/moderation.service';
import { MailingService } from '../mailing/mailing.service';
import { UserService } from '../user/user.service';

describe('OfferService', () => {
  let service: OfferService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    query: jest.fn(),
    manager: {
      createQueryBuilder: jest.fn(),
    },
  };

  const mockTipoService = {
    findAll: jest.fn(),
  };

  const mockUnidadeService = {
    findAll: jest.fn(),
  };

  const mockFotosService = {
    create: jest.fn(),
  };

  const mockGoogleMapsService = {
    validatePlaceId: jest.fn(),
    extractLocationLayers: jest.fn(),
    generateApproximateLocation: jest.fn(),
  };

  const mockModerationService = {
    checkPublication: jest.fn(),
  };

  const mockMailingService = {
    sendPublicationGuidanceEmail: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        {
          provide: getRepositoryToken(OfferEntity),
          useValue: mockRepository,
        },
        {
          provide: TipoService,
          useValue: mockTipoService,
        },
        {
          provide: UnidadeService,
          useValue: mockUnidadeService,
        },
        {
          provide: FotosService,
          useValue: mockFotosService,
        },
        {
          provide: GoogleMapsService,
          useValue: mockGoogleMapsService,
        },
        {
          provide: ModerationService,
          useValue: mockModerationService,
        },
        {
          provide: MailingService,
          useValue: mockMailingService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException when tipo_id does not exist', async () => {
      mockTipoService.findAll.mockResolvedValue({ data: [] });
      mockUnidadeService.findAll.mockResolvedValue({ data: [] });

      const createDto = {
        title: 'Test Offer',
        description: 'Test Description',
        preco: 100,
        quantidade: 10,
        tipo_id: 999,
        unidade_id: 1,
      };

      await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 1)).rejects.toThrow('Tipo com ID 999 não encontrado');
    });

    it('should throw BadRequestException when unidade_id does not exist', async () => {
      mockTipoService.findAll.mockResolvedValue({
        data: [{ id: 1, nome: 'Tipo Test' }],
      });
      mockUnidadeService.findAll.mockResolvedValue({ data: [] });

      const createDto = {
        title: 'Test Offer',
        description: 'Test Description',
        preco: 100,
        quantidade: 10,
        tipo_id: 1,
        unidade_id: 999,
      };

      await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 1)).rejects.toThrow('Unidade com ID 999 não encontrado');
    });

    it('should throw BadRequestException when user has no fornecedor associated', async () => {
      mockTipoService.findAll.mockResolvedValue({
        data: [{ id: 1, nome: 'Tipo Test' }],
      });
      mockUnidadeService.findAll.mockResolvedValue({
        data: [{ id: 1, nome: 'Unidade Test' }],
      });
      mockModerationService.checkPublication.mockResolvedValue({
        status: 'approved',
      });

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.manager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const createDto = {
        title: 'Test Offer',
        description: 'Test Description',
        preco: 100,
        quantidade: 10,
        tipo_id: 1,
        unidade_id: 1,
      };

      await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 1)).rejects.toThrow(
        'Usuário não possui fornecedor associado',
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when offer does not exist', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999, 1)).rejects.toThrow('Lote com ID 999 não encontrado');
    });
  });

  describe('findAll', () => {
    it('should return paginated offers', async () => {
      const mockOffers = [
        {
          id: 1,
          title: 'Offer 1',
          description: 'Description 1',
          preco: 100,
          quantidade: 10,
          quantidade_vendida: 0,
          location: '-23.5505,-46.6333',
          tipo: { id: 1, nome: 'Tipo 1' },
          unidade: { id: 1, nome: 'Unidade 1' },
          fornecedor: { id: 1, nome: 'Fornecedor 1' },
          fotos: [],
          created_at: new Date(),
          latitude: '-23.5505',
          longitude: '-46.6333',
        },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockOffers, 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({}, 1);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.data[0].title).toBe('Offer 1');
    });
  });

  describe('updateLocation', () => {
    it('should throw NotFoundException when offer does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const updateDto = {
        address: {
          formattedAddress: 'Test Address',
          placeId: 'test-place-id',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      await expect(service.updateLocation(999, updateDto, 1)).rejects.toThrow(NotFoundException);
      await expect(service.updateLocation(999, updateDto, 1)).rejects.toThrow(
        'Lote com ID 999 não encontrado',
      );
    });
  });
});
