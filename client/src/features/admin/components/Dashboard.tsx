import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { UsersTable } from './UsersTable';
import { SessionsTable } from './SessionsTable';

type TabType = 'stats' | 'users' | 'sessions';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getStats,
  });

  const tabs = [
    { id: 'stats' as TabType, label: 'Статистика' },
    { id: 'users' as TabType, label: 'Користувачі' },
    { id: 'sessions' as TabType, label: 'Сесії' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Панель адміністратора</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'stats' && (
        <div>
          {isLoading && (
            <div className="text-center py-8 text-gray-600">Завантаження статистики...</div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">Помилка завантаження статистики</div>
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Всього користувачів</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Активних користувачів</div>
                <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Всього сесій</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalSessions}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Чат-консультацій</div>
                <div className="text-3xl font-bold text-blue-600">{stats.totalChats}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <div className="text-sm font-medium text-gray-500 mb-2">Майстер-консультацій</div>
                <div className="text-3xl font-bold text-purple-600">{stats.totalWizards}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && <UsersTable />}

      {activeTab === 'sessions' && <SessionsTable />}
    </div>
  );
};
