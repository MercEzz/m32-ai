import { Request, Response } from "express";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { llm } from "../llmWrapper";
import { ResearchAgent, ReviewerAgent, WriterAgent } from "../agents";

const processPrompt = async (req: Request, res: Response) => {
  const { userPrompt } = req.body;

  try {
    const response = await llm.invoke([
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage(userPrompt),
    ]);

    res.json({ reply: response.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const handleMultiAgent = async (req: Request, res: Response) => {
  const { query } = req.body;

  try {
    const research = await ResearchAgent(query);
    const draft = await WriterAgent(research as string);
    const review = await ReviewerAgent(draft as string);

    res.json({ research, draft, final: review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Multi-agent workflow failed" });
  }
};

export { processPrompt, handleMultiAgent };
