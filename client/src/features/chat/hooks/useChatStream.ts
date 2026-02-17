import { useState, useCallback, useRef } from 'react';

interface UseChatStreamOptions {
  onMessage: (content: string) => void;
  onComplete: (messageId: string) => void;
  onError: (error: Error) => void;
}

interface StreamTokenEvent {
  text?: string;
  status?: 'done' | 'streaming';
}

export const useChatStream = ({ onMessage, onComplete, onError }: UseChatStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(
    (messageId: string) => {
      setIsStreaming(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

      const eventSource = new EventSource(
        `${baseUrl}/messages/${messageId}/stream`,
        { withCredentials: true },
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const parsed: StreamTokenEvent = JSON.parse(event.data);

          if (parsed.text) {
            const decoded = atob(parsed.text);
            onMessage(decodeURIComponent(escape(decoded)));
          } else if (parsed.status === 'done') {
            eventSource.close();
            setIsStreaming(false);
            onComplete(messageId);
          }
        } catch {
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsStreaming(false);
        onError(new Error('Stream connection error'));
      };
    },
    [onMessage, onComplete, onError],
  );

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { startStream, stopStream, isStreaming };
};
