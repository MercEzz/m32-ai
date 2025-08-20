import express, { Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import {
  CustomRequest,
  TypedCustomRequest,
  ApiResponse,
  UserResponse,
  CreateUserRequest,
  DatabaseStatus,
} from "../types";

const router = express.Router();

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
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required",
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

      const user = new User({ email, password });
      await user.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
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

      res.json({
        success: true,
        message: "User signed in successfully",
        data: {
          id: user._id.toString(),
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
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

export default router;
