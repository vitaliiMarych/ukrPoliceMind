export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  image?: File;
}

export interface SendMessageResponse {
  sessionId: string;
  userMessageId: string;
  assistantMessageId: string;
  streamUrl: string;
}
