// app/api/src/modules/moderation/dto/check-publication.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CheckPublicationDto {
  @IsString()
  @IsOptional()
  titulo?: string; // Legacy field name for backward compatibility

  @IsString()
  @IsOptional()
  descricao?: string; // Legacy field name for backward compatibility

  @IsString()
  @IsOptional()
  title?: string; // New field name

  @IsString()
  @IsOptional()
  description?: string; // New field name

  @IsString()
  @IsOptional()
  categoria?: string;
}
