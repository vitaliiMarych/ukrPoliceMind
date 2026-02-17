import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [SessionsModule, MessagesModule],
  controllers: [ChatController],
})
export class ChatModule {}
