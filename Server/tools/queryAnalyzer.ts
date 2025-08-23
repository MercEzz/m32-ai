import { DynamicTool } from "@langchain/core/tools";
import { toolRegistry } from "./toolRegistry";

export interface QueryAnalysis {
  intent: "search" | "knowledge" | "computation" | "analysis" | "mixed";
  confidence: number;
  suggestedTools: string[];
  parallelizable: boolean;
  subQueries?: string[];
}

export class QueryAnalyzer {
  analyzeQuery(query: string): QueryAnalysis {
    const queryLower = query.toLowerCase();
    let intent: QueryAnalysis["intent"] = "search";
    let confidence = 0.5;
    let parallelizable = false;
    const subQueries: string[] = [];

    // Intent detection patterns
    const patterns = {
      search: [
        /what is happening/i,
        /latest news/i,
        /current/i,
        /recent/i,
        /search for/i,
        /find information/i,
        /look up/i,
      ],
      knowledge: [
        /what is/i,
        /define/i,
        /explain/i,
        /tell me about/i,
        /wikipedia/i,
        /definition of/i,
        /meaning of/i,
      ],
      computation: [
        /calculate/i,
        /compute/i,
        /math/i,
        /\d+[\+\-\*\/]\d+/,
        /statistics/i,
        /mean|median|average/i,
        /standard deviation/i,
      ],
      analysis: [/analyze/i, /compare/i, /contrast/i, /evaluate/i, /assess/i],
    };

    // Check for mixed queries (multiple intents)
    const intentCounts = {
      search: 0,
      knowledge: 0,
      computation: 0,
      analysis: 0,
    };

    for (const [intentType, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        if (pattern.test(query)) {
          intentCounts[intentType as keyof typeof intentCounts]++;
        }
      }
    }

    // Determine primary intent
    const maxCount = Math.max(...Object.values(intentCounts));
    const activeIntents = Object.entries(intentCounts)
      .filter(([_, count]) => count > 0)
      .map(([intent, _]) => intent);

    if (activeIntents.length > 1) {
      intent = "mixed";
      parallelizable = true;
      confidence = 0.8;
    } else if (maxCount > 0) {
      intent =
        (Object.entries(intentCounts).find(
          ([_, count]) => count === maxCount
        )?.[0] as QueryAnalysis["intent"]) || "search";
      confidence = Math.min(0.9, 0.6 + maxCount * 0.1);
    }

    // Detect parallelizable queries
    if (
      query.includes(" and ") ||
      query.includes(" also ") ||
      query.includes(" plus ")
    ) {
      parallelizable = true;
      // Split into sub-queries
      const splits = query.split(/ and | also | plus /i);
      subQueries.push(...splits.map((s) => s.trim()));
    }

    // Get suggested tools based on analysis
    const suggestedTools = this.getSuggestedTools(intent, query);

    return {
      intent,
      confidence,
      suggestedTools,
      parallelizable,
      subQueries: subQueries.length > 0 ? subQueries : undefined,
    };
  }

  private getSuggestedTools(
    intent: QueryAnalysis["intent"],
    query: string
  ): string[] {
    const queryLower = query.toLowerCase();

    switch (intent) {
      case "search":
        return ["perplexity_search", "wikipedia_search"];

      case "knowledge":
        return ["wikipedia_search", "perplexity_search"];

      case "computation":
        if (queryLower.includes("statistics") || queryLower.includes("data")) {
          return ["statistics", "calculator"];
        }
        return ["calculator", "statistics"];

      case "analysis":
        return ["perplexity_search", "wikipedia_search", "statistics"];

      case "mixed":
        // Use tool registry's intelligent selection
        return toolRegistry.selectToolsForQuery(query).map((tool) => tool.name);

      default:
        return ["perplexity_search"];
    }
  }

  async executeOptimalStrategy(query: string): Promise<{
    results: Record<string, string>;
    analysis: QueryAnalysis;
    executionTime: number;
  }> {
    const startTime = Date.now();
    const analysis = this.analyzeQuery(query);

    let results: Record<string, string> = {};

    if (analysis.parallelizable && analysis.subQueries) {
      // Execute sub-queries in parallel
      const parallelQueries = analysis.subQueries.map((subQuery, index) => ({
        toolName:
          analysis.suggestedTools[index % analysis.suggestedTools.length],
        input: subQuery,
      }));

      results = await toolRegistry.executeToolsInParallel(parallelQueries);
    } else {
      // Execute primary tools for the main query
      const primaryTool = analysis.suggestedTools[0];
      if (primaryTool) {
        try {
          const result = await toolRegistry.executeToolWithCache(
            primaryTool,
            query
          );
          results[primaryTool] = result;

          // If confidence is low, try a fallback tool
          if (analysis.confidence < 0.7 && analysis.suggestedTools[1]) {
            const fallbackResult = await toolRegistry.executeToolWithCache(
              analysis.suggestedTools[1],
              query
            );
            results[analysis.suggestedTools[1]] = fallbackResult;
          }
        } catch (error: any) {
          results[primaryTool] = `Error: ${error.message}`;
        }
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      results,
      analysis,
      executionTime,
    };
  }
}

export const queryAnalyzer = new QueryAnalyzer();
