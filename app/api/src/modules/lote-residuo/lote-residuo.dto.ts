// app/api/src/modules/lote-residuo/lote-residuo.dto.ts
/**
 * @deprecated This DTO is deprecated and will be removed in a future version.
 * Please use OfferDto instead.
 * This DTO is kept for backward compatibility with existing UI.
 * Migration guide: docs/rup/99-anexos/MVP/DEPRECATION_NOTICE.md
 */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  ValidateNested,
  IsObject,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export class LocalizacaoDto {
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
  ROOFTOP = "ROOFTOP",
  RANGE_INTERPOLATED = "RANGE_INTERPOLATED",
  GEOMETRIC_CENTER = "GEOMETRIC_CENTER",
  APPROXIMATE = "APPROXIMATE",
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

export class CreateLoteResiduoDto {
  @IsString()
  @MaxLength(100)
  titulo!: string;

  @IsString()
  @MaxLength(255)
  descricao!: string;

  @IsNumber()
  @Min(0)
  preco!: number;

  @IsNumber()
  @Min(0)
  quantidade!: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizacaoDto)
  localizacao?: LocalizacaoDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsNumber()
  tipo_id!: number;

  @IsNumber()
  unidade_id!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[]; // base64 strings

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  payment_method_ids?: number[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizacaoDto)
  suggestedLocation?: LocalizacaoDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  suggestedAddress?: AddressDto;
}

export class SearchLotesDto {
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
  bounds?: string; // Format: "southWestLat,southWestLng,northEastLat,northEastLng"

  @IsOptional()
  @IsString()
  near?: string; // Format: "lat,lng"

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  radius?: number; // Radius in meters for near search
}

export class UpdateLocationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
