import { apiClient } from '../../../shared/api/client';
import type { PaginationParams } from '../../../shared/types';
import type { ConsultationSession, SessionsListResponse } from '../types';

export const historyApi = {
  getSessions: async (params?: PaginationParams): Promise<SessionsListResponse> => {
    const response = await apiClient.get<SessionsListResponse>('/history/sessions', {
      params,
    });
    return response.data;
  },

  getSession: async (sessionId: string): Promise<ConsultationSession> => {
    const response = await apiClient.get<ConsultationSession>(`/history/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/history/sessions/${sessionId}`);
  },
};
