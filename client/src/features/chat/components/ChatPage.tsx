import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { chatApi } from '../api/chatApi';
import { useChatStream } from '../hooks/useChatStream';
import type { Message } from '../types';

export const ChatPage = () => {
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);

  const { data: session, isLoading } = useQuery({
    queryKey: ['chatSession', 'current'],
    queryFn: chatApi.getCurrentSession,
  });

  useEffect(() => {
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages || []);
    }
  }, [session]);

  const createSessionMutation = useMutation({
    mutationFn: chatApi.createSession,
    onSuccess: (newSession) => {
      setCurrentSessionId(newSession.id);
      setMessages([]);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const { startStream, isStreaming } = useChatStream({
    onMessage: (content) => {
      console.log('[ChatPage] onMessage called with:', content);
      setStreamingContent((prev) => {
        const newContent = prev + content;
        console.log('[ChatPage] Updated streaming content length:', newContent.length);
        return newContent;
      });
    },
    onComplete: (assistantMessageId) => {
      console.log('[ChatPage] onComplete called with messageId:', assistantMessageId);
      setStreamingContent((currentContent) => {
        console.log('[ChatPage] Current content on complete:', currentContent);
        if (currentContent && assistantMessageId) {
          // Check if message already exists to prevent duplicates
          setMessages((prev) => {
            const existingMessage = prev?.find((m) => m.id === assistantMessageId);
            if (existingMessage) {
              console.log('[ChatPage] Message already exists, skipping duplicate');
              return prev;
            }
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: 'assistant',
              content: currentContent,
              createdAt: new Date().toISOString(),
            };
            return [...(prev || []), assistantMessage];
          });
        }
        return '';
      });
    },
    onError: (error) => {
      console.error('Stream error:', error);
      setStreamingContent('');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (response, variables) => {
      const userMessage: Message = {
        id: response.userMessageId,
        role: 'user',
        content: variables.message,
        imageUrl: pendingImagePreview,
        createdAt: new Date().toISOString(),
      };
      setPendingImagePreview(null);
      setMessages((prev) => [...(prev || []), userMessage]);
      if (response.sessionId !== currentSessionId) {
        setCurrentSessionId(response.sessionId);
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
      }
      startStream(response.assistantMessageId);
    },
  });

  const handleSendMessage = (message: string, image?: File) => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImagePreview(reader.result as string);
      };
      reader.readAsDataURL(image);
    }

    sendMessageMutation.mutate({
      message,
      sessionId: currentSessionId || undefined,
      image,
    });
  };

  const handleNewChat = () => {
    createSessionMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-slate-600">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
          Чат-консультація
        </h1>
        <button
          onClick={handleNewChat}
          disabled={createSessionMutation.isPending || isStreaming}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Новий чат</span>
        </button>
      </header>

      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        isLoading={sendMessageMutation.isPending || isStreaming}
      />

      <Composer
        onSend={handleSendMessage}
        disabled={sendMessageMutation.isPending || isStreaming}
      />
    </div>
  );
};
