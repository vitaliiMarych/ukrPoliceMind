import { IsString, IsBoolean, IsObject, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWizardCategoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsObject()
  schemaJson: Record<string, unknown>;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateWizardCategoryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsObject()
  schemaJson?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SubmitWizardDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}

export class WizardResponseDto {
  sessionId: string;
  assistantMessageId: string;
  streamUrl: string;
}
