import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    user1:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    user2:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt:{
        type: Date,
        required: true,
        Default: Date.now,
    },
    updatedAt:{
        type: Date,
    },
    totalRoomDuration: {
        type: Number,
        default: 0, 
    },
    lastMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
    lastSeen:{
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
chatRoomSchema.index({lastMessage: -1, createdAt: -1});

const Chatroom = mongoose.model("ChatRoom", chatRoomSchema);
export default Chatroom;