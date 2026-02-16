import { apiClient } from '../../../shared/api/client';
import type { ChatSession, SendMessageRequest, SendMessageResponse } from '../types';

export const chatApi = {
  getCurrentSession: async (): Promise<ChatSession | null> => {
    const response = await apiClient.get<ChatSession>('/chat/current');
    return response.data;
  },

  createSession: async (): Promise<ChatSession> => {
    const response = await apiClient.post<ChatSession>('/chat/sessions');
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>('/chat/message', data);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
    return response.data;
  },
};
