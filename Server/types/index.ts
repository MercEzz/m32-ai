import { Request } from "express";
import { Types } from "mongoose";

// Extend Express Request interface for custom properties
export interface CustomRequest extends Request {
  user?: any; // Add user property for authentication later
}

// Generic CustomRequest for typed body
export interface TypedCustomRequest<T = any> extends Request {
  user?: any;
  body: T;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

export interface UserResponse {
  id: string | Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface DatabaseStatus {
  status: "connected" | "disconnected";
  host: string;
}

// Error interfaces
export interface ValidationError {
  name: string;
  message: string;
}

export interface ServerError extends Error {
  status?: number;
}
