import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "./llmWrapper";

export async function ResearchAgent(query: string) {
  const res = await llm.invoke([
    new SystemMessage("You are a research assistant. Collect key insights."),
    new HumanMessage(query),
  ]);
  return res.content;
}

export async function WriterAgent(research: string) {
  const res = await llm.invoke([
    new SystemMessage("You are a technical writer. Write a clear explanation."),
    new HumanMessage(`Here is the research:\n${research}`),
  ]);
  return res.content;
}

export async function ReviewerAgent(draft: string) {
  const res = await llm.invoke([
    new SystemMessage(
      "You are a senior reviewer. Improve clarity and correctness."
    ),
    new HumanMessage(`Here is the draft:\n${draft}`),
  ]);
  return res.content;
}
