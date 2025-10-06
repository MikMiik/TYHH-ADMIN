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
    avatar?: string;
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
  // Relations from BE
  outlines?: CourseOutline[];
  topics?: Topic[];
  students?: {
    id: number;
    name: string;
    email: string;
    username: string;
    CourseUser?: {
      createdAt: string;
    };
  }[];
}

export interface CourseOutline {
  id: number;
  title: string;
  slug: string;
  courseId: number;
  order?: number;
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

export interface Teacher {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface CoursesListParams {
  page?: number;
  limit?: number;
  search?: string;
  teacherId?: number;
  isFree?: boolean;
  topicId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CoursesListResponse {
  courses: Course[];
  total: number;
  currentPage: number;
  totalPages: number;
  topics?: Topic[];
  stats?: {
    total: number;
    free: number;
    paid: number;
  };
}

interface CreateCourseData {
  title: string;
  description?: string;
  teacherId?: number;
  price?: number;
  discount?: number;
  isFree?: boolean;
  purpose?: string;
  group?: string;
  content?: string;
  thumbnail?: string;
  introVideo?: string;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách courses với pagination và filters
    getCourses: builder.query<CoursesListResponse, CoursesListParams>({
      query: (params = {}) => ({
        url: '/courses',
        params,
      }),
      transformResponse: (response: ApiResponse<CoursesListResponse>) => 
        response.data || { courses: [], total: 0, currentPage: 1, totalPages: 0 },
      providesTags: ['Course'],
    }),

    // Lấy thông tin chi tiết 1 course
    getCourse: builder.query<Course, number | string>({
      query: (id) => `/courses/${id}`,
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
        url: '/courses',
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
        url: `/courses/${id}`,
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
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse) => ({ success: response.success }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    // Lấy danh sách topics
    getTopics: builder.query<Topic[], void>({
      query: () => '/topics',
      transformResponse: (response: ApiResponse<{ topics: Topic[]; total: number; currentPage: number; totalPages: number }>) => {
        return response.data?.topics || [];
      },
      providesTags: ['Topic'],
    }),

    // Tạo topic mới
    createTopic: builder.mutation<Topic, { title: string }>({
      query: ({ title }) => ({
        url: '/topics',
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
        url: `/courses/${courseId}/topics`,
        method: 'POST',
        body: { topicIds },
      }),
      transformResponse: (response: ApiResponse) => ({ success: response.success }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }, 'Course'],
    }),

    // Remove student from course
    removeStudentFromCourse: builder.mutation<{ success: boolean }, { courseId: number | string; userId: number }>({
      query: ({ courseId, userId }) => ({
        url: `/courses/${courseId}/students/${userId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse) => ({ success: response.success }),
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }, 'Course'],
    }),

    // Get all available teachers
    getTeachers: builder.query<Teacher[], void>({
      query: () => '/courses/teachers',
      transformResponse: (response: ApiResponse<Teacher[]>) => response.data || [],
      providesTags: ['Teacher'],
    }),

    // Update course teacher
    updateCourseTeacher: builder.mutation<Course, { courseId: number | string; teacherId: number | null }>({
      query: ({ courseId, teacherId }) => ({
        url: `/courses/${courseId}/teacher`,
        method: 'PUT',
        body: { teacherId },
      }),
      transformResponse: (response: ApiResponse<Course>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update teacher');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }, 'Course'],
    }),

    // Update course topics
    updateCourseTopics: builder.mutation<Course, { courseId: number | string; topicIds: number[] }>({
      query: ({ courseId, topicIds }) => ({
        url: `/courses/${courseId}/topics`,
        method: 'PUT',
        body: { topicIds },
      }),
      transformResponse: (response: ApiResponse<Course>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update topics');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { courseId }) => [{ type: 'Course', id: courseId }, 'Course', 'Topic'],
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
  useGetTopicsQuery,
  useCreateTopicMutation,
  useAssignCourseTopicsMutation,
  useRemoveStudentFromCourseMutation,
  useGetTeachersQuery,
  useUpdateCourseTeacherMutation,
  useUpdateCourseTopicsMutation,
} = courseApi;