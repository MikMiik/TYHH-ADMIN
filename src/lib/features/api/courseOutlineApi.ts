import { baseApi, ApiResponse } from './baseApi';

// Types cho Course Outline API theo BE model thực tế  
export interface CourseOutline {
  id: number;
  title: string;
  slug: string;
  order: number;
  courseId: number;
  course?: {
    id: number;
    title: string;
    slug: string;
    description?: string;
  };
  livestreams?: {
    id: number;
    title: string;
    slug: string;
    url?: string;
    view?: number;
    order?: number;
  }[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface CourseOutlinesListParams {
  courseId?: number;
  page?: number;
  limit?: number;
  search?: string;
}

interface CourseOutlinesListResponse {
  outlines: CourseOutline[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CreateCourseOutlineData {
  title: string;
  courseId: number;
}

export interface UpdateCourseOutlineData {
  title?: string;
}

export interface ReorderOutlinesData {
  orders: Array<{ id: number; order: number }>;
}

export const courseOutlineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách course outlines với pagination và filters
    getCourseOutlines: builder.query<CourseOutlinesListResponse, CourseOutlinesListParams>({
      query: (params = {}) => {
        const { courseId, ...queryParams } = params;
        
        if (courseId) {
          // Get outlines for specific course
          return {
            url: `/course-outlines/course/${courseId}`,
            params: queryParams,
          };
        } else {
          // Get all outlines across all courses
          return {
            url: `/course-outlines`,
            params: queryParams,
          };
        }
      },
      transformResponse: (response: ApiResponse<CourseOutlinesListResponse>) => {
        if (!response.data) {
          return {
            outlines: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: 10,
            },
          };
        }
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.outlines.map(({ id }) => ({ type: 'CourseOutline' as const, id })),
              'CourseOutline',
            ]
          : ['CourseOutline'],
    }),

    // Lấy thông tin chi tiết một course outline
    getCourseOutline: builder.query<CourseOutline, string | number>({
      query: (id) => `/course-outlines/${id}`,
      transformResponse: (response: ApiResponse<CourseOutline>) => {
        if (!response.data) {
          throw new Error(response.message || 'Course outline not found');
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'CourseOutline', id }],
    }),

    // Tạo course outline mới
    createCourseOutline: builder.mutation<CourseOutline, CreateCourseOutlineData>({
      query: (data) => ({
        url: `/course-outlines/course/${data.courseId}`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<CourseOutline>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create course outline');
        }
        return response.data;
      },
      invalidatesTags: ['CourseOutline'],
    }),

    // Cập nhật thông tin course outline
    updateCourseOutline: builder.mutation<CourseOutline, { id: number; data: UpdateCourseOutlineData }>({
      query: ({ id, data }) => ({
        url: `/course-outlines/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<CourseOutline>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update course outline');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'CourseOutline', id },
        'CourseOutline',
      ],
    }),

    // Xóa course outline
    deleteCourseOutline: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/course-outlines/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        return response.data || { message: response.message || 'Course outline deleted successfully' };
      },
      invalidatesTags: (result, error, id) => [
        { type: 'CourseOutline', id },
        'CourseOutline',
      ],
    }),

    // Bulk delete course outlines
    bulkDeleteCourseOutlines: builder.mutation<{ deletedCount: number; message: string }, number[]>({
      query: (ids) => ({
        url: '/course-outlines/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      transformResponse: (response: ApiResponse<{ deletedCount: number; message: string }>) => 
        response.data || { deletedCount: 0, message: 'No course outlines deleted' },
      invalidatesTags: ['CourseOutline'],
    }),

    // Reorder course outlines
    reorderCourseOutlines: builder.mutation<{ message: string }, { courseId: number; data: ReorderOutlinesData }>({
      query: ({ courseId, data }) => ({
        url: `/course-outlines/course/${courseId}/reorder`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) => {
        return response.data || { message: response.message || 'Course outlines reordered successfully' };
      },
      invalidatesTags: ['CourseOutline'],
    }),
  }),
});

// Export hooks
export const {
  useGetCourseOutlinesQuery,
  useGetCourseOutlineQuery,
  useCreateCourseOutlineMutation,
  useUpdateCourseOutlineMutation,
  useDeleteCourseOutlineMutation,
  useBulkDeleteCourseOutlinesMutation,
  useReorderCourseOutlinesMutation,
} = courseOutlineApi;