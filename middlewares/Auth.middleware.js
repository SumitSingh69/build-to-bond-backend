import jwt from "jsonwebtoken";
import { Env } from "../config/env.config.js";
import User from "../models/user.model.js";
import { HTTPSTATUS } from "../config/Https.config.js";

export const IsAuthenticated = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const queryToken = req.query.authorization || req.query.Authorization;

        let token;

        if (authHeader && typeof authHeader === 'string') {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            } else {
                res.status(HTTPSTATUS.UNAUTHORIZED).json({
                    message: "Invalid authorization header format. Use: Bearer <token>",
                    errorCode: "INVALID_AUTH_FORMAT"
                });
                return;
            }
        } else if (queryToken) {
            token = queryToken;
        }
                
        if(!token) {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
                message: "No authorization token provided",
                errorCode: "NO_TOKEN"
            });
            return;
        }

        const decoded = jwt.verify(token, Env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
                message: "Invalid token payload",
                errorCode: "INVALID_TOKEN_PAYLOAD"
            });
            return;
        }

        const userId = decoded.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
                message: "User not found",
                errorCode: "USER_NOT_FOUND"
            });
            return;
        }

        req.user = user;

        next();
    } catch (error) {
        
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
                message: "Invalid or expired token",
                errorCode: "TOKEN_INVALID"
            });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
                message: "Token has expired",
                errorCode: "TOKEN_EXPIRED"
            });
        } else {
            res.status(HTTPSTATUS.UNAUTHORIZED).json({ 
                message: "Authentication failed",
                errorCode: "AUTH_FAILED"
            });
        }
        return;
    }

}