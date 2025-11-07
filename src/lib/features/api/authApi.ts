import { baseApi, ApiResponse } from "./baseApi";

// Types for Auth API
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send forgot password email
    sendForgotPasswordEmail: builder.mutation<
      ForgotPasswordResponse,
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<ForgotPasswordResponse>) => {
        if (!response.data) {
          throw new Error(
            response.message || "Failed to send forgot password email"
          );
        }
        return response.data;
      },
    }),

    // Reset password with token (verify is done manually with fetch in useEffect)
    resetPassword: builder.mutation<
      ResetPasswordResponse,
      { data: ResetPasswordRequest; token: string }
    >({
      query: ({ data, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        params: { token },
        body: data,
      }),
      transformResponse: (response: ApiResponse<ResetPasswordResponse>) => {
        if (!response.data) {
          throw new Error(response.message || "Failed to reset password");
        }
        return response.data;
      },
    }),
  }),
});

export const { useSendForgotPasswordEmailMutation, useResetPasswordMutation } =
  authApi;
