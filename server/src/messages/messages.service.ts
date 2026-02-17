import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Observable, type Subscriber } from 'rxjs';
import { PrismaService } from '../database/prisma.service';
import { LlmService } from '../llm/llm.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateMessageResponseDto, MessageResponseDto } from './dto/message-response.dto';
import { MessageRole, MessageStatus, SessionMode } from '@prisma/client';

export interface StreamEvent {
  event: 'meta' | 'token' | 'done' | 'error';
  data: string;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
  ) {}

  async createMessage(
    sessionId: string | undefined,
    userId: string,
    dto: CreateMessageDto,
    imageUrl?: string,
  ): Promise<CreateMessageResponseDto> {
    let session;

    if (sessionId) {
      session = await this.prisma.consultationSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (session.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
    } else {
      session = await this.prisma.consultationSession.create({
        data: {
          userId,
          mode: SessionMode.chat,
          title: 'Нова консультація',
        },
      });
    }

    const userMessage = await this.prisma.message.create({
      data: {
        sessionId: session.id,
        role: MessageRole.user,
        content: dto.content,
        imageUrl: imageUrl || null,
        status: MessageStatus.done,
      },
    });

    const assistantMessage = await this.prisma.message.create({
      data: {
        sessionId: session.id,
        role: MessageRole.assistant,
        content: '',
        status: MessageStatus.pending,
      },
    });

    return {
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
      streamUrl: `/api/v1/messages/${assistantMessage.id}/stream`,
      sessionId: session.id,
    };
  }

  streamMessage(messageId: string): Observable<StreamEvent> {
    return new Observable((subscriber) => {
      this.processStream(messageId, subscriber);
    });
  }

  private async processStream(messageId: string, subscriber: Subscriber<StreamEvent>) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: {
          session: {
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                where: {
                  status: MessageStatus.done,
                },
              },
            },
          },
        },
      });

      if (!message) {
        subscriber.error(new NotFoundException('Message not found'));
        return;
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.streaming },
      });

      subscriber.next({
        event: 'meta',
        data: JSON.stringify({ messageId, status: 'streaming' }),
      });

      const conversationHistory = message.session.messages
        .filter((msg) => msg.role !== MessageRole.system)
        .map((msg) => ({
          role: msg.role === MessageRole.user ? ('user' as const) : ('assistant' as const),
          content: msg.content,
          imageUrl: msg.imageUrl || undefined,
        }));

      let fullResponse = '';

      for await (const token of this.llmService.streamResponse(
        message.session.id,
        conversationHistory,
      )) {
        fullResponse += token;
        subscriber.next({
          event: 'token',
          data: String(token),
        });
      }

      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content: fullResponse,
          status: MessageStatus.done,
        },
      });

      subscriber.next({
        event: 'done',
        data: JSON.stringify({ messageId, status: 'done' }),
      });

      subscriber.complete();
    } catch (error) {
      this.logger.error('Stream error:', error);

      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.error },
      });

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      subscriber.next({
        event: 'error',
        data: JSON.stringify({ error: errorMessage }),
      });

      subscriber.error(error);
    }
  }

  async getMessages(sessionId: string, userId: string): Promise<MessageResponseDto[]> {
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
