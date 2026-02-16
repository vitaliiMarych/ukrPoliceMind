import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../database/prisma.service';
import { LlmService } from '../llm/llm.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateMessageResponseDto, MessageResponseDto } from './dto/message-response.dto';
import { MessageRole, MessageStatus } from '@prisma/client';

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
    sessionId: string,
    userId: string,
    dto: CreateMessageDto,
  ): Promise<CreateMessageResponseDto> {
    // Verify session belongs to user
    const session = await this.prisma.consultationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Create user message
    const userMessage = await this.prisma.message.create({
      data: {
        sessionId,
        role: MessageRole.user,
        content: dto.content,
        status: MessageStatus.done,
      },
    });

    // Create assistant placeholder
    const assistantMessage = await this.prisma.message.create({
      data: {
        sessionId,
        role: MessageRole.assistant,
        content: '',
        status: MessageStatus.pending,
      },
    });

    return {
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
      streamUrl: `/api/v1/messages/${assistantMessage.id}/stream`,
    };
  }

  streamMessage(messageId: string): Observable<StreamEvent> {
    return new Observable((subscriber) => {
      this.processStream(messageId, subscriber);
    });
  }

  private async processStream(messageId: string, subscriber: any) {
    try {
      // Get message and validate
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

      // Update status to streaming
      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.streaming },
      });

      // Send meta event
      subscriber.next({
        event: 'meta',
        data: JSON.stringify({ messageId, status: 'streaming' }),
      });

      // Format messages for LLM
      const conversationHistory = message.session.messages
        .filter((msg) => msg.role !== MessageRole.system)
        .map((msg) => ({
          role: msg.role === MessageRole.user ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Get the last user message
      const lastUserMessage =
        conversationHistory[conversationHistory.length - 1]?.content || '';

      conversationHistory.push({
        role: 'user',
        content: lastUserMessage,
      });

      // Stream LLM response
      let fullResponse = '';

      for await (const token of this.llmService.streamResponse(
        message.session.id,
        conversationHistory as any,
      )) {
        fullResponse += token;
        subscriber.next({
          event: 'token',
          data: token,
        });
      }

      // Update message with final content
      await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content: fullResponse,
          status: MessageStatus.done,
        },
      });

      // Send done event
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

      subscriber.next({
        event: 'error',
        data: JSON.stringify({ error: error.message }),
      });

      subscriber.error(error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
