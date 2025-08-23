import type { ApiResponse } from "./../../../Server/types/index";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types for API requests/responses
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  sessionId?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

const handleResponse = (response: ApiResponse<UserResponse>) => ({
  id: response.data!.id,
  name: response.data!.name,
  email: response.data!.email,
  createdAt: response.data!.createdAt,
  updatedAt: response.data!.updatedAt,
  sessionId: response.data!.sessionId,
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }),
  endpoints: (builder) => ({
    registerUser: builder.mutation<UserResponse, RegisterRequest>({
      query: (payload) => ({
        url: "signup",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }),
      transformResponse: handleResponse,
    }),
    signInUser: builder.mutation<UserResponse, SignInRequest>({
      query: (payload) => ({
        url: "signin",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }),
      transformResponse: handleResponse,
    }),
    googleSignIn: builder.mutation<UserResponse, { idToken: string }>({
      query: ({ idToken }) => ({
        url: "google-signin",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { idToken },
      }),
      transformResponse: handleResponse,
    }),
    logout: builder.mutation<{ message: string }, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: "logout",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { sessionId },
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useSignInUserMutation,
  useGoogleSignInMutation,
  useLogoutMutation,
} = authApi;
