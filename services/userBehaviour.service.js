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

export const updateAvgChatLengthService = async (userId, chatLength) => {
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
