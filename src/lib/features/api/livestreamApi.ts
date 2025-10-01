import { baseApi, ApiResponse } from './baseApi';

// Types cho Livestream API theo BE model thực tế  
export interface Livestream {
  id: number;
  title: string;
  slug: string;
  courseId: number;
  courseOutlineId: number;
  url?: string;                        // Video URL
  view: number;                        // View count (BIGINT)
  course?: {
    id: number;
    title: string;
    slug: string;
  };
  courseOutline?: {
    id: number;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface LivestreamsListParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: number;
  courseOutlineId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface LivestreamsListResponse {
  items: Livestream[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  stats: {
    total: number;
    totalViews: number;
  };
}

export interface CreateLivestreamData {
  title: string;
  courseId: number;
  courseOutlineId: number;
  url?: string;
}

export interface UpdateLivestreamData {
  title?: string;
  courseId?: number;
  courseOutlineId?: number;
}

export const livestreamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách livestreams với pagination và filters
    getLivestreams: builder.query<LivestreamsListResponse, LivestreamsListParams>({
      query: (params = {}) => ({
        url: '/livestreams',
        params,
      }),
      transformResponse: (response: ApiResponse<LivestreamsListResponse>) => 
        response.data || { 
          items: [], 
          pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 0 },
          stats: { total: 0, totalViews: 0 }
        },
      providesTags: ['Livestream'],
    }),

    // Lấy thông tin chi tiết 1 livestream
    getLivestream: builder.query<Livestream, number | string>({
      query: (id) => `/livestreams/${id}`,
      transformResponse: (response: ApiResponse<Livestream>) => {
        if (!response.data) {
          throw new Error(response.message || 'Livestream not found');
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Livestream', id }],
    }),

    // Tạo livestream mới
    createLivestream: builder.mutation<Livestream, CreateLivestreamData>({
      query: (data) => ({
        url: '/livestreams',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Livestream>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create livestream');
        }
        return response.data;
      },
      invalidatesTags: ['Livestream'],
    }),

    // Cập nhật thông tin livestream
    updateLivestream: builder.mutation<Livestream, { id: number; data: UpdateLivestreamData }>({
      query: ({ id, data }) => ({
        url: `/livestreams/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Livestream>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update livestream');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Livestream', id },
        'Livestream',
      ],
    }),

    // Xóa livestream
    deleteLivestream: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/livestreams/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        return response.data || { message: response.message || 'Livestream deleted successfully' };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Livestream', id },
        'Livestream',
      ],
    }),

    // Lấy analytics livestream 
    getLivestreamAnalytics: builder.query<{
      total: number;
      totalViews: number;
      averageViews: number;
    }, void>({
      query: () => '/livestreams/analytics',
      transformResponse: (response: ApiResponse<{
        total: number;
        totalViews: number;
        averageViews: number;
      }>) => {
        return response.data || {
          total: 0,
          totalViews: 0,
          averageViews: 0,
        };
      },
      providesTags: ['Livestream'],
    }),
  }),
});

// Export hooks
export const {
  useGetLivestreamsQuery,
  useGetLivestreamQuery,
  useCreateLivestreamMutation,
  useUpdateLivestreamMutation,
  useDeleteLivestreamMutation,
  useGetLivestreamAnalyticsQuery,
} = livestreamApi;