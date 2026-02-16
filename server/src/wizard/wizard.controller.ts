import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WizardService } from './wizard.service';
import { SubmitWizardDto, WizardResponseDto } from './dto/wizard.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('wizard')
export class WizardController {
  constructor(private wizardService: WizardService) {}

  @Get('categories')
  async getCategories() {
    return this.wizardService.getCategories();
  }

  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    return this.wizardService.getCategory(id);
  }

  @Post('submit')
  async submitWizard(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitWizardDto,
  ): Promise<WizardResponseDto> {
    return this.wizardService.submitWizard(user.userId, dto);
  }
}
