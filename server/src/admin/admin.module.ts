import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { WizardModule } from '../wizard/wizard.module';

@Module({
  imports: [WizardModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
