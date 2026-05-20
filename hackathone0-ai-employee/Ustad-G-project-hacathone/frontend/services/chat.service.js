/**
 * chat.service.js — AI Agent chat API calls.
 * Wraps POST /v1/chat.
 *
 * The backend uses a session_id to maintain conversation state
 * across multiple messages via ADK InMemorySessionService.
 */
import api from './api';
import { v4 as uuidv4 } from 'uuid'; // install: npx expo install expo-crypto or use uuid pkg

/**
 * Generate a new session ID for a fresh conversation.
 * @returns {string} UUID v4
 */
export function createSessionId() {
  // Use Math.random() as fallback if uuid not installed
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Send a chat message to the AI agent.
 *
 * @param {string} sessionId - Conversation session ID (persist per conversation)
 * @param {string} message   - User's message text
 * @returns {Promise<{ reply: string, agent: string, session_id: string }>}
 */
export async function sendChatMessage(sessionId, message) {
  const response = await api.post('/v1/chat', {
    session_id: sessionId,
    message,
  });
  return response.data;
  // response.data shape: { reply: "...", agent: "DiscoveryAgent", session_id: "..." }
}
