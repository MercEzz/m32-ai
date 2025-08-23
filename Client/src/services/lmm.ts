import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface MultiAgentResponse {
  research: string;
  draft: string;
  final: string;
}

export interface ChatResponse {
  reply: string;
}

export const llmApi = createApi({
  reducerPath: "llmApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:3000/api/llm/",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const sessionId = state.auth.sessionId;
      
      headers.set("Content-Type", "application/json");
      if (sessionId) {
        headers.set("x-session-id", sessionId);
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    multiAgent: builder.mutation<MultiAgentResponse, { query: string }>({
      query: (body) => ({
        url: "multi-agent",
        method: "POST",
        body,
      }),
    }),
    chat: builder.mutation<ChatResponse, { userPrompt: string }>({
      query: (body) => ({
        url: "chat",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useMultiAgentMutation, useChatMutation } = llmApi;
