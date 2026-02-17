import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryPicker } from './CategoryPicker';
import { DynamicForm } from './DynamicForm';
import { MessageList } from '../../chat/components/MessageList';
import { Composer } from '../../chat/components/Composer';
import { wizardApi } from '../api/wizardApi';
import { chatApi } from '../../chat/api/chatApi';
import { useChatStream } from '../../chat/hooks/useChatStream';
import type { WizardCategory } from '../types';
import type { Message } from '../../chat/types';

type WizardPhase = 'category' | 'form' | 'result';

export const WizardPage = () => {
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<WizardPhase>('category');
  const [selectedCategory, setSelectedCategory] = useState<WizardCategory | null>(null);
  const [wizardSessionId, setWizardSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');

  const onMessage = useCallback((content: string) => {
    setStreamingContent((prev) => prev + content);
  }, []);

  const onComplete = useCallback(
    (assistantMessageId: string) => {
      setStreamingContent((currentContent) => {
        if (currentContent && assistantMessageId) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === assistantMessageId)) return prev;
            return [
              ...prev,
              {
                id: assistantMessageId,
                role: 'assistant' as const,
                content: currentContent,
                createdAt: new Date().toISOString(),
              },
            ];
          });
        }
        return '';
      });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    [queryClient],
  );

  const onError = useCallback(
    (error: string) => {
      console.error('[WizardPage] Stream error:', error);
      setStreamingContent('');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    [queryClient],
  );

  const { startStream, isStreaming } = useChatStream({
    onMessage,
    onComplete,
    onError,
  });

  const submitMutation = useMutation({
    mutationFn: wizardApi.submitWizard,
    onSuccess: (result) => {
      setWizardSessionId(result.sessionId);
      setPhase('result');
      startStream(result.assistantMessageId);
    },
  });

  const sendFollowUpMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (response, variables) => {
      const userMessage: Message = {
        id: response.userMessageId,
        role: 'user',
        content: variables.message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      startStream(response.assistantMessageId);
    },
  });

  const handleSelectCategory = (category: WizardCategory) => {
    setSelectedCategory(category);
    setPhase('form');
  };

  const handleSubmitForm = (data: Record<string, string>) => {
    if (selectedCategory) {
      const formattedAnswers = Object.entries(data)
        .filter(([, value]) => value)
        .map(([key, value]) => {
          const field = selectedCategory.schema?.fields.find((f) => f.id === key);
          return `${field?.label || key}: ${value}`;
        })
        .join('\n');

      const userContent = `${selectedCategory.name}\n\n${formattedAnswers}`;
      setMessages([
        {
          id: 'wizard-initial',
          role: 'user',
          content: userContent,
          createdAt: new Date().toISOString(),
        },
      ]);

      submitMutation.mutate({
        categoryId: selectedCategory.id,
        answers: data,
      });
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setPhase('category');
  };

  const handleNewConsultation = () => {
    setPhase('category');
    setSelectedCategory(null);
    setWizardSessionId(null);
    setMessages([]);
    setStreamingContent('');
  };

  const handleFollowUp = (message: string, image?: File) => {
    if (!wizardSessionId) return;
    sendFollowUpMutation.mutate({
      message,
      sessionId: wizardSessionId,
      image,
    });
  };

  if (phase === 'category') {
    return <CategoryPicker onSelectCategory={handleSelectCategory} />;
  }

  if (phase === 'form' && selectedCategory) {
    return (
      <>
        <DynamicForm
          category={selectedCategory}
          onSubmit={handleSubmitForm}
          onBack={handleBack}
          isSubmitting={submitMutation.isPending}
        />
        {submitMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-md">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-2">
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
                <p className="text-lg font-medium text-slate-900">Генерую рекомендації...</p>
                <p className="text-sm text-slate-600 text-center">
                  Це може зайняти декілька секунд
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent">
          {selectedCategory?.name || 'Консультація'}
        </h1>
        <button
          onClick={handleNewConsultation}
          disabled={isStreaming}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Нова консультація</span>
        </button>
      </header>

      <MessageList
        messages={messages}
        streamingContent={streamingContent}
        isLoading={isStreaming || sendFollowUpMutation.isPending}
      />

      <Composer
        onSend={handleFollowUp}
        disabled={isStreaming || sendFollowUpMutation.isPending}
      />
    </div>
  );
};
