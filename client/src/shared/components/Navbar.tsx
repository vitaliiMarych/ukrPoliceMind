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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800 via-slate-900 to-blue-900 text-white shadow-2xl border-b-4 border-blue-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <svg
                  className="relative w-10 h-10 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L4 7v10c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5zm0 18.9c-3.2-1.13-6-5.17-6-8.9V8.1l6-3.6 6 3.6v4c0 3.73-2.8 7.77-6 8.9zm-2-6.4l-2.5-2.5L6 13.5 10 17.5l8-8-1.5-1.5L10 14.5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  ukrPoliceMind
                </span>
                <span className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">
                  Правова консультація
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            {user && (
              <div className="flex items-center space-x-2">
                <Link
                  to="/chat"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/chat')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-blue-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                    </svg>
                    <span>Чат</span>
                  </span>
                </Link>

                <Link
                  to="/wizard"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/wizard')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-blue-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Майстер</span>
                  </span>
                </Link>

                <Link
                  to="/history"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/history')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                      : 'text-blue-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Історія</span>
                  </span>
                </Link>

                {user.role === UserRole.ADMIN && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/50 scale-105'
                        : 'text-amber-200 hover:bg-slate-700 hover:text-amber-100'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Адмін</span>
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-blue-300">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Вийти</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 hover:bg-slate-800 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Увійти
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
                >
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    </nav>
  );
};
