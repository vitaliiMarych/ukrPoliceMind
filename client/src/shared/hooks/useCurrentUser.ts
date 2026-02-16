import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { User } from '../types';

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('accessToken'),
    retry: false,
  });
};
