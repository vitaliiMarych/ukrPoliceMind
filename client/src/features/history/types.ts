import type { Message } from '../chat/types';

export interface ConsultationSession {
  id: string;
  userId: string;
  mode: 'chat' | 'wizard';
  topic?: string | null;
  title: string | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionsListResponse {
  sessions: ConsultationSession[];
  total: number;
  page: number;
  limit: number;
}
