// User and Auth Types
export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  avatar?: string | null;
  yearOfBirth?: number | null;
  city?: string | null;
  school?: string | null;
  phone?: string | null;
  facebook?: string | null;
  status?: string | null;
  role: 'user' | 'admin' | 'teacher'; // Keep required for backward compatibility
  roles?: Array<{
    id: number;
    name: 'user' | 'admin' | 'teacher';
    displayName: string;
  }>; // Add roles array from backend
  point: number;
  googleId?: string | null;
  activeKey: boolean;
  key?: string | null;
  lastLogin?: Date | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}