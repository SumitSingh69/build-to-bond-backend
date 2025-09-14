import { AsyncHandler } from "../middlewares/AsyncHandler.middleware.js";
import Chatroom from "../models/chatRoom.model.js";
import Chat from "../models/chat.model.js";
import { getRecieverSocketId, io } from "../config/socket.config.js";
import { HTTPSTATUS } from "../config/Https.config.js";
import {
  findChatRoomByUserIdsService,
  getAllRoomsOfUserIdService,
  getUnseenMessagesCountService,
  getRoomByIdService,
  getRoomByIdAndUpdateService,
  getChatByIdService,
  getAllChatsByIdService,
  updateManyChatsService,
} from "../services/chat.service.js";
import {
  createNewChatRoomSchema,
  sendMessageSchema,
  getMessagesByChatRoomIdSchema,
} from "../validators/chat.validator.js";
import { findUserByIdService } from "../services/user.service.js";
import {
  incrementChatInitiationRate,
  updateAvgChatLengthService,
} from "../services/userBehaviour.service.js";

export const createNewChatRoom = AsyncHandler(async (req, res) => {
  const body = createNewChatRoomSchema.parse(req.body);
  const userId = req.user?._id;
  const recieverId = body.receiverId;
  if (!recieverId) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Other user ID is required",
    });
  }
  const existingRoom = await findChatRoomByUserIdsService(userId, recieverId);
  if (existingRoom) {
    return res.status(HTTPSTATUS.OK).json({
      message: "Chat room already exists",
      data: existingRoom,
    });
  }

  const newRoom = new Chatroom({
    users: [userId, recieverId],
  });
  await newRoom.save();

  res.status(HTTPSTATUS.CREATED).json({
    message: "New room created",
    roomId: newRoom._id,
  });
});

export const getAllChats = AsyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "UserId missing",
    });
    return;
  }
  const chats = await getAllRoomsOfUserIdService(userId);

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find(
        (id) => id.toString() !== userId.toString()
      );

      const unseenCount = await getUnseenMessagesCountService(userId, chat._id);
      try {
        const result = await findUserByIdService(otherUserId);
        const otherUserData = result.user;

        return {
          chat: {
            ...chat.toObject(),
            lastMessage: chat.lastMessage || null,
            unseenCount: unseenCount,

            currentUser: {
              id: userId.toString(),
              role: "currentUser",
            },
            otherUser: {
              id: otherUserId.toString(),
              firstName: otherUserData?.firstName || "Unknown",
              lastName: otherUserData?.lastName || "User",
              profilePhoto:
                otherUserData?.profilePicture || otherUserData?.avatar || null,
              role: "otherUser",
            },

            profilePhoto:
              otherUserData?.profilePicture || otherUserData?.avatar || null,
            firstName: otherUserData?.firstName || "Unknown",
            lastName: otherUserData?.lastName || "User",
          },
        };
      } catch (error) {
        console.log(error);
        return {
          chat: {
            ...chat.toObject(),
            lastMessage: chat.lastMessage || null,
            unseenCount: unseenCount,

            currentUser: {
              id: userId.toString(),
              role: "currentUser",
            },
            otherUser: {
              id: otherUserId?.toString() || "unknown",
              firstName: "Unknown",
              lastName: "User",
              profilePhoto: null,
              role: "otherUser",
            },

            profilePhoto: null,
            firstName: "Unknown",
            lastName: "User",
          },
        };
      }
    })
  );
  res.json({
    success: true,
    chats: chatWithUserData,
  });
});

