import { apiClient } from '../../../shared/api/client';
import type { PaginationParams, PaginatedResponse } from '../../../shared/types';
import type { AdminStats, AdminUser, AdminSession, UpdateUserRequest } from '../types';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<AdminStats>('/admin/stats');
    return response.data;
  },

  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', {
      params,
    });
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUser>(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  getSessions: async (params?: PaginationParams): Promise<PaginatedResponse<AdminSession>> => {
    const response = await apiClient.get<PaginatedResponse<AdminSession>>('/admin/sessions', {
      params,
    });
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/admin/sessions/${sessionId}`);
  },
};
