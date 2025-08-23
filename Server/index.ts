import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import config from "./config";
import apiRoutes from "./routes/api";
import llmRoutes from "./routes/llm";
import connectDB from "./database/connection";
import { initializeWebSocket } from "./websocket";

const app = express();
const server = createServer(app);

// Initialize WebSocket
const wsManager = initializeWebSocket(server);

// Make WebSocket manager available globally
app.set("wsManager", wsManager);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Routes
app.use("/api", apiRoutes);
app.use("/api/llm", llmRoutes);

app.get("/", (req, res) => {
  res.json({ message: "M32 AI Server is running!" });
});

const PORT = config.port || 3000;

// Connect to database and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`WebSocket server initialized`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
