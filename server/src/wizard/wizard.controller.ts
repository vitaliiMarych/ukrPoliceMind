import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WizardService } from './wizard.service';
import { SubmitWizardDto, WizardResponseDto } from './dto/wizard.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

interface WizardCategoryResponse {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  schema: Record<string, unknown> | null;
}

@Controller('wizard')
export class WizardController {
  constructor(private wizardService: WizardService) {}

  @Get('categories')
  async getCategories(): Promise<WizardCategoryResponse[]> {
    const categories = await this.wizardService.getCategories();
    return categories.map((cat) => this.toResponse(cat));
  }

  @Get('categories/:id')
  async getCategory(@Param('id') id: string): Promise<WizardCategoryResponse> {
    const category = await this.wizardService.getCategory(id);
    return this.toResponse(category);
  }

  @Post('submit')
  async submitWizard(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitWizardDto,
  ): Promise<WizardResponseDto> {
    return this.wizardService.submitWizard(user.userId, dto);
  }

  private toResponse(cat: { id: string; title: string; description: string; icon: string | null; schemaJson: string | null }): WizardCategoryResponse {
    return {
      id: cat.id,
      name: cat.title,
      description: cat.description,
      icon: cat.icon,
      schema: cat.schemaJson ? JSON.parse(cat.schemaJson) : null,
    };
  }
}
