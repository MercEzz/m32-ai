import { toolRegistry, ToolMetadata } from "./toolRegistry";
import { wikipediaTool } from "./wikipediaTool";
import { calculatorTool, statisticsTool } from "./calculatorTool";

// Import the existing perplexity tool
import { DynamicTool } from "@langchain/core/tools";
import config from "../config";

// Recreate perplexity tool with enhanced metadata
export const perplexitySearchTool = new DynamicTool({
  name: "perplexity_search",
  description: "Fetch up-to-date, web-grounded answers via Perplexity AI.",
  func: async (query: string) => {
    console.log("Perplexity tool called with query:", query);
    console.log("Perplexity API key available:", !!config.perplexityKey);

    if (!config.perplexityKey) {
      throw new Error("Perplexity API key not configured");
    }

    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.perplexityKey}`,
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful research assistant. Provide comprehensive, factual information with specific details and data when available.",
            },
            { role: "user", content: query },
          ],
          max_tokens: 1000,
          temperature: 0.2,
        }),
      });

      console.log("Perplexity API response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Perplexity API error:", errorText);
        throw new Error(`Perplexity API error: ${res.status} - ${errorText}`);
      }

      const data: any = await res.json();
      console.log("Perplexity API response:", data);

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in Perplexity response");
      }

      return content;
    } catch (error) {
      console.error("Perplexity tool error:", error);
      throw error;
    }
  },
});

// Register all tools with metadata
function initializeTools() {
  // Perplexity tool
  const perplexityMetadata: ToolMetadata = {
    name: "perplexity_search",
    description: "Fetch up-to-date, web-grounded answers via Perplexity AI.",
    category: "search",
    priority: 10,
    keywords: [
      "search",
      "web",
      "current",
      "news",
      "recent",
      "online",
      "internet",
    ],
    fallbackTools: ["wikipedia_search"],
  };

  // Wikipedia tool
  const wikipediaMetadata: ToolMetadata = {
    name: "wikipedia_search",
    description:
      "Search Wikipedia for structured knowledge and encyclopedic information.",
    category: "knowledge",
    priority: 8,
    keywords: [
      "wikipedia",
      "definition",
      "explain",
      "encyclopedia",
      "knowledge",
      "facts",
    ],
    fallbackTools: ["perplexity_search"],
  };

  // Calculator tool
  const calculatorMetadata: ToolMetadata = {
    name: "calculator",
    description:
      "Perform mathematical calculations and numerical computations.",
    category: "computation",
    priority: 9,
    keywords: [
      "calculate",
      "math",
      "compute",
      "arithmetic",
      "equation",
      "formula",
    ],
    fallbackTools: [],
  };

  // Statistics tool
  const statisticsMetadata: ToolMetadata = {
    name: "statistics",
    description: "Calculate statistical measures for datasets.",
    category: "computation",
    priority: 7,
    keywords: ["statistics", "mean", "median", "average", "data", "analysis"],
    fallbackTools: ["calculator"],
  };

  // Register all tools
  toolRegistry.registerTool(perplexitySearchTool, perplexityMetadata);
  toolRegistry.registerTool(wikipediaTool, wikipediaMetadata);
  toolRegistry.registerTool(calculatorTool, calculatorMetadata);
  toolRegistry.registerTool(statisticsTool, statisticsMetadata);
}

// Initialize tools on module load
initializeTools();

export { toolRegistry };
export { queryAnalyzer } from "./queryAnalyzer";
export * from "./toolRegistry";
export * from "./wikipediaTool";
export * from "./calculatorTool";
export * from "./queryAnalyzer";
