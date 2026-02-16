import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { UserRole } from '../types';

export const Navbar = () => {
  const location = useLocation();
  const { data: user } = useCurrentUser();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              ukrPoliceMind
            </Link>
            {user && (
              <>
                <Link
                  to="/chat"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/chat')
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-800 transition-colors'
                  }`}
                >
                  Чат
                </Link>
                <Link
                  to="/wizard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/wizard')
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-800 transition-colors'
                  }`}
                >
                  Майстер консультацій
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/history')
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-800 transition-colors'
                  }`}
                >
                  Історія
                </Link>
                {user.role === UserRole.ADMIN && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin')
                        ? 'bg-blue-700'
                        : 'hover:bg-blue-800 transition-colors'
                    }`}
                  >
                    Адмін-панель
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-md text-sm font-medium transition-colors"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-blue-800 rounded-md text-sm font-medium transition-colors"
                >
                  Увійти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-md text-sm font-medium transition-colors"
                >
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
