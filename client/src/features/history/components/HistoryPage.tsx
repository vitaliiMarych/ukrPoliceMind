import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { historyApi } from '../api/historyApi';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['sessions', page, limit],
    queryFn: () => historyApi.getSessions({ page, limit }),
  });

  const deleteMutation = useMutation({
    mutationFn: historyApi.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const handleDelete = (sessionId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цю сесію?')) {
      deleteMutation.mutate(sessionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження історії</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Історія консультацій</h1>

      {data?.data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">У вас ще немає консультацій</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.data.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {session.title}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          session.type === 'chat'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {session.type === 'chat' ? 'Чат' : 'Майстер'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(session.createdAt).toLocaleString('uk-UA')}
                    </p>
                    <p className="text-gray-700">
                      {session.messages.length > 0
                        ? session.messages[0].content.substring(0, 150) + '...'
                        : 'Немає повідомлень'}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => navigate(`/history/${session.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Переглянути
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={deleteMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Попередня
              </button>
              <span className="px-4 py-2 text-gray-700">
                Сторінка {page} з {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Наступна
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
