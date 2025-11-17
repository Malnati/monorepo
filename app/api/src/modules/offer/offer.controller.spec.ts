// app/api/src/modules/offer/offer.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { CreateOfferDto, SearchOffersDto, UpdateLocationDto } from './offer.dto';

describe('OfferController', () => {
  let controller: OfferController;
  let service: OfferService;

  const mockOfferService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    updateLocation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        {
          provide: OfferService,
          useValue: mockOfferService,
        },
      ],
    }).compile();

    controller = module.get<OfferController>(OfferController);
    service = module.get<OfferService>(OfferService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an offer', async () => {
      const createDto: CreateOfferDto = {
        title: 'Test Offer',
        description: 'Test Description',
        preco: 100,
        quantidade: 10,
        tipo_id: 1,
        unidade_id: 1,
      };

      const mockResult = {
        id: 1,
        ...createDto,
        quantidade_vendida: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockOfferService.create.mockResolvedValue(mockResult);

      const req = { user: { sub: 1 } };
      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createDto, 1);
    });
  });

  describe('findAll', () => {
    it('should return paginated offers', async () => {
      const query: SearchOffersDto = {
        page: 1,
        limit: 12,
      };

      const mockResult = {
        data: [
          {
            id: 1,
            title: 'Offer 1',
            description: 'Description 1',
            preco: 100,
            quantidade: 10,
          },
        ],
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          total_pages: 1,
        },
      };

      mockOfferService.findAll.mockResolvedValue(mockResult);

      const req = { user: { sub: 1 } };
      const result = await controller.findAll(query, req);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(query, 1);
    });
  });

  describe('findOne', () => {
    it('should return a single offer', async () => {
      const mockResult = {
        id: 1,
        title: 'Offer 1',
        description: 'Description 1',
        preco: 100,
        quantidade: 10,
        quantidade_vendida: 0,
      };

      mockOfferService.findOne.mockResolvedValue(mockResult);

      const req = { user: { sub: 1 } };
      const result = await controller.findOne('1', req);

      expect(result).toEqual(mockResult);
      expect(service.findOne).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('findMyOffers', () => {
    it('should return user offers with default pagination', async () => {
      const mockResult = {
        lotesVendidos: [],
        lotesComprados: [],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 0,
        },
      };

      mockOfferService.findByUserId.mockResolvedValue(mockResult);

      const req = { user: { sub: 1 } };
      const result = await controller.findMyOffers(req);

      expect(result).toEqual(mockResult);
      expect(service.findByUserId).toHaveBeenCalledWith(1, {
        page: 1,
        pageSize: 20,
      });
    });

    it('should return user offers with custom pagination', async () => {
      const mockResult = {
        lotesVendidos: [],
        lotesComprados: [],
        pagination: {
          page: 2,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };

      mockOfferService.findByUserId.mockResolvedValue(mockResult);

      const req = { user: { sub: 1 } };
      const result = await controller.findMyOffers(req, '2', '10');

      expect(result).toEqual(mockResult);
      expect(service.findByUserId).toHaveBeenCalledWith(1, {
        page: 2,
        pageSize: 10,
      });
    });
  });

  describe('updateLocation', () => {
    it('should update offer location', async () => {
      const updateDto: UpdateLocationDto = {
        address: {
          formattedAddress: 'Test Address',
          placeId: 'test-place-id',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      };

      const mockResult = {
        id: 1,
        nome: 'Test Offer',
        address: updateDto.address,
        updated_at: new Date(),
      };

      mockOfferService.updateLocation.mockResolvedValue(mockResult);

      const req = { user: { sub: 1 } };
      const result = await controller.updateLocation('1', updateDto, req);

      expect(result).toEqual(mockResult);
      expect(service.updateLocation).toHaveBeenCalledWith(1, updateDto, 1);
    });
  });
});
