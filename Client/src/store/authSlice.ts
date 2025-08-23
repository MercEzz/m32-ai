import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface AuthState {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  sessionId: localStorage.getItem('sessionId'),
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; sessionId: string }>) => {
      state.user = action.payload.user;
      state.sessionId = action.payload.sessionId;
      state.isAuthenticated = true;
      localStorage.setItem('sessionId', action.payload.sessionId);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    clearAuth: (state) => {
      state.user = null;
      state.sessionId = null;
      state.isAuthenticated = false;
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
    },
    initializeAuth: (state) => {
      const sessionId = localStorage.getItem('sessionId');
      const userStr = localStorage.getItem('user');
      
      if (sessionId && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.user = user;
          state.sessionId = sessionId;
          state.isAuthenticated = true;
        } catch {
          // Clear invalid stored data
          localStorage.removeItem('sessionId');
          localStorage.removeItem('user');
        }
      }
    },
  },
});

export const { setAuth, clearAuth, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
