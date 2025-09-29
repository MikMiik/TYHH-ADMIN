import { baseApi, ApiResponse } from './baseApi';

// Dashboard interfaces
export interface OverviewStats {
  users: { total: number; active: number };
  courses: { total: number; active: number };
  livestreams: { total: number; totalViews: number };
  documents: { total: number; totalDownloads: number };
  topics: { total: number };
  enrollments: { total: number };
}

export interface UserAnalytics {
  monthlyRegistrations: Array<{ month: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  topUsers: Array<{ id: number; name: string; email: string; enrollments: number }>;
}

export interface CourseAnalytics {
  monthlyCourses: Array<{ month: string; count: number }>;
  priceDistribution: Array<{ priceRange: string; count: number }>;
  topCourses: Array<{ id: number; title: string; price: number; isFree: boolean; enrollments: number }>;
  topicsPopularity: Array<{ id: number; title: string; courseCount: number }>;
}

export interface LivestreamAnalytics {
  monthlyLivestreams: Array<{ month: string; count: number }>;
  topLivestreams: Array<{ id: number; title: string; view: number; course: { title: string } }>;
  viewsByCourse: Array<{ id: number; title: string; totalViews: number }>;
}

export interface DocumentAnalytics {
  monthlyDocuments: Array<{ month: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  topDocuments: Array<{ 
    id: number; 
    title: string; 
    downloadCount: number; 
    vip: boolean;
    livestream?: { 
      title: string;
      course?: { title: string }
    }
  }>;
}

export interface RecentActivities {
  recentUsers: Array<{ id: number; name: string; email: string; createdAt: string }>;
  recentCourses: Array<{ id: number; title: string; createdAt: string; teacher: { name: string } }>;
  recentEnrollments: Array<{ createdAt: string; User: { name: string }; Course: { title: string } }>;
}

export interface GrowthAnalytics {
  users: { current: number; previous: number; growth: number };
  courses: { current: number; previous: number; growth: number };
  enrollments: { current: number; previous: number; growth: number };
}

export interface DashboardData {
  overview: OverviewStats;
  users: UserAnalytics;
  courses: CourseAnalytics;
  livestreams: LivestreamAnalytics;
  documents: DocumentAnalytics;
  activities: RecentActivities;
  growth: GrowthAnalytics;
  generatedAt: string;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get complete dashboard data
    getDashboard: builder.query<DashboardData, void>({
      query: () => '/dashboard',
      transformResponse: (response: ApiResponse<DashboardData>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get dashboard data');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    // Get overview statistics
    getDashboardOverview: builder.query<OverviewStats, void>({
      query: () => '/dashboard/overview',
      transformResponse: (response: ApiResponse<OverviewStats>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get overview stats');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    // Get user analytics
    getDashboardUsers: builder.query<UserAnalytics, void>({
      query: () => '/dashboard/users',
      transformResponse: (response: ApiResponse<UserAnalytics>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get user analytics');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    // Get course analytics
    getDashboardCourses: builder.query<CourseAnalytics, void>({
      query: () => '/dashboard/courses',
      transformResponse: (response: ApiResponse<CourseAnalytics>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get course analytics');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    // Get livestream analytics
    getDashboardLivestreams: builder.query<LivestreamAnalytics, void>({
      query: () => '/dashboard/livestreams',
      transformResponse: (response: ApiResponse<LivestreamAnalytics>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get livestream analytics');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    // Get document analytics
    getDashboardDocuments: builder.query<DocumentAnalytics, void>({
      query: () => '/dashboard/documents',
      transformResponse: (response: ApiResponse<DocumentAnalytics>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get document analytics');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),

    // Get growth analytics
    getDashboardGrowth: builder.query<GrowthAnalytics, void>({
      query: () => '/dashboard/growth',
      transformResponse: (response: ApiResponse<GrowthAnalytics>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get growth analytics');
        }
        return response.data;
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetDashboardOverviewQuery,
  useGetDashboardUsersQuery,
  useGetDashboardCoursesQuery,
  useGetDashboardLivestreamsQuery,
  useGetDashboardDocumentsQuery,
  useGetDashboardGrowthQuery,
} = dashboardApi;