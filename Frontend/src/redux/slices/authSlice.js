// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "access_token";

const initialToken = localStorage.getItem(TOKEN_KEY);

const initialState = {
  user: null,
  token: initialToken || null,
  isAuthenticated: !!initialToken,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart(state) {
      state.loading = true;
    },
    loginSuccess(state, action) {
      const { token, user } = action.payload;
      state.loading = false;
      state.user = user || null;
      state.token = token;
      state.isAuthenticated = true;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    },
    setUser(state, action) {
      state.user = action.payload || null;
    },
    authFailure(state) {
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem(TOKEN_KEY);
      // Clear old localStorage recent views data
      localStorage.removeItem("recent_views_v1");
    },
  },
});

export const {
  authStart,
  loginSuccess,
  setUser,
  authFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
