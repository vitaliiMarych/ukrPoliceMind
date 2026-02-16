import type { Message } from '../chat/types';

export interface ConsultationSession {
  id: string;
  userId: string;
  type: 'chat' | 'wizard';
  title: string;
  messages: Message[];
  wizardData?: {
    templateId: string;
    templateName: string;
    answers: Record<string, string>;
    recommendation: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SessionsListResponse {
  data: ConsultationSession[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
