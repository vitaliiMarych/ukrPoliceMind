import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { historyApi } from '../api/historyApi';

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
              {session.type === 'chat' ? 'Чат' : 'Майстер'}
            </span>
          </div>
        </div>
      </div>

      {session.type === 'wizard' && session.wizardData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {session.wizardData.templateName}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Відповіді:</h3>
              <div className="space-y-2">
                {Object.entries(session.wizardData.answers).map(([key, value]) => (
                  <div key={key} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-sm font-medium text-gray-700">{key}:</p>
                    <p className="text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Рекомендація:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{session.wizardData.recommendation}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {session.type === 'chat' && (
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
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
