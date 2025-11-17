// app/api/src/modules/offer/offer.dto.ts
import { IsString, IsNumber, IsOptional, IsArray, Min, MaxLength, ValidateNested, IsObject, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}

export enum GeocodingAccuracy {
  ROOFTOP = 'ROOFTOP',
  RANGE_INTERPOLATED = 'RANGE_INTERPOLATED',
  GEOMETRIC_CENTER = 'GEOMETRIC_CENTER',
  APPROXIMATE = 'APPROXIMATE',
}

export class AddressDto {
  @IsString()
  @MaxLength(255)
  formattedAddress!: string;

  @IsString()
  @MaxLength(64)
  placeId!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsEnum(GeocodingAccuracy)
  geocodingAccuracy?: GeocodingAccuracy;
}

export class LocationLayerDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  @MaxLength(120)
  label!: string;
}

export class LocationLayersDto {
  @IsObject()
  @ValidateNested()
  @Type(() => LocationLayerDto)
  real!: LocationLayerDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationLayerDto)
  neighborhood?: LocationLayerDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationLayerDto)
  city?: LocationLayerDto;
}

export class AddressComponentsDto {
  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  administrative_area_level_2?: string;

  @IsOptional()
  @IsString()
  sublocality?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;
}

export class CreateOfferDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(255)
  description!: string;

  @IsNumber()
  @Min(0)
  preco!: number;

  @IsNumber()
  @Min(0)
  quantidade!: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressString?: string; // Plain text address

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto; // Structured address with place_id

  @IsNumber()
  tipo_id!: number;

  @IsNumber()
  unidade_id!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  payment_method_ids?: number[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  suggestedLocation?: LocationDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  suggestedAddress?: AddressDto;
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preco?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsNumber()
  tipo_id?: number;

  @IsOptional()
  @IsNumber()
  unidade_id?: number;
}

export class SearchOffersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  bounds?: string;

  @IsOptional()
  @IsString()
  near?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  radius?: number;
}

export class UpdateLocationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
