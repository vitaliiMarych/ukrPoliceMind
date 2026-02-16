import { IsString, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';

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
  schemaJson: Record<string, any>;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateWizardCategoryDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsString()
  icon?: string;

  @IsObject()
  schemaJson?: Record<string, any>;

  @IsBoolean()
  isActive?: boolean;
}

export class SubmitWizardDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsObject()
  @IsNotEmpty()
  answers: Record<string, any>;
}

export class WizardResponseDto {
  sessionId: string;
  assistantMessageId: string;
  streamUrl: string;
}