export const sendMessage = AsyncHandler(async (req, res) => {
  const body = sendMessageSchema.parse(req.body);
  const senderId = req.user?._id;
  const { roomId, text } = body;
  const imageFile = body?.file;
  if (!senderId) {
    res.status(HTTPSTATUS.UNAUTHORIZED).json({
      message: "unauthorized",
    });
    return;
  }
  if (!roomId) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "roomId Required",
    });
    return;
  }
  if (!text && !imageFile) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Either text or image is required",
    });
    return;
  }

  const chat = await getRoomByIdService(roomId);

  if (!chat) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      message: "Chat not found",
    });
    return;
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  );

  if (!isUserInChat) {
    res.status(HTTPSTATUS.FORBIDDEN).json({
      message: "You are not a participant of this chat",
    });
    return;
  }

  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  );

  if (!otherUserId) {
    res.status(HTTPSTATUS.UNAUTHORIZED).json({
      message: "No other user",
    });
    return;
  }
  if (chat.lastMessage === "") {
    // we are initiating a chat -> increament chat initiation rate
    await incrementChatInitiationRate(senderId);
  }

  const receiverSocketId = getRecieverSocketId(otherUserId.toString());
  let isReceiverInChatRoom = false;

  if (receiverSocketId) {
    const receiverSocket = io.sockets.sockets.get(receiverSocketId);
    if (receiverSocket && receiverSocket.rooms.has(roomId)) {
      isReceiverInChatRoom = true;
    }
  }

  let messageData = {
    roomId: roomId,
    sender: senderId,
    seenStatus: isReceiverInChatRoom,
    seenAt: isReceiverInChatRoom ? new Date() : undefined,
  };

  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };
    messageData.messageType = "image";
    messageData.message = text || "";
  } else {
    messageData.message = text;
    messageData.messageType = "text";
  }
  if (text) {
    // find text length by trimming all the spaces
    const trimmedText = text.trim();
    const textLength = trimmed.length;
    await updateAvgChatLengthService(senderId, textLength);
  }

  const message = new Chat(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "📷 Image" : text;

  await getRoomByIdAndUpdateService(roomId, latestMessageText);
  io.to(roomId).emit("newMessage", savedMessage);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", savedMessage);
  }

  const senderSocketId = getRecieverSocketId(senderId.toString());
  if (senderSocketId) {
    io.to(senderSocketId).emit("newMessage", savedMessage);
  }

  if (isReceiverInChatRoom && senderSocketId) {
    io.to(senderSocketId).emit("messagesSeen", {
      roomId: roomId,
      seenBy: otherUserId,
      messageIds: [savedMessage._id],
    });
  }

  res.status(HTTPSTATUS.CREATED).json({
    message: savedMessage,
    sender: senderId,
  });
});

export const getMessagesByChatRoomId = AsyncHandler(async (req, res) => {
  const params = getMessagesByChatRoomIdSchema.parse(req.params);
  const userId = req.user?._id;
  const roomId = params.roomId;
  if (!userId) {
    res.status(HTTPSTATUS.UNAUTHORIZED).json({
      message: "Unauthorized",
    });
    return;
  }
  if (!roomId) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "roomId Required",
    });
    return;
  }
  const room = await getRoomByIdService(roomId);
  if (!room) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      message: "room not found",
    });
    return;
  }

  const isUserInRoom = room.users.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isUserInRoom) {
    res.status(HTTPSTATUS.FORBIDDEN).json({
      message: "You are not a participant of this chat",
    });
    return;
  }

  const messagesToMarkSeen = await getChatByIdService(userId, roomId);
  await updateManyChatsService(roomId, userId);

  const messages = await getAllChatsByIdService(roomId);

  const otherUserId = room.users.find(
    (id) => id.toString() !== userId.toString()
  );
  try {
    const info = await findUserByIdService(otherUserId);
    const otherUserData = info.user;

    if (!otherUserId) {
      res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No other user",
      });
      return;
    }

    //socket work
    if (messagesToMarkSeen.length > 0) {
      const otherUserSocketId = getRecieverSocketId(otherUserId.toString());
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("messagesSeen", {
          roomId: roomId,
          seenBy: userId,
          messageIds: messagesToMarkSeen.map((msg) => msg._id),
        });
      }
    }

    res.json({
      success: true,
      messages,
      room: {
        id: roomId,
        currentUser: {
          id: userId.toString(),
          role: "currentUser",
        },
        otherUser: {
          id: otherUserId.toString(),
          firstName: otherUserData?.firstName || "Unknown",
          lastName: otherUserData?.lastName || "User",
          profilePicture:
            otherUserData?.profilePicture || otherUserData?.avatar || null,
          role: "otherUser",
        },
      },
      // Legacy field for backward compatibility
      user: otherUserData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      messages,
      room: {
        id: roomId,
        currentUser: {
          id: userId.toString(),
          role: "currentUser",
        },
        otherUser: {
          id: otherUserId?.toString() || "unknown",
          firstName: "Unknown",
          lastName: "User",
          profilePicture: null,
          role: "otherUser",
        },
      },
      // Legacy field for backward compatibility
      user: { _id: otherUserId, firstName: "Unknown", lastName: "User" },
    });
  }
});
