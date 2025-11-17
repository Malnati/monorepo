// app/api/src/modules/onboarding/dto/resend.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendDto {
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;
}
