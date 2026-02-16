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
      // refreshToken is stored in httpOnly cookie by the server
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/chat', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      // refreshToken is stored in httpOnly cookie by the server
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

  const login = (data: LoginFormData) => loginMutation.mutate(data);
  const register = (data: RegisterFormData) => registerMutation.mutate(data);
  const logout = () => logoutMutation.mutate();

  const isAuthenticated = !!localStorage.getItem('accessToken');

  return {
    login,
    register,
    logout,
    isAuthenticated,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
