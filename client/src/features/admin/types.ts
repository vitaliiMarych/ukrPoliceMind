import type { User } from '../../shared/types';
import type { ConsultationSession } from '../history/types';

export interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  totalChats: number;
  totalWizards: number;
  activeUsers: number;
}

export interface AdminUser extends User {
  sessionsCount: number;
  lastLoginAt?: string;
}

export interface AdminSession extends ConsultationSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UpdateUserRequest {
  isBlocked?: boolean;
  role?: 'USER' | 'ADMIN';
}
