import { baseApi, ApiResponse } from './baseApi';
import { User } from '@/lib/types/auth';

// Types cho User API
interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'teacher' | 'user';
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UsersListResponse {
  items: User[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
}

interface UpdateUserData {
  name?: string;
  email?: string;
  username?: string;
  role?: 'admin' | 'teacher' | 'user';
  status?: string;
  activeKey?: boolean;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách users với pagination và filters
    getUsers: builder.query<UsersListResponse, UsersListParams>({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      transformResponse: (response: ApiResponse<UsersListResponse>) => 
        response.data || { 
          items: [], 
          pagination: { 
            currentPage: 1, 
            perPage: 10, 
            total: 0, 
            lastPage: 0 
          } 
        },
      providesTags: ['User'],
    }),

    // Lấy thông tin chi tiết 1 user
    getUser: builder.query<User, number | string>({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) {
          throw new Error(response.message || 'User not found');
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Lấy thông tin chi tiết user theo username
    getUserByUsername: builder.query<User, string>({
      query: (username) => `/admin/users/username/${username}`,
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) {
          throw new Error(response.message || 'User not found');
        }
        return response.data;
      },
      providesTags: (result, error, username) => [{ type: 'User', id: username }],
    }),

    // Tạo user mới
    createUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create user');
        }
        return response.data;
      },
      invalidatesTags: ['User'],
    }),

    // Cập nhật user
    updateUser: builder.mutation<User, { id: number | string; data: UpdateUserData }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT', 
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update user');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    // Xóa user (soft delete)
    deleteUser: builder.mutation<{ success: boolean }, number | string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse) => ({ success: response.success }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),

    // Toggle user status (active/inactive)
    toggleUserStatus: builder.mutation<User, { id: number | string; activeKey: boolean }>({
      query: ({ id, activeKey }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { activeKey },
      }),
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update user status');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    // Bulk operations
    bulkUpdateUsers: builder.mutation<{ updated: number }, { ids: number[]; data: UpdateUserData }>({
      query: ({ ids, data }) => ({
        url: '/admin/users/bulk',
        method: 'PATCH',
        body: { ids, data },
      }),
      transformResponse: (response: ApiResponse<{ updated: number }>) => 
        response.data || { updated: 0 },
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetUserByUsernameQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useBulkUpdateUsersMutation,
} = userApi;