import { baseApi, ApiResponse } from './baseApi';

// Types cho Course API theo BE model thực tế 
export interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string;
  teacherId: number;
  teacher?: {
    id: number;
    name: string;
    email: string;
  };
  price?: number;
  discount?: number;
  isFree: boolean;
  purpose?: string;
  thumbnail?: string;
  content?: string;
  group?: string;
  introVideo?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CourseOutline {
  id: number;
  title: string;
  slug: string;
  courseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Topic {
  id: number;
  title: string;
  slug: string;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface CoursesListParams {
  page?: number;
  limit?: number;
  search?: string;
  teacherId?: number;
  isFree?: boolean;
  group?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CoursesListResponse {
  courses: Course[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface CreateCourseData {
  title: string;
  description?: string;
  teacherId: number;
  price?: number;
  discount?: number;
  isFree?: boolean;
  purpose?: string;
  group?: string;
  content?: string;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách courses với pagination và filters
    getCourses: builder.query<CoursesListResponse, CoursesListParams>({
      query: (params = {}) => ({
        url: '/admin/courses',
        params,
      }),
      transformResponse: (response: ApiResponse<CoursesListResponse>) => 
        response.data || { courses: [], total: 0, currentPage: 1, totalPages: 0 },
      providesTags: ['Course'],
    }),

    // Lấy thông tin chi tiết 1 course
    getCourse: builder.query<Course, number | string>({
      query: (id) => `/admin/courses/${id}`,
      transformResponse: (response: ApiResponse<Course>) => {
        if (!response.data) {
          throw new Error(response.message || 'Course not found');
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    // Tạo course mới
    createCourse: builder.mutation<Course, CreateCourseData>({
      query: (courseData) => ({
        url: '/admin/courses',
        method: 'POST',
        body: courseData,
      }),
      transformResponse: (response: ApiResponse<Course>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create course');
        }
        return response.data;
      },
      invalidatesTags: ['Course'],
    }),

    // Cập nhật course
    updateCourse: builder.mutation<Course, { id: number | string; data: Partial<CreateCourseData> }>({
      query: ({ id, data }) => ({
        url: `/admin/courses/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Course>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update course');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course'],
    }),

    // Xóa course (soft delete)
    deleteCourse: builder.mutation<{ success: boolean }, number | string>({
      query: (id) => ({
        url: `/admin/courses/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse) => ({ success: response.success }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    // Lấy course outlines
    getCourseOutlines: builder.query<CourseOutline[], number | string>({
      query: (courseId) => `/admin/courses/${courseId}/outlines`,
      transformResponse: (response: ApiResponse<CourseOutline[]>) => 
        response.data || [],
      providesTags: ['Course'],
    }),

    // Tạo course outline
    createCourseOutline: builder.mutation<CourseOutline, { courseId: number | string; title: string }>({
      query: ({ courseId, title }) => ({
        url: `/admin/courses/${courseId}/outlines`,
        method: 'POST',
        body: { title },
      }),
      transformResponse: (response: ApiResponse<CourseOutline>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create outline');
        }
        return response.data;
      },
      invalidatesTags: ['Course'],
    }),

    // Lấy danh sách topics
    getTopics: builder.query<Topic[], void>({
      query: () => '/admin/topics',
      transformResponse: (response: ApiResponse<Topic[]>) => response.data || [],
      providesTags: ['Topic'],
    }),

    // Tạo topic mới
    createTopic: builder.mutation<Topic, { title: string }>({
      query: ({ title }) => ({
        url: '/admin/topics',
        method: 'POST',
        body: { title },
      }),
      transformResponse: (response: ApiResponse<Topic>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create topic');
        }
        return response.data;
      },
      invalidatesTags: ['Topic'],
    }),

    // Assign topics to course
    assignCourseTopics: builder.mutation<{ success: boolean }, { courseId: number; topicIds: number[] }>({
      query: ({ courseId, topicIds }) => ({
        url: `/admin/courses/${courseId}/topics`,
        method: 'POST',
        body: { topicIds },
      }),
      transformResponse: (response: ApiResponse) => ({ success: response.success }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }, 'Course'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseOutlinesQuery,
  useCreateCourseOutlineMutation,
  useGetTopicsQuery,
  useCreateTopicMutation,
  useAssignCourseTopicsMutation,
} = courseApi;