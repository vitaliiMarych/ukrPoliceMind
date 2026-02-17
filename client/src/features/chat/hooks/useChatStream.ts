import { useState, useCallback, useRef } from 'react';

interface UseChatStreamOptions {
  onMessage: (content: string) => void;
  onComplete: (messageId: string) => void;
  onError: (error: Error) => void;
}

export const useChatStream = ({ onMessage, onComplete, onError }: UseChatStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback(
    (messageId: string) => {
      setIsStreaming(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

      // EventSource automatically includes cookies, so we don't need to pass token in query
      const eventSource = new EventSource(
        `${baseUrl}/messages/${messageId}/stream`,
        { withCredentials: true }
      );

      eventSourceRef.current = eventSource;

      console.log('[useChatStream] EventSource created for:', `${baseUrl}/messages/${messageId}/stream`);

      // NestJS SSE sends all events as default 'message' events
      // We need to parse the data to determine the event type
      eventSource.onmessage = (event) => {
        console.log('[useChatStream] Received message event:', event);

        try {
          const parsed = JSON.parse(event.data);

          // Check if this is a token event (has 'text' field)
          if (parsed.text) {
            // Decode base64 to UTF-8
            const decoded = atob(parsed.text);
            // Convert to proper UTF-8 string
            const text = decodeURIComponent(escape(decoded));
            console.log('[useChatStream] Decoded token:', text);
            onMessage(text);
          }
          // Check if this is a done event
          else if (parsed.status === 'done') {
            console.log('[useChatStream] Stream done');
            eventSource.close();
            setIsStreaming(false);
            onComplete(messageId);
          }
          // Check if this is a meta event
          else if (parsed.status === 'streaming') {
            console.log('[useChatStream] Stream started');
          }
        } catch (error) {
          console.error('[useChatStream] Error parsing message:', error, 'Data:', event.data);
        }
      };

      eventSource.addEventListener('error', (event) => {
        console.error('Stream error event:', event);
        eventSource.close();
        setIsStreaming(false);
        onError(new Error('Stream error'));
      });

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
