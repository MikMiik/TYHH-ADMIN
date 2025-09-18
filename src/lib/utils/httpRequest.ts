import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse } from '@/lib/types/auth';

class HttpRequest {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private tokenListeners: (() => void)[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      withCredentials: true, // Enable cookies for cross-origin requests
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - cookies are sent automatically, no need to set Authorization header
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Cookies are sent automatically with withCredentials: true
        // No need to manually set Authorization header
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for refresh token logic
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalConfig = error.config;
        const shouldRenewToken = error.response?.status === 401;

        if (shouldRenewToken && originalConfig) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            // isRefreshing để chỉ 1 response lỗi đầu tiên mới refresh

            try {
              // Cookies are sent automatically, no need to pass refreshToken in body
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                {},
                {
                  withCredentials: true,
                }
              );

              // Cookies are set automatically by backend, no need to store in localStorage
              this.tokenListeners.forEach((listener) => listener());

              this.isRefreshing = false;
              this.tokenListeners = [];
              // tránh việc refresh những lần sau sẽ bị dùng lại các phần tử cũ

              return this.axiosInstance(originalConfig);
            } catch {
              // nếu refresh token gửi đi lỗi hay không hợp lệ
              this.isRefreshing = false;
              this.tokenListeners = [];
              // Cookies will be cleared by backend on error
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
            }
          } else {
            // trong khi api đầu tiên refresh, các api lỗi khác sẽ vào đây
            return new Promise((resolve) => {
              this.tokenListeners.push(() => {
                resolve(this.axiosInstance(originalConfig));
              });
            });
            // cách này sẽ dồn các response khác vào một mảng để gọi sau khi refresh thành công ở trên
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const isPutOrPatch = ['put', 'patch'].includes(method.toLowerCase());
      const effectiveMethod = isPutOrPatch ? 'post' : method;
      const effectivePath = isPutOrPatch 
        ? `${url}${url.includes('?') ? '&' : '?'}_method=${method}` 
        : url;

      const response = await this.axiosInstance.request({
        method: effectiveMethod,
        url: effectivePath,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      console.error('HTTP Request Error:', error);
      const axiosError = error as AxiosError;
      return axiosError.response?.data as T;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>('GET', url, null, config);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>('POST', url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>('PUT', url, data, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>('PATCH', url, data, config);
  }

  async delete<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>('DELETE', url, data, config);
  }
}

// Create and export instance
const httpRequest = new HttpRequest();

// Named exports for convenience
export const get = httpRequest.get.bind(httpRequest);
export const post = httpRequest.post.bind(httpRequest);
export const put = httpRequest.put.bind(httpRequest);
export const patch = httpRequest.patch.bind(httpRequest);
export const remove = httpRequest.delete.bind(httpRequest);

// Default export
const httpRequestExports = {
  get,
  post,
  put,
  patch,
  remove,
};

export default httpRequestExports;