import { useEffect } from 'react';
import { useAuth, useAppDispatch } from '@/lib/hooks/redux';
import { 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  registerUser, 
  clearError, 
  clearAuth,
  refreshAuthToken 
} from '@/lib/features/auth/authSlice';
import { LoginCredentials, RegisterCredentials } from '@/lib/types/auth';

/**
 * Custom hook for authentication operations
 * Provides a clean interface for all auth-related actions
 */
export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      // With cookies, check if user exists in session by calling /auth/me
      if (typeof window !== 'undefined' && !auth.user) {
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch {
          // If getting current user fails, try to refresh token
          try {
            await dispatch(refreshAuthToken()).unwrap();
            await dispatch(getCurrentUser()).unwrap();
          } catch {
            // If refresh also fails, clear auth
            dispatch(clearAuth());
          }
        }
      }
    };

    initAuth();
  }, [dispatch, auth.user]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const result = await dispatch(registerUser(credentials)).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Logout failed' 
      };
    }
  };

  const refreshToken = async () => {
    try {
      await dispatch(refreshAuthToken()).unwrap();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      };
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearAuthState = () => {
    dispatch(clearAuth());
  };

  return {
    // State
    ...auth,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    clearError: clearAuthError,
    clearAuth: clearAuthState,
  };
};