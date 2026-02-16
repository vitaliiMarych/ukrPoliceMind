import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { data: user, isLoading, error } = useCurrentUser();

  console.log('[ProtectedRoute]', {
    isLoading,
    hasUser: !!user,
    error: error?.message,
    requireAdmin,
    userRole: user?.role,
  });

  if (isLoading) {
    console.log('[ProtectedRoute] Loading user data...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );
  }

  if (error || !user) {
    console.log('[ProtectedRoute] No user or error, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (user.isBlocked) {
    console.log('[ProtectedRoute] User is blocked');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Доступ заблоковано</h2>
          <p className="text-gray-600">Ваш обліковий запис було заблоковано адміністратором.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && user.role !== UserRole.ADMIN) {
    console.log('[ProtectedRoute] Admin required but user is not admin, redirecting to /chat');
    return <Navigate to="/chat" replace />;
  }

  console.log('[ProtectedRoute] Access granted');
  return <>{children}</>;
};
