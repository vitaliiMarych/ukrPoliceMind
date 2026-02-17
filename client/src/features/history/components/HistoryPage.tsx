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

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-slate-600">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">Помилка завантаження історії</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent mb-8">
        Історія консультацій
      </h1>

      {!data?.sessions || data.sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-slate-200">
          <svg
            className="w-20 h-20 text-slate-300 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xl text-slate-600 font-semibold mb-2">
            У вас ще немає консультацій
          </p>
          <p className="text-slate-500">
            Почніть нову розмову у розділі "Чат" або "Майстер"
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.sessions?.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {session.title || 'Консультація без назви'}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          session.mode === 'chat'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {session.mode === 'chat' ? 'Чат' : 'Майстер'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      {new Date(session.createdAt).toLocaleString('uk-UA')}
                    </p>
                    {session.topic && (
                      <p className="text-slate-700 text-sm">
                        <span className="font-semibold">Тема:</span> {session.topic}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => navigate(`/history/${session.id}`)}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-blue-500/50 transition-all duration-200"
                    >
                      Переглянути
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={deleteMutation.isPending}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-md hover:shadow-red-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                ← Попередня
              </button>
              <span className="px-5 py-2.5 bg-blue-50 text-blue-900 font-semibold rounded-lg border-2 border-blue-200">
                Сторінка {page} з {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2.5 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Наступна →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
