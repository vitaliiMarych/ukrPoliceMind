import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { LoginFormData, RegisterFormData } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/chat', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/chat', { replace: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      navigate('/login');
    },
  });

  return {
    login: (data: LoginFormData) => loginMutation.mutate(data),
    register: (data: RegisterFormData) => registerMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
