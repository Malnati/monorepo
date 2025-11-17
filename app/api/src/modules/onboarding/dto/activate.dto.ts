// app/api/src/modules/onboarding/dto/activate.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ActivateDto {
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString({ message: 'Token deve ser texto' })
  token!: string;
}
