import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Некоректна email адреса'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Некоректна email адреса'),
  password: z.string().min(6, 'Пароль має бути не менше 6 символів'),
  firstName: z.string().min(2, "Ім'я має бути не менше 2 символів").optional(),
  lastName: z.string().min(2, 'Прізвище має бути не менше 2 символів').optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}
