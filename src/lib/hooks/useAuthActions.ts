import { useAuth, useAppDispatch } from '@/lib/hooks/redux';
import { 
  loginUser, 
  logoutUser, 
  clearError, 
  clearAuth,
  refreshAuthToken 
} from '@/lib/features/auth/authSlice';
import { LoginCredentials } from '@/lib/types/auth';

/**
 * Custom hook for authentication operations
 * Provides a clean interface for all auth-related actions
 */
export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  // No initialization logic here - handled by UserProvider like TYHH MUI

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
    logout,
    refreshToken,
    clearError: clearAuthError,
    clearAuth: clearAuthState,
  };
};