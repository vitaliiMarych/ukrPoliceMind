import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionMode } from '@prisma/client';

export class CreateSessionDto {
  @IsEnum(SessionMode)
  mode: SessionMode;

  @IsOptional()
  @IsString()
  topic?: string;
}
