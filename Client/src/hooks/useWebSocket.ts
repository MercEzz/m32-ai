import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export interface StatusUpdate {
  type: "status" | "progress" | "result" | "error";
  message: string;
  stage?: string;
  progress?: number;
  sessionId?: string;
  timestamp: string;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<StatusUpdate | null>(null);
  const { sessionId } = useSelector((state: RootState) => state.auth);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!sessionId) return;

    const socketInstance = io(
      import.meta.env.VITE_BE_URL || "http://localhost:3000",
      {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
      }
    );

    socketInstance.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Join session room
      socketInstance.emit("join-session", sessionId);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      reconnectAttempts.current++;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        socketInstance.disconnect();
      }
    });

    socketInstance.on("status-update", (update: StatusUpdate) => {
      console.log("Status update received:", update);
      setStatusUpdate(update);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [sessionId]);

  const clearStatus = () => {
    setStatusUpdate(null);
  };

  return {
    socket,
    isConnected,
    statusUpdate,
    clearStatus,
  };
};
