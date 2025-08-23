import express from "express";
import { 
  handleMultiAgent, 
  processPrompt, 
  handleAdvancedResearch, 
  getAvailableTools, 
  clearToolCache 
} from "../controller/llmController";
import { sessionMiddleware } from "../middleware/session";

const router = express.Router();

// Apply session middleware to all LLM routes
router.use(sessionMiddleware);

// Basic endpoints
router.post("/chat", processPrompt);
router.post("/multi-agent", handleMultiAgent);

// Enhanced multi-tool endpoints
router.post("/advanced-research", handleAdvancedResearch);
router.get("/tools", getAvailableTools);
router.post("/tools/clear-cache", clearToolCache);

export default router;
