import { MessageRole, MessageStatus } from '@prisma/client';

export class MessageResponseDto {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: Date;
}

export class CreateMessageResponseDto {
  userMessageId: string;
  assistantMessageId: string;
  streamUrl: string;
}
