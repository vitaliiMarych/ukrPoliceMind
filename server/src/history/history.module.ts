import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  controllers: [HistoryController],
})
export class HistoryModule {}
