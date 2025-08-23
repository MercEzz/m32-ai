import { DynamicTool } from "@langchain/core/tools";

export interface ToolMetadata {
  name: string;
  description: string;
  category: 'search' | 'knowledge' | 'computation' | 'analysis';
  priority: number;
  keywords: string[];
  fallbackTools?: string[];
}

export interface RegisteredTool {
  tool: DynamicTool;
  metadata: ToolMetadata;
}

export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  registerTool(tool: DynamicTool, metadata: ToolMetadata): void {
    this.tools.set(metadata.name, { tool, metadata });
  }

  getAllTools(): DynamicTool[] {
    return Array.from(this.tools.values()).map(registered => registered.tool);
  }

  getToolsByCategory(category: string): DynamicTool[] {
    return Array.from(this.tools.values())
      .filter(registered => registered.metadata.category === category)
      .map(registered => registered.tool);
  }

  selectToolsForQuery(query: string): DynamicTool[] {
    const queryLower = query.toLowerCase();
    const scoredTools: { tool: DynamicTool; score: number; metadata: ToolMetadata }[] = [];

    for (const [name, registered] of this.tools) {
      let score = 0;
      const { metadata } = registered;

      // Keyword matching
      for (const keyword of metadata.keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Category-based scoring
      if (queryLower.includes('search') || queryLower.includes('find') || queryLower.includes('look up')) {
        if (metadata.category === 'search') score += 15;
      }
      
      if (queryLower.includes('calculate') || queryLower.includes('compute') || /\d+/.test(query)) {
        if (metadata.category === 'computation') score += 15;
      }

      if (queryLower.includes('wikipedia') || queryLower.includes('definition') || queryLower.includes('explain')) {
        if (metadata.category === 'knowledge') score += 15;
      }

      // Priority bonus
      score += metadata.priority;

      if (score > 0) {
        scoredTools.push({ tool: registered.tool, score, metadata });
      }
    }

    // Sort by score and return top tools
    scoredTools.sort((a, b) => b.score - a.score);
    
    // Return top 3 tools or all if less than 3
    return scoredTools.slice(0, 3).map(item => item.tool);
  }

  async executeToolWithCache(toolName: string, input: string): Promise<string> {
    const cacheKey = `${toolName}:${input}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    const registered = this.tools.get(toolName);
    if (!registered) {
      throw new Error(`Tool ${toolName} not found`);
    }

    try {
      const result = await registered.tool.func(input);
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    } catch (error) {
      // Try fallback tools
      const fallbackTools = registered.metadata.fallbackTools || [];
      for (const fallbackName of fallbackTools) {
        try {
          const fallbackTool = this.tools.get(fallbackName);
          if (fallbackTool) {
            const result = await fallbackTool.tool.func(input);
            return result;
          }
        } catch (fallbackError) {
          // Log fallback error but continue to next fallback
          console.warn(`Fallback tool ${fallbackName} failed:`, fallbackError);
          continue;
        }
      }
      throw error;
    }
  }

  async executeToolsInParallel(queries: { toolName: string; input: string }[]): Promise<Record<string, string>> {
    const promises = queries.map(async ({ toolName, input }) => {
      try {
        const result = await this.executeToolWithCache(toolName, input);
        return { toolName, result, error: null };
      } catch (error) {
        return { toolName, result: null, error: error instanceof Error ? error.message : String(error) };
      }
    });

    const results = await Promise.all(promises);
    const output: Record<string, string> = {};

    for (const { toolName, result, error } of results) {
      output[toolName] = error ? `Error: ${error}` : (result || 'No result');
    }

    return output;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getToolMetadata(toolName: string): ToolMetadata | undefined {
    return this.tools.get(toolName)?.metadata;
  }
}

export const toolRegistry = new ToolRegistry();
