import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';

const SERVER_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

const getImageSrc = (imageUrl: string) => {
  if (imageUrl.startsWith('data:')) return imageUrl;
  return `${SERVER_URL}${imageUrl}`;
};

interface MessageListProps {
  messages: Message[];
  streamingContent?: string;
  isLoading?: boolean;
}

export const MessageList = ({ messages, streamingContent, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 min-h-[60vh]">
            <svg
              className="w-14 h-14 text-slate-300 mb-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-600 mb-1">
              Почніть нову розмову
            </h3>
            <p className="text-sm text-slate-500">
              Задайте будь-яке юридичне питання для отримання консультації
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-xl px-5 py-3.5 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={getImageSrc(message.imageUrl)}
                      alt="Прикріплене зображення"
                      className="max-w-full max-h-64 rounded-lg mb-2"
                    />
                  )}
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-slate">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-xl px-5 py-3.5 bg-white text-slate-900 border border-slate-200 shadow-md">
                  <div className="prose prose-sm max-w-none prose-slate">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-2xl rounded-xl px-5 py-3.5 bg-white text-slate-900 border border-slate-200 shadow-md">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-slate-500">Генерую відповідь...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};
