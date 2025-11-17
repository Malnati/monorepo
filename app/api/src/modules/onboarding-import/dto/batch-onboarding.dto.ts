// app/api/src/modules/onboarding-import/dto/batch-onboarding.dto.ts

import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  cep!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;
}

class ConsentDto {
  @IsBoolean()
  terms!: boolean;

  @IsBoolean()
  authorization!: boolean;
}

export class CreateOnboardingUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  document!: string;

  @IsString()
  @IsNotEmpty()
  birthDate!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsString()
  @IsNotEmpty()
  userType!: 'PF' | 'PJ';

  @ValidateNested()
  @Type(() => ConsentDto)
  @IsOptional()
  consent?: ConsentDto;
}

export class BatchOnboardingDto {
  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOnboardingUserDto)
  users!: CreateOnboardingUserDto[];
}
