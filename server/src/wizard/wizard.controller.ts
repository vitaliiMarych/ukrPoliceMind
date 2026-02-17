import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WizardService } from './wizard.service';
import { SubmitWizardDto, WizardResponseDto } from './dto/wizard.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('wizard')
export class WizardController {
  constructor(private wizardService: WizardService) {}

  @Get('categories')
  async getCategories() {
    console.log('[WizardController] Getting categories');
    const categories = await this.wizardService.getCategories();
    console.log('[WizardController] Found categories:', categories.length);

    // Transform to frontend format
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.title,
      description: cat.description,
      icon: cat.icon,
      schema: cat.schemaJson ? JSON.parse(cat.schemaJson) : null,
    }));
  }

  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    console.log('[WizardController] Getting category:', id);
    const category = await this.wizardService.getCategory(id);

    return {
      id: category.id,
      name: category.title,
      description: category.description,
      icon: category.icon,
      schema: category.schemaJson ? JSON.parse(category.schemaJson) : null,
    };
  }

  @Post('submit')
  async submitWizard(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitWizardDto,
  ): Promise<WizardResponseDto> {
    console.log('[WizardController] Submitting wizard:', {
      userId: user.userId,
      categoryId: dto.categoryId,
    });
    return this.wizardService.submitWizard(user.userId, dto);
  }
}
