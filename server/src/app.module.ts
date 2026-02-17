import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { MessagesModule } from './messages/messages.module';
import { LlmModule } from './llm/llm.module';
import { WizardModule } from './wizard/wizard.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { HistoryModule } from './history/history.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    SessionsModule,
    MessagesModule,
    LlmModule,
    WizardModule,
    AdminModule,
    ChatModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
