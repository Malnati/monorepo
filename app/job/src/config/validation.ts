// app/job/src/config/validation.ts

import { plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  APP_JOB_INBOX: string;

  @IsString()
  @IsNotEmpty()
  APP_JOB_PROCESSED: string;

  @IsString()
  @IsNotEmpty()
  APP_JOB_FAILED: string;

  @IsString()
  @IsNotEmpty()
  APP_API_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  APP_API_TOKEN: string;

  @IsNumber()
  APP_JOB_POLL_INTERVAL: number;

  @IsNumber()
  APP_JOB_BATCH_SIZE: number;

  @IsNumber()
  APP_JOB_MAX_RETRIES: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
