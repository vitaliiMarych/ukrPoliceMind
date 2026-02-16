import { Module } from '@nestjs/common';
import { WizardController } from './wizard.controller';
import { WizardService } from './wizard.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [LlmModule],
  controllers: [WizardController],
  providers: [WizardService],
  exports: [WizardService],
})
export class WizardModule {}
