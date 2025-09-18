import httpRequest from "@/lib/utils/httpRequest";
import { 
  LoginCredentials, 
  RegisterCredentials, 
  User, 
  ApiResponse 
} from "@/lib/types/auth";

const authService = {
  me: async (): Promise<ApiResponse<User>> => {
    return await httpRequest.get<User>("/auth/me");
  },

  login: async (loginInfo: LoginCredentials): Promise<ApiResponse<User>> => {
    return await httpRequest.post<User>("/auth/login", loginInfo);
  },

  googleLogin: async (token: string): Promise<ApiResponse<User>> => {
    return await httpRequest.post<User>("/auth/google", { token });
  },

  logout: async (): Promise<ApiResponse> => {
    try {
      return await httpRequest.post("/auth/logout");
    } catch (error) {
      console.error("Logout service error:", error);
      return { success: true, message: "Logout completed" };
    }
  },

  register: async (
    registerInfo: RegisterCredentials, 
    config?: Record<string, unknown>
  ): Promise<ApiResponse<User>> => {
    return await httpRequest.post<User>("/auth/register", registerInfo, config);
  },

  refreshToken: async (): Promise<ApiResponse<User>> => {
    return await httpRequest.post<User>("/auth/refresh-token", {});
  },
};

export default authService;
