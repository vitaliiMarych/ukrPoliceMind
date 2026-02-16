import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { chatApi } from '../api/chatApi';
import { useChatStream } from '../hooks/useChatStream';
import type { Message } from '../types';

export const ChatPage = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');

  const { data: session, isLoading } = useQuery({
    queryKey: ['chatSession', 'current'],
    queryFn: chatApi.getCurrentSession,
  });

  useEffect(() => {
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
    }
  }, [session]);

  const createSessionMutation = useMutation({
    mutationFn: chatApi.createSession,
    onSuccess: (newSession) => {
      setCurrentSessionId(newSession.id);
      setMessages([]);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (response, variables) => {
      const userMessage: Message = {
        id: response.messageId,
        role: 'user',
        content: variables.message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setCurrentSessionId(response.sessionId);
      startStream(response.sessionId, response.messageId);
    },
  });

  const { startStream, isStreaming } = useChatStream({
    onMessage: (content) => {
      setStreamingContent((prev) => prev + content);
    },
    onComplete: () => {
      if (streamingContent) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: streamingContent,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
      }
    },
    onError: (error) => {
      console.error('Stream error:', error);
      setStreamingContent('');
    },
  });

  const handleSendMessage = (message: string) => {
    sendMessageMutation.mutate({
      message,
      sessionId: currentSessionId || undefined,
    });
  };

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Чат-консультація</h1>
        <button
          onClick={handleNewChat}
          disabled={createSessionMutation.isPending || isStreaming}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Новий чат
        </button>
      </header>

      <MessageList messages={messages} streamingContent={streamingContent} />

      <Composer
        onSend={handleSendMessage}
        disabled={sendMessageMutation.isPending || isStreaming}
      />
    </div>
  );
};
