import { authApi } from "@/services/auth";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface authState {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

const initialState: authState = {
  email: "",
  name: "",
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<authState>) => {
      const { payload } = action;
      state.email = payload.email;
      state.name = payload.name;
      state.isAuthenticated = true;
    },
    signup: (
      state,
      action: PayloadAction<Pick<authState, "email" | "name">>
    ) => {
      const { email, name } = action.payload;
      state.email = email;
      state.name = name;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.email = "";
      state.name = "";
      state.isAuthenticated = false;
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      authApi.endpoints.registerUser.matchFulfilled,
      (state, { payload }) => {
        state.email = payload.email;
        state.name = payload.name;
        state.isAuthenticated = true;
      }
    );
    builder.addMatcher(
      authApi.endpoints.signInUser.matchFulfilled,
      (state, { payload }) => {
        state.email = payload.email;
        state.name = payload.name;
        state.isAuthenticated = true;
      }
    );
  },
});

export const { login, signup, logout } = authSlice.actions;
export default authSlice.reducer;
