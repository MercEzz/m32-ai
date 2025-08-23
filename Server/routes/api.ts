import express, { Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { OAuth2Client } from "google-auth-library";
import { createSession, clearSession } from "../middleware/session";
import {
  CustomRequest,
  TypedCustomRequest,
  ApiResponse,
  UserResponse,
  CreateUserRequest,
  DatabaseStatus,
} from "../types";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// GET /api/status
router.get(
  "/status",
  (
    req: CustomRequest,
    res: Response<
      ApiResponse<{
        version: string;
        timestamp: string;
        database: DatabaseStatus;
      }>
    >
  ) => {
    res.json({
      success: true,
      message: "API is running",
      data: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        database: {
          status:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
          host: mongoose.connection.host || "N/A",
        },
      },
    });
  }
);

// GET /api/users
router.get(
  "/users",
  async (req: CustomRequest, res: Response<ApiResponse<UserResponse[]>>) => {
    try {
      const users = await User.find().select("-__v").sort({ createdAt: -1 });
      res.json({
        success: true,
        count: users.length,
        data: users.map((user: IUser) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch users",
      });
    }
  }
);

// POST /api/signup - User registration
router.post(
  "/signup",
  async (
    req: TypedCustomRequest<CreateUserRequest>,
    res: Response<ApiResponse<UserResponse>>
  ) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: "Name, email and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
        });
      }

      const user = new User({ name, email, password });
      await user.save();

      // Create session for the newly registered user
      const sessionId = createSession(user._id.toString());

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          sessionId: sessionId,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);

      if ((error as any).name === "ValidationError") {
        return res.status(400).json({
          success: false,
          error: (error as any).message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to register user",
      });
    }
    return;
  }
);

// POST /api/signin - User authentication
router.post(
  "/signin",
  async (
    req: TypedCustomRequest<CreateUserRequest>,
    res: Response<ApiResponse<UserResponse>>
  ) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Check password (basic comparison for now)
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Create session for the user
      const sessionId = createSession(user._id.toString());

      res.json({
        success: true,
        message: "User signed in successfully",
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          sessionId: sessionId,
        },
      });
    } catch (error) {
      console.error("Error signing in user:", error);
      res.status(500).json({
        success: false,
        error: "Failed to sign in user",
      });
    }
    return;
  }
);

// POST /api/google-signin - Verify Google ID token and upsert user
router.post(
  "/google-signin",
  async (
    req: TypedCustomRequest<{ idToken: string }>,
    res: Response<ApiResponse<UserResponse>>
  ) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res
          .status(400)
          .json({ success: false, error: "idToken required" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid Google token" });
      }

      const email = payload.email;
      const name = payload.name || email.split("@")[0];

      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({ name, email, password: "" });
        await user.save();
      }

      // Create session for the user
      const sessionId = createSession(user._id.toString());

      res.json({
        success: true,
        message: "Google sign-in successful",
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          sessionId: sessionId,
        },
      });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      res.status(401).json({ success: false, error: "Google sign-in failed" });
    }
    return;
  }
);

// POST /api/logout - Clear user session
router.post(
  "/logout",
  async (
    req: TypedCustomRequest<{ sessionId: string }>,
    res: Response<ApiResponse<{ message: string }>>
  ) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: "Session ID is required",
        });
      }

      clearSession(sessionId);

      res.json({
        success: true,
        message: "Logged out successfully",
        data: { message: "Session cleared" },
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({
        success: false,
        error: "Logout failed",
      });
    }
    return;
  }
);

export default router;
