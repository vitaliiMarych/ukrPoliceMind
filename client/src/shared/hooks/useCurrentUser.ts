import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { User } from '../types';

export const useCurrentUser = () => {
  const hasToken = !!localStorage.getItem('accessToken');
  console.log('[useCurrentUser] Hook called, hasToken:', hasToken);

  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      console.log('[useCurrentUser] Fetching current user from /auth/me');
      try {
        const response = await apiClient.get<User>('/auth/me');
        console.log('[useCurrentUser] User fetched successfully:', response.data);
        return response.data;
      } catch (error) {
        console.error('[useCurrentUser] Error fetching user:', error);
        throw error;
      }
    },
    enabled: hasToken,
    retry: false,
  });
};
