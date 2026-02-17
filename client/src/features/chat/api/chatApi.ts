import { apiClient } from '../../../shared/api/client';
import type { ChatSession, SendMessageRequest, SendMessageResponse } from '../types';

export const chatApi = {
  getCurrentSession: async (): Promise<ChatSession | null> => {
    const response = await apiClient.get<ChatSession>('/chat/current');
    return response.data;
  },

  createSession: async (): Promise<ChatSession> => {
    const response = await apiClient.post<ChatSession>('/chat/sessions', {
      mode: 'chat',
    });
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.sessionId) {
      formData.append('sessionId', data.sessionId);
    }
    if (data.image) {
      formData.append('image', data.image);
    }
    const response = await apiClient.post<SendMessageResponse>('/chat/message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
    return response.data;
  },
};
