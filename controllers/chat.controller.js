import { AsyncHandler } from "../middlewares/AsyncHandler.middleware.js";
import Chatroom from "../models/chatroom.model.js";
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
  newRoom.save();

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
      const otherUserId = chat.users.find((id) => id !== userId);

      const unseenCount = await getUnseenMessagesCountService(userId, chat._id);
      try {
        //get the otherUserId's data
        const data = await getAllUsersService(otherUserId);
        console.log(chat);
        // photo , first name , last name , lastMessage
        return {
          chat: {
            ...chat.toObject(),
            lastMessage: chat.lastMessage || null,
            profilePhoto: data?.profilePicture || null,
            firstName: data?.firstName || "Unknown",
            lastName: data?.lastName || "User",
            unseenCount: unseenCount,
          },
        };
      } catch (error) {
        console.log(error);
        return {
          user: { _id: otherUserId, name: "Unknown User" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      }
    })
  );
  res.json({
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
    res.status(HTTPS.UNAUTHORIZED).json({
      message: "No other user",
    });
    return;
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
    (userId) => userId.toString() === userId.toString()
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

  const otherUserId = room.users.find((id) => id !== userId);
  try {
    const info = await findUserByIdService(otherUserId);
    const data = info.user;

    if (!otherUserId) {
      res.status(HTTPS.BAD_REQUEST).json({
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
      messages,
      user: data,
    });
  } catch (error) {
    console.log(error);
    res.json({
      messages,
      user: { _id: otherUserId, name: "Unknown User" },
    });
  }
});
