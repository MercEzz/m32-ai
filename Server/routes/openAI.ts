import { CustomRequest, ApiResponse } from "./../types";
import express, { Response } from "express";
import OpenAI from "openai";
import config from "../config";

const client = new OpenAI({
  apiKey: config.openAIKey,
});

const router = express.Router();

// Regular chat completion route
router.post("/chat", async (req: CustomRequest, res: Response) => {
  try {
    const { messages, model = "gpt-3.5-turbo" } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: "Messages array is required",
      });
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 1000,
    });

    res.json({
      success: true,
      data: completion.choices[0]?.message?.content || "",
    });
  } catch (error) {
    console.error("Chat completion error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate response",
    });
    3;
  }
  return;
});

// Streaming chat completion route
router.post("/chat/stream", async (req: CustomRequest, res: Response) => {
  try {
    const { messages, model = "gpt-3.5-turbo" } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: "Messages array is required",
      });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 1000,
      stream: true,
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error("Streaming chat error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate streaming response",
    });
  }
  return;
});

// Simple prompt route (non-streaming)
router.post("/prompt", async (req: CustomRequest, res: Response) => {
  try {
    const { prompt, model = "gpt-3.5-turbo" } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required",
      });
    }

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
    });

    res.json({
      success: true,
      data: completion.choices[0]?.message?.content || "",
    });
  } catch (error) {
    console.error("Prompt completion error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate response",
    });
  }
  return;
});

export default router;
