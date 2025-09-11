import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const userSocketMap = {};
export const getRecieverSocketId = (recieverId) => {
  return userSocketMap[recieverId];
};
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }
  io.emit("getOnlineUser", Object.keys(userSocketMap));
  console.log(`User connected: ${socket.id}`);
  if (userId) {
    socket.join(userId);
  }
  socket.on("typing", (data) => {
    console.log(`User ${data.userId} is typing in chat ${data.roomId}`);
    socket.to(data.roomId).emit("userTyping", {
      roomId: data.roomId,
      userId: data.userId,
    });
  });

  socket.on("stopTyping", (data) => {
    console.log(`User ${data.userId} stopped typing in chat ${data.chatId}`);
    socket.to(data.roomId).emit("userStoppedTyping", {
      roomId: data.roomId,
      userId: data.userId,
    });
  });

  socket.on("joinChat", (roomId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined chat room ${roomId}`);
  });

  socket.on("leaveChat", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${userId} left chat room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} removed from online users`);
      io.emit("getOnlineUser", Object.keys(userSocketMap));
    }
  });
  socket.on("connect_error", (error) => {
    console.log("Socket connection Error", error);
  });
});

export { app, server, io };
