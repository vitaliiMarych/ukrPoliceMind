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
      console.log('[useAuth] Login success:', { data, hasToken: !!data.accessToken });
      localStorage.setItem('accessToken', data.accessToken);
      console.log('[useAuth] Token saved to localStorage');
      // refreshToken is stored in httpOnly cookie by the server
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      console.log('[useAuth] Navigating to /chat');
      navigate('/chat', { replace: true });
    },
    onError: (error) => {
      console.error('[useAuth] Login error:', error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      console.log('[useAuth] Register success:', { data, hasToken: !!data.accessToken });
      localStorage.setItem('accessToken', data.accessToken);
      console.log('[useAuth] Token saved to localStorage');
      // refreshToken is stored in httpOnly cookie by the server
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      console.log('[useAuth] Navigating to /chat');
      navigate('/chat', { replace: true });
    },
    onError: (error) => {
      console.error('[useAuth] Register error:', error);
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
