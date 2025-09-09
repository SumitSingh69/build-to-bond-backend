import express from "express";
import {
  createNewChatRoom,
  getAllChats,
  getMessagesByChatRoomId,
  sendMessage,
} from "../controllers/chat.controller.js";

import { IsAuthenticated } from "../middlewares/Auth.middleware.js";

const router = express.Router();

router.use(IsAuthenticated); // Apply authentication middleware to all routes below

//chat management
router.post("/new", createNewChatRoom);
router.get("/all", getAllChats);
router.post("/message", sendMessage);
router.get("/message/:roomId", getMessagesByChatRoomId);

export default router;

//68bfe58c51057a5675f2f0f5
