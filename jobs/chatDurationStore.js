import cron from "node-cron";
import UserBehaviour from "../models/UserBehaviour.js";
import {
  getUserChatDurations,
  resetSessions,
} from "../utils/chatSessionUtils.js";
import sessionChatDurations from "../sessions/sessionChatDurations.js";
// Every midnight
cron.schedule("0 0 * * *", async () => {
  console.log("📝 Flushing chat durations to DB...");

  for (const userId in sessionChatDurations) {
    const durations = getUserChatDurations(userId);

    for (const otherUserId in durations) {
      const duration = durations[otherUserId].duration;
      if (duration > 0) {
        await UserBehaviour.updateOne(
          { userId },
          { $inc: { [`chatDurations.${otherUserId}`]: duration } },
          { upsert: true }
        );
      }
    }
  }

  resetSessions();
});
