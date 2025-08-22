import express, { Response } from "express";
import { handleMultiAgent, processPrompt } from "../controller/llmController";

const router = express.Router();

router.post("/chat", processPrompt);

router.post("/multi-agent", handleMultiAgent);

export default router;
