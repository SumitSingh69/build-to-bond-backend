import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { app, server } from "./config/socket.config.js";
import { Env } from "./config/env.config.js";
import { AsyncHandler } from "./middlewares/AsyncHandler.middleware.js";
import { HTTPSTATUS } from "./config/Https.config.js";
import { ErrorHandler } from "./middlewares/ErrorHandler.middleware.js";

import DatabaseConnect from "./config/database.config.js";

import UserRoute from "./routes/user.route.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const BASE_PATH = Env.BASE_PATH;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://build-to-bond-frontend.vercel.app",
      "https://*.vercel.app",
      Env.FRONTEND_ORIGIN,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.get(
  "/",
  AsyncHandler(async (req, res, next) => {
    res.status(HTTPSTATUS.OK).json({
      status: "success",
      message: "Backend API is running smoothly",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  })
);

app.use(`${BASE_PATH}/v1/users`, UserRoute);
// app.use(`${BASE_PATH}/v1`, HealthRoute);
// app.use(`${BASE_PATH}/v1/events`, EventRoute);
// app.use(`${BASE_PATH}/v1/teams`, TeamRoute);
// app.use(`${BASE_PATH}/v1/submissions`, SubmissionRoute);
// app.use(`${BASE_PATH}/v1/announcements`, AnnouncementRoute);
// app.use(`${BASE_PATH}/v1/certificates`, CertificateRoute);
// app.use(`${BASE_PATH}/v1/chat`, ChatQnARoute);

app.use(ErrorHandler);

const initializeApp = async () => {
  try {
    await DatabaseConnect();
    console.log(`Database connected in ${Env.NODE_ENV} mode.`);
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

// Initialize database connection
initializeApp();

// For Vercel serverless deployment
if (process.env.NODE_ENV !== "production") {
  const PORT = Env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${Env.NODE_ENV} mode`);
  });
}

export default app;
