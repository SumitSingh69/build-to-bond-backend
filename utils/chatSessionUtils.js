import { sessionChatDurations } from "../sessions/sessionChatDurations.js";

// Start tracking when user joins a chat
export function startChatSession(userId, otherUserId) {
  if (!sessionChatDurations[userId]) {
    sessionChatDurations[userId] = {};
  }
  if (!sessionChatDurations[userId][otherUserId]) {
    sessionChatDurations[userId][otherUserId] = { duration: 0, lastJoin: null };
  }
  sessionChatDurations[userId][otherUserId].lastJoin = Date.now();
}

// Stop tracking when user leaves chat
export function endChatSession(userId, otherUserId) {
  const session = sessionChatDurations[userId]?.[otherUserId];
  if (session && session.lastJoin) {
    const duration = Math.floor((Date.now() - session.lastJoin) / 1000); // seconds
    session.duration += duration;
    session.lastJoin = null; // reset
  }
}

// Get all durations for a user
export function getUserChatDurations(userId) {
  return sessionChatDurations[userId] || {};
}

// Reset all sessions (after flushing to DB)
export function resetSessions() {
  for (const userId in sessionChatDurations) {
    sessionChatDurations[userId] = {};
  }
}
