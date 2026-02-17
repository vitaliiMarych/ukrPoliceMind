import { MessageRole, MessageStatus } from '@prisma/client';

export class MessageResponseDto {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  imageUrl?: string | null;
  status: MessageStatus;
  createdAt: Date;
}

export class CreateMessageResponseDto {
  userMessageId: string;
  assistantMessageId: string;
  streamUrl: string;
  sessionId: string;
}
