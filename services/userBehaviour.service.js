import UserBehaviour from "../models/userBehaviour.model.js";
import mongoose from "mongoose";
export const incrementChatInitiationRate = async (userId) => {
  try {
    await UserBehaviour.findOneAndUpdate(
      { userId },
      { $inc: { chatInitiationRate: 1 } },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};
export const getPendingFeedbacksService = async (userId) => {
  try {
    console.log(userId);
    const userBehaviour = await UserBehaviour.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    }).populate("feedbackTo", "firstName lastName email profilePicture");

    console.log(userBehaviour.feedbackTo[0]);
    if (!userBehaviour) {
      return {
        pendingFeedback: false,
        feedbackTo: [],
      };
    }

    if (userBehaviour.feedbackPending) {
      return {
        pendingFeedback: true,
        feedbackTo: userBehaviour.feedbackTo || [],
      };
    } else {
      return {
        pendingFeedback: false,
        feedbackTo: [],
      };
    }
  } catch (error) {
    throw error;
  }
};

export const updateAvgChatLengthService = async (senderId, textLength) => {
  try {
    await UserBehaviour.updateOne(
      { userId: senderId },
      {
        $inc: {
          "avgChatLength.sum": textLength,
          "avgChatLength.count": 1,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};
export const updateFeedbackScoreService = async (userId, score) => {
  try {
    for (const { userId: targetUserId, rating } of feedbacks) {
      await UserBehaviour.updateOne(
        { userId: targetUserId },
        { $set: { [`feedbackScore.${userId}`]: rating } }, // save rating from this user
        { upsert: true }
      );
    }

    // ✅ Mark feedback as submitted for this user
    await UserBehaviour.updateOne(
      { userId },
      {
        $set: { feedbackPending: false },
        $pull: { feedbackTo: { $in: feedbacks.map((f) => f.userId) } },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Feedbacks submitted successfully",
    });
  } catch (error) {
    throw error;
  }
};
