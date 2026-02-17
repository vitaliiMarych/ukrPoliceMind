import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { historyApi } from '../api/historyApi';

const SERVER_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export const SessionView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', id],
    queryFn: () => historyApi.getSession(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження сесії</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/history')}
        className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
      >
        ← Назад до історії
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <p className="text-sm text-gray-600">
              {new Date(session.createdAt).toLocaleString('uk-UA')}
            </p>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {session.mode === 'chat' ? 'Чат' : 'Майстер'}
            </span>
          </div>
        </div>
      </div>

      {session.messages && session.messages.length > 0 && (
        <div className="space-y-4">
          {session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                {message.imageUrl && (
                  <img
                    src={`${SERVER_URL}${message.imageUrl}`}
                    alt="Прикріплене зображення"
                    className="max-w-full max-h-64 rounded-lg mb-2"
                  />
                )}
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content && <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
