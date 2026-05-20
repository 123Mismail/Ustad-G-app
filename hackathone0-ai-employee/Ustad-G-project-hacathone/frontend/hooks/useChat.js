import { useState, useRef } from 'react';
import { createSessionId, sendChatMessage } from '../services/chat.service';

/**
 * Hook to manage AI chat state and API calls.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Persist session ID for the lifetime of this component instance
  const sessionIdRef = useRef(createSessionId());

  const sendMessage = async (text) => {
    if (!text.trim()) return null;

    // Add user message to UI immediately
    const userMsg = { id: Date.now().toString(), text, role: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(sessionIdRef.current, text);
      
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        text: response.reply, 
        role: 'agent',
        agentName: response.agent 
      };
      setMessages((prev) => [...prev, aiMsg]);
      return response;
    } catch (err) {
      console.error('[useChat] Error sending message:', err);
      setError('Failed to send message. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionIdRef.current = createSessionId();
    setError(null);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
    error,
    sessionId: sessionIdRef.current
  };
}
