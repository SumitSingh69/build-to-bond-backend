import { z } from "zod";

export const createNewChatRoomSchema = z.object({
  receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});

export const sendMessageSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
  text: z.string().optional(),
  file: z.any().optional(),
});

export const getMessagesByChatRoomIdSchema = z.object({
  roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId"),
});
