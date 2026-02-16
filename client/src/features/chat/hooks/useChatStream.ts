import { useState, useCallback, useRef } from 'react';

interface UseChatStreamOptions {
  onMessage: (content: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export const useChatStream = ({ onMessage, onComplete, onError }: UseChatStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(
    (sessionId: string, messageId: string) => {
      setIsStreaming(true);
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

      const eventSource = new EventSource(
        `${baseUrl}/chat/stream/${sessionId}/${messageId}?token=${token}`
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'chunk') {
            onMessage(data.content);
          } else if (data.type === 'done') {
            eventSource.close();
            setIsStreaming(false);
            onComplete();
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        eventSource.close();
        setIsStreaming(false);
        onError(new Error('Stream connection error'));
      };
    },
    [onMessage, onComplete, onError]
  );

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return {
    startStream,
    stopStream,
    isStreaming,
  };
};
