import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  totalRoomDuration: {
    type: Number,
    default: 0,
  },
  lastMessage: {
    type: String,
    default: "",
  },
  lastSeen: {
    type: Date,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockedTimeDuration: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

//indexing

chatRoomSchema.index({ user1: 1, user2: 1 });
chatRoomSchema.index({ lastMessage: -1, createdAt: -1 });

const Chatroom = mongoose.model("ChatRoom", chatRoomSchema);
export default Chatroom;
