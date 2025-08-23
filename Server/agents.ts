import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "./llmWrapper";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { toolRegistry, queryAnalyzer } from "./tools";
import { QueryAnalysis } from "./tools/queryAnalyzer";

export async function ResearchAgent(query: string, user?: { id: string; name: string; email: string }) {
  try {
    console.log('ResearchAgent starting with query:', query);
    
    // Directly use perplexity tool for research
    const perplexityTool = toolRegistry.getAllTools().find(t => t.name === 'perplexity_search');
    
    if (!perplexityTool) {
      console.error('Perplexity tool not found');
      return "Research tool unavailable. Please check system configuration.";
    }
    
    console.log('Using perplexity tool directly for research');
    
    try {
      // Call perplexity tool directly
      const researchResult = await perplexityTool.invoke(query);
      console.log('Direct perplexity result:', researchResult);
      
      if (!researchResult || researchResult.includes('No content retrieved')) {
        return "No research data found for this query. Please try rephrasing your question.";
      }
      
      return researchResult;
    } catch (toolError) {
      console.error('Perplexity tool error:', toolError);
      
      // Fallback to agent-based approach
      const selectedTools = [perplexityTool];
      
      let systemPrompt = "You are a research assistant. Use the perplexity_search tool to find current, factual information about the query. Always call the tool first before providing any response.";
      if (user) {
        systemPrompt = `You are a research assistant for ${user.name}. Use the perplexity_search tool to find current, factual information about the query. Always call the tool first before providing any response.`;
      }
      
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
      ]);
      
      const agent = await createOpenAIFunctionsAgent({
        llm,
        tools: selectedTools,
        prompt,
      });

      const executor = new AgentExecutor({
        agent,
        tools: selectedTools,
        verbose: true,
        maxIterations: 2,
      });

      const result = await executor.invoke({ input: query });
      return result.output || "Research completed but no specific data found.";
    }
  } catch (error) {
    console.error('ResearchAgent error:', error);
    return `Research failed: ${error instanceof Error ? error.message : String(error)}. Please try rephrasing your query.`;
  }
}

export async function WriterAgent(research: string, user?: { id: string; name: string; email: string }) {
  try {
    let systemPrompt = "You are a technical writer. Create a clear, well-structured explanation from the research data using proper markdown formatting. " +
      "Use headers (##, ###), bullet points, bold text, and other markdown elements to make the content readable and well-organized. " +
      "Include key points, organize information logically, and make it accessible to the target audience. " +
      "If multiple sources are provided, synthesize them coherently.";
    
    if (user) {
      systemPrompt = `You are a technical writer working for ${user.name}. Create a clear, well-structured explanation from the research data using proper markdown formatting. ` +
        "Use headers (##, ###), bullet points, bold text, and other markdown elements to make the content readable and well-organized. " +
        "Include key points, organize information logically, and make it accessible to the target audience. " +
        "If multiple sources are provided, synthesize them coherently.";
    }

    const res = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Here is the research data to write about:\n${research}`),
    ]);
    return res.content;
  } catch (error) {
    console.error('WriterAgent error:', error);
    return `Writing failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function ReviewerAgent(draft: string, user?: { id: string; name: string; email: string }) {
  try {
    let systemPrompt = "You are a senior technical reviewer. Review the draft and provide ONLY the improved version. " +
      "IMPORTANT: Preserve all markdown formatting (headers, bullet points, bold text, etc.) while improving:\n" +
      "1. Clarity and readability\n" +
      "2. Technical accuracy\n" +
      "3. Logical flow and structure\n" +
      "4. Completeness of information\n" +
      "5. Grammar and style\n" +
      "Return ONLY the final improved content with proper markdown formatting. Do not include review comments or explanations.";
    
    if (user) {
      systemPrompt = `You are a senior technical reviewer working for ${user.name}. Review the draft and provide ONLY the improved version. ` +
        "IMPORTANT: Preserve all markdown formatting (headers, bullet points, bold text, etc.) while improving:\n" +
        "1. Clarity and readability\n" +
        "2. Technical accuracy\n" +
        "3. Logical flow and structure\n" +
        "4. Completeness of information\n" +
        "5. Grammar and style\n" +
        "Return ONLY the final improved content with proper markdown formatting. Do not include review comments or explanations.";
    }

    const res = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Please review and improve this draft, preserving all markdown formatting:\n\n${draft}`),
    ]);
    return res.content;
  } catch (error) {
    console.error('ReviewerAgent error:', error);
    return `Review failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// Enhanced Multi-Agent Research System
// Now uses intelligent tool selection, parallel execution, and comprehensive error handling

export async function AdvancedResearchAgent(query: string, options?: {
  useParallel?: boolean;
  maxTools?: number;
  includeAnalysis?: boolean;
}) {
  const { useParallel = true, maxTools = 3, includeAnalysis = false } = options || {};
  
  try {
    const analysis = queryAnalyzer.analyzeQuery(query);
    
    if (useParallel && analysis.parallelizable) {
      const { results, executionTime } = await queryAnalyzer.executeOptimalStrategy(query);
      
      const response = {
        results,
        metadata: {
          executionTime,
          toolsUsed: Object.keys(results),
          queryAnalysis: includeAnalysis ? analysis : undefined
        }
      };
      
      return response;
    } else {
      // Sequential execution with selected tools
      const tools = toolRegistry.selectToolsForQuery(query).slice(0, maxTools);
      const results: Record<string, string> = {};
      
      for (const tool of tools) {
        try {
          const result = await toolRegistry.executeToolWithCache(tool.name, query);
          results[tool.name] = result;
        } catch (error) {
          results[tool.name] = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      }
      
      return { results, metadata: { toolsUsed: Object.keys(results) } };
    }
  } catch (error) {
    console.error('AdvancedResearchAgent error:', error);
    throw new Error(`Advanced research failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
