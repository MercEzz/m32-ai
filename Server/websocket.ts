import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export interface StatusUpdate {
  type: 'status' | 'progress' | 'result' | 'error';
  message: string;
  stage?: string;
  progress?: number;
  sessionId?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private sessionSockets: Map<string, string> = new Map(); // sessionId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Associate socket with session
      socket.on('join-session', (sessionId: string) => {
        this.sessionSockets.set(sessionId, socket.id);
        socket.join(`session-${sessionId}`);
        console.log(`Socket ${socket.id} joined session ${sessionId}`);
      });

      socket.on('disconnect', () => {
        // Remove socket from session mapping
        for (const [sessionId, socketId] of this.sessionSockets.entries()) {
          if (socketId === socket.id) {
            this.sessionSockets.delete(sessionId);
            break;
          }
        }
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Send status update to specific session
  emitToSession(sessionId: string, update: StatusUpdate) {
    this.io.to(`session-${sessionId}`).emit('status-update', {
      ...update,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Send status update to all connected clients
  emitToAll(update: StatusUpdate) {
    this.io.emit('status-update', {
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  // Convenience methods for different status types
  emitThinking(sessionId: string, message: string = "Thinking...") {
    this.emitToSession(sessionId, {
      type: 'status',
      message,
      stage: 'thinking'
    });
  }

  emitResearching(sessionId: string, message: string = "Researching...") {
    this.emitToSession(sessionId, {
      type: 'status',
      message,
      stage: 'researching'
    });
  }

  emitWriting(sessionId: string, message: string = "Writing draft...") {
    this.emitToSession(sessionId, {
      type: 'status',
      message,
      stage: 'writing'
    });
  }

  emitReviewing(sessionId: string, message: string = "Reviewing content...") {
    this.emitToSession(sessionId, {
      type: 'status',
      message,
      stage: 'reviewing'
    });
  }

  emitProgress(sessionId: string, progress: number, message: string) {
    this.emitToSession(sessionId, {
      type: 'progress',
      message,
      progress
    });
  }

  emitResult(sessionId: string, message: string = "Complete!") {
    this.emitToSession(sessionId, {
      type: 'result',
      message,
      stage: 'complete'
    });
  }

  emitError(sessionId: string, message: string) {
    this.emitToSession(sessionId, {
      type: 'error',
      message,
      stage: 'error'
    });
  }
}

let wsManager: WebSocketManager | null = null;

export const initializeWebSocket = (server: HTTPServer): WebSocketManager => {
  wsManager = new WebSocketManager(server);
  return wsManager;
};

export const getWebSocketManager = (): WebSocketManager => {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return wsManager;
};
