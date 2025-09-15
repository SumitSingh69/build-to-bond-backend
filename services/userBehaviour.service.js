import UserBehaviour from "../models/userBehaviour.model.js";
import mongoose from "mongoose";
import { callAIModelService, getClusterService } from "./ai.service.js";
import User from "../models/user.model.js";
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

    console.log("hello" + userBehaviour);
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
export const updateFeedbackScoreService = async (userId, feedbacks) => {
  try {
    for (const { userId, rating } of feedbacks) {
      await UserBehaviour.updateOne(
        { userId: userId },
        {
          $inc: {
            "feedbackScore.sum": rating, // add the new rating to sum
            "feedbackScore.count": 1, // increment count
          },
        },
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

    return {
      message: "Feedbacks submitted successfully",
    };
  } catch (error) {
    throw error;
  }
};
export const updateSearchTypeService = async (userId, score) => {
  try {
    console.log("hello" + userId);
    await UserBehaviour.updateOne(
      { userId }, // filter
      {
        $inc: {
          "searchType.sum": score,
          "searchType.count": 1,
        },
      },
      { upsert: true } // options
    );
  } catch (error) {
    throw error;
  }
};
export const updateDueBehavioursService = async (sevenDaysAgo) => {
  const behaviours = await UserBehaviour.find({
    $or: [{ lastAIUpdate: null }, { lastAIUpdate: { $lte: sevenDaysAgo } }],
  });

  for (const behaviour of behaviours) {
    try {
      const userId = behaviour.userId;
      const aiResponse = await callAIModelService(userId);
      const cluster = await getClusterService(apiResponse);
      console.log("the cluster is " + cluster);
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.clusterNumber = cluster;
      await user.save();
      behaviour.lastAIUpdate = new Date();
      await behaviour.save();

      console.log(`✅ Updated behaviour for user ${behaviour.userId}`);
    } catch (err) {
      console.error(
        `❌ Failed updating behaviour for user ${behaviour.userId}`,
        err
      );
    }
  }

  return;
};
