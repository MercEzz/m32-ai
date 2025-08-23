import { Request, Response, NextFunction } from "express";
import User from "../models/User";

// Extend Request interface to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Simple session store (in production, use Redis or similar)
const sessionStore = new Map<string, { userId: string; expires: number }>();

// Middleware to extract user from session
export const sessionMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (sessionId) {
      const session = sessionStore.get(sessionId);
      
      if (session && session.expires > Date.now()) {
        // Session is valid, fetch user data
        const user = await User.findById(session.userId);
        if (user) {
          req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        }
      } else if (session) {
        // Session expired, clean up
        sessionStore.delete(sessionId);
      }
    }
    
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    next();
  }
};

// Create a new session
export const createSession = (userId: string): string => {
  const sessionId = generateSessionId();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  sessionStore.set(sessionId, { userId, expires });
  return sessionId;
};

// Generate unique session ID
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Clear session
export const clearSession = (sessionId: string): void => {
  sessionStore.delete(sessionId);
};
