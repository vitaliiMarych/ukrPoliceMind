import { Controller, Post, Get, Param, Body, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessagesService, StreamEvent } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateMessageResponseDto, MessageResponseDto } from './dto/message-response.dto';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

interface SseEvent {
  data: string;
  event?: string;
}

@Controller()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('sessions/:sessionId/messages')
  async createMessage(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateMessageDto,
  ): Promise<CreateMessageResponseDto> {
    return this.messagesService.createMessage(sessionId, user.userId, dto);
  }

  @Get('sessions/:sessionId/messages')
  async getMessages(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<MessageResponseDto[]> {
    return this.messagesService.getMessages(sessionId, user.userId);
  }

  @Public()
  @Sse('messages/:messageId/stream')
  streamMessage(@Param('messageId') messageId: string): Observable<SseEvent> {
    return this.messagesService.streamMessage(messageId).pipe(
      map((event: StreamEvent) => ({
        event: event.event,
        data: event.data,
      })),
    );
  }
}
