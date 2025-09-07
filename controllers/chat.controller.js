import { AsyncHandler } from "../middlewares/AsyncHandler.middleware";
import { Chatroom } from "../models/chatroom.model.js";
import Chat from "../models/chat.model.js";

export const createNewChatRoom = AsyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { otherUserId } = req.body?.recieverId;
  if (!otherUserId) {
    return res.status(400).json({
      message: "Other user ID is required",
    });
  }
  const existingRoom = await Chatroom.findOne({
    members: {
      $or: [
        { user1: userId, user2: otherUserId },
        { user1: otherUserId, user2: userId },
      ],
    },
  });
  if (existingRoom) {
    return res.status(200).json({
      message: "Chat room already exists",
      data: existingRoom,
    });

    const newRoom = new Chatroom({
      user1: userId,
      user2: otherUserId,
    });

    res.status(201).json({
      message: "New room created",
      chatId: newChat._id,
    });
  }
});
