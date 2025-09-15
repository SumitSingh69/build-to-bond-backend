import cron from "node-cron";

import UserBehaviour from "../models/userBehaviour.model.js";
import { updateDueBehavioursService } from "../services/userBehaviour.service.js";
import {
  getRecentChatRoomsService,
  verifyRealConversationService,
} from "../services/chat.service.js";

// Run once every day at 10 AM
cron.schedule("0 10 * * *", async () => {
  console.log("⏰ Running feedback reminder cron job...");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await updateDueBehavioursService(sevenDaysAgo);

  const users = await UserBehaviour.find({
    lastFeedbackAskedAt: { $lte: sevenDaysAgo },
  });

  for (const user of users) {
    //get all the chatrooms where he is present && whose last updatedAt is within 7 days
    const recentChatRooms = await getRecentChatRoomsService(
      user.userId,
      sevenDaysAgo
    );
    let feedbackTargets = [];
    // identify the real conversations
    for (const chatRoom of recentChatRooms) {
      // verify that both the users were involved in the conversation
      const isRealConversation = await verifyRealConversationService(
        chatRoom._id,
        chatRoom.users[0],
        chatRoom.users[1],
        sevenDaysAgo
      );
      if (isRealConversation) {
        // find the other participant in the chatroom
        const otherUserId = chatRoom.users.find(
          (u) => u.toString() !== user.userId.toString()
        );

        if (otherUserId && !feedbackTargets.includes(otherUserId)) {
          feedbackTargets.push(otherUserId);
        }
      }
    }
    if (feedbackTargets.length > 0) {
      user.feedbackPending = true;
      user.feedbackTo = feedbackTargets;
      user.lastFeedbackAskedAt = new Date();
      await user.save();

      console.log(
        `📧 Feedback reminder prepared for user ${user.userId}, targets: ${feedbackTargets}`
      );
    }
  }
});
