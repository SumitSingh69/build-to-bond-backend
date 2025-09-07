import mongoose from "mongoose";
import { maxLength } from "zod";
import { _enum, _max } from "zod/v4/core";

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxLength: 500,
    },
    imageUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    seenStatus: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
    deliveredStatus: {
      type: _enum(["sending", "sent", "delivered", "failed"]),
    },
    messageType: {
      type: _enum(["text", "image", "audio"]),
      default: "text",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatroom",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ sender: 1, reciever: -1 });
chatSchema.index({ roomId: 1, createdAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
