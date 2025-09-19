import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '@/lib/services/authService';
import {
  AuthState,
  LoginCredentials,
  ApiError,
} from '@/lib/types/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Async thunks
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.me();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue({
          message: response.message || 'Failed to get current user',
        } as ApiError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue({
        message: errorMessage,
      } as ApiError);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const loginResponse = await authService.login(credentials);
      if (loginResponse.success) {
        // After successful login, get user info
        const meResponse = await authService.me();
        if (meResponse.success && meResponse.data) {
          return meResponse.data;
        } else {
          return rejectWithValue({
            message: meResponse.message || 'Failed to get user info',
          } as ApiError);
        }
      } else {
        return rejectWithValue({
          message: loginResponse.message || 'Login failed',
        } as ApiError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue({
        message: errorMessage,
      } as ApiError);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue({
        message: errorMessage,
      } as ApiError);
    }
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue({
          message: response.message || 'Token refresh failed',
        } as ApiError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      return rejectWithValue({
        message: errorMessage,
      } as ApiError);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      // Cookies will be cleared by backend on logout API call
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        // Don't set error for getCurrentUser rejection like TYHH MUI
        // This prevents infinite loops on initial load
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = (action.payload as ApiError).message;
      })

      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        // Even if logout API fails, clear the auth state
        state.user = null;
        state.isAuthenticated = false;
        state.error = (action.payload as ApiError).message;
      })

      // Refresh Token
      .addCase(refreshAuthToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = (action.payload as ApiError).message;
      });
  },
});

export const { clearError, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
