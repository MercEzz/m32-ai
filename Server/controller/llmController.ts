import { Request, Response } from "express";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { llm } from "../llmWrapper";
import { ResearchAgent, ReviewerAgent, WriterAgent, AdvancedResearchAgent } from "../agents";
import { toolRegistry } from "../tools";
import { AuthenticatedRequest } from "../middleware/session";
import { getWebSocketManager } from "../websocket";

const processPrompt = async (req: AuthenticatedRequest, res: Response) => {
  const { userPrompt } = req.body;

  try {
    // Create personalized system message based on user context
    let systemMessage = "You are a helpful assistant.";
    if (req.user) {
      systemMessage = `You are a helpful assistant. The user you're talking to is ${req.user.name} (${req.user.email}). Remember their name and use it when appropriate.`;
    }

    const response = await llm.invoke([
      new SystemMessage(systemMessage),
      new HumanMessage(userPrompt),
    ]);

    res.json({ reply: response.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const handleMultiAgent = async (req: AuthenticatedRequest, res: Response) => {
  const { query } = req.body;
  const sessionId = req.headers['x-session-id'] as string;

  try {
    const wsManager = getWebSocketManager();
    
    console.log('Multi-agent query:', query);
    
    // Step 1: Research
    wsManager.emitResearching(sessionId, "Searching for information...");
    const research = await ResearchAgent(query, req.user);
    console.log('Research result:', research);
    
    // Step 2: Writing
    wsManager.emitWriting(sessionId, "Creating structured content...");
    const draft = await WriterAgent(research as string, req.user);
    console.log('Draft result:', draft);
    
    // Step 3: Reviewing
    wsManager.emitReviewing(sessionId, "Reviewing and improving...");
    const review = await ReviewerAgent(draft as string, req.user);
    console.log('Review result:', review);

    // Complete
    wsManager.emitResult(sessionId, "Research complete!");

    res.json({ 
      query,
      research, 
      draft, 
      final: review,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Multi-agent error:', err);
    if (sessionId) {
      const wsManager = getWebSocketManager();
      wsManager.emitError(sessionId, "Research failed. Please try again.");
    }
    res.status(500).json({ error: "Multi-agent workflow failed" });
  }
};

// New enhanced multi-tool endpoint
const handleAdvancedResearch = async (req: Request, res: Response) => {
  const { query, options = {} } = req.body;

  try {
    const result = await AdvancedResearchAgent(query, options);
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Advanced research error:', err);
    res.status(500).json({ 
      success: false, 
      error: "Advanced research failed",
      details: err instanceof Error ? err.message : String(err)
    });
  }
};

// Tool management endpoints
const getAvailableTools = async (req: Request, res: Response) => {
  try {
    const tools = toolRegistry.getAllTools();
    const toolInfo = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      metadata: toolRegistry.getToolMetadata(tool.name)
    }));
    
    res.json({ tools: toolInfo });
  } catch (err) {
    console.error('Get tools error:', err);
    res.status(500).json({ error: "Failed to retrieve tools" });
  }
};

const clearToolCache = async (req: Request, res: Response) => {
  try {
    toolRegistry.clearCache();
    res.json({ success: true, message: "Tool cache cleared" });
  } catch (err) {
    console.error('Clear cache error:', err);
    res.status(500).json({ error: "Failed to clear cache" });
  }
};

export { 
  processPrompt, 
  handleMultiAgent, 
  handleAdvancedResearch, 
  getAvailableTools, 
  clearToolCache 
};
