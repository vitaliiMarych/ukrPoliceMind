import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Некоректна email адреса'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z.object({
  email: z.string().email('Некоректна email адреса'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
  firstName: z.string().min(2, "Ім'я має бути не менше 2 символів"),
  lastName: z.string().min(2, 'Прізвище має бути не менше 2 символів'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
