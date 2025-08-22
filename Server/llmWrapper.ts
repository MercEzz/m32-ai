import { ChatOpenAI } from "@langchain/openai";
import config from "./config";

export const llm = new ChatOpenAI({
  openAIApiKey: config.openAIKey,
  modelName: "gpt-4o-mini", // or gpt-4o, gpt-3.5-turbo
  temperature: 0.7,
});
