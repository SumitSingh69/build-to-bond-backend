import Chatroom from "../models/chatRoom.model.js";
import Chat from "../models/chat.model.js";

export const findChatRoomByUserIdsService = async (userId, recieverId) => {
  try {
    const chatRoom = await Chatroom.findOne({
      users: { $all: [userId, recieverId], $size: 2 },
    });
    return chatRoom;
  } catch (error) {
    throw error;
  }
};

export const getAllRoomsOfUserIdService = async (userId) => {
  try {
    const chatRoom = await Chatroom.find({ users: userId }).sort({
      updatedAt: -1,
    });
    return chatRoom;
  } catch (error) {
    throw error;
  }
};

export const getUnseenMessagesCountService = async (userId, roomId) => {
  try {
    const unseenCount = await Chat.countDocuments({
      roomId: roomId,
      sender: { $ne: userId },
      seenStatus: false,
    });
    return unseenCount;
  } catch (error) {
    throw error;
  }
};

export const getRoomByIdService = async (roomId) => {
  try {
    const room = await Chatroom.findById(roomId);
    return room;
  } catch (error) {
    throw error;
  }
};

export const getRoomByIdAndUpdateService = async (roomId, lastMessageText) => {
  try {
    await Chatroom.findByIdAndUpdate(
      roomId,
      {
        lastMessage: lastMessageText,
        updatedAt: new Date(),
      },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

export const getChatByIdService = async (userId, roomId) => {
  try {
    const messagesToMarkSeen = await Chat.find({
      roomId: roomId,
      sender: { $ne: userId },
      seenStatus: false,
    });
    return messagesToMarkSeen;
  } catch (error) {
    throw error;
  }
};

export const getAllChatsByIdService = async (roomId) => {
  try {
    const messages = await Chat.find({ roomId }).sort({ createdAt: 1 });
    return messages;
  } catch (error) {
    throw error;
  }
};

export const updateManyChatsService = async (roomId, userId) => {
  try {
    await Chat.updateMany(
      {
        roomId: roomId,
        sender: { $ne: userId },
        seenStatus: false,
      },
      {
        seenStatus: true,
        seenAt: new Date(),
      }
    );
  } catch (error) {
    throw error;
  }
};
export const getRecentChatRoomsService = async (userId, sevenDaysAgo) => {
  try {
    const recentChatRooms = await Chatroom.find({
      users: userId,
      updatedAt: { $gte: sevenDaysAgo },
    }).sort({ updatedAt: -1 });
    return recentChatRooms;
  } catch (error) {
    throw error;
  }
};

export const verifyRealConversationService = async (
  roomId,
  user1,
  user2,
  sevenDaysAgo
) => {
  try {
    const distinctSenders = await Chat.distinct("sender", {
      roomId,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Check if both participants have sent messages
    const bothActive =
      distinctSenders.includes(user1.toString()) &&
      distinctSenders.includes(user2.toString());

    return bothActive;
  } catch (error) {
    throw error;
  }
};
