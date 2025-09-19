import { baseApi } from './baseApi';

export interface ContentAnalytics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsGrowth: number;
  likesGrowth: number;
}

export interface PopularContent {
  id: string;
  title: string;
  type: 'course' | 'livestream' | 'document';
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  thumbnail?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface EngagementMetrics {
  avgWatchTime: number;
  avgSessionDuration: number;
  bounceRate: number;
  completionRate: number;
  interactionRate: number;
  retentionRate: number;
}

export interface ViewsAnalytics {
  date: string;
  views: number;
  uniqueViews: number;
  courses: number;
  livestreams: number;
  documents: number;
}

export interface UserEngagementAnalytics {
  date: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  totalSessions: number;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  type: 'course' | 'livestream' | 'document';
  views: number;
  uniqueViews: number;
  likes: number;
  shares: number;
  comments: number;
  avgRating: number;
  completionRate: number;
  avgWatchTime: number;
  createdAt: string;
  lastUpdated: string;
}

export interface AnalyticsTimeRange {
  range: '7d' | '30d' | '90d' | '1y' | 'all';
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get overall content analytics
    getContentAnalytics: builder.query<ContentAnalytics, AnalyticsTimeRange>({
      query: ({ range, startDate, endDate }) => ({
        url: '/admin/analytics/content',
        params: { range, startDate, endDate },
      }),
      providesTags: ['Analytics'],
    }),

    // Get popular content
    getPopularContent: builder.query<PopularContent[], { range: string; limit?: number }>({
      query: ({ range, limit = 10 }) => ({
        url: '/admin/analytics/popular',
        params: { range, limit },
      }),
      providesTags: ['Analytics'],
    }),

    // Get engagement metrics
    getEngagementMetrics: builder.query<EngagementMetrics, AnalyticsTimeRange>({
      query: ({ range, startDate, endDate }) => ({
        url: '/admin/analytics/engagement',
        params: { range, startDate, endDate },
      }),
      providesTags: ['Analytics'],
    }),

    // Get views analytics over time
    getViewsAnalytics: builder.query<ViewsAnalytics[], AnalyticsTimeRange>({
      query: ({ range, startDate, endDate }) => ({
        url: '/admin/analytics/views',
        params: { range, startDate, endDate },
      }),
      providesTags: ['Analytics'],
    }),

    // Get user engagement analytics
    getUserEngagementAnalytics: builder.query<UserEngagementAnalytics[], AnalyticsTimeRange>({
      query: ({ range, startDate, endDate }) => ({
        url: '/admin/analytics/user-engagement',
        params: { range, startDate, endDate },
      }),
      providesTags: ['Analytics'],
    }),

    // Get content performance
    getContentPerformance: builder.query<{
      data: ContentPerformance[];
      total: number;
      page: number;
      limit: number;
    }, {
      page?: number;
      limit?: number;
      type?: 'course' | 'livestream' | 'document';
      sortBy?: 'views' | 'likes' | 'rating' | 'completion' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
      range?: string;
    }>({
      query: ({ page = 1, limit = 10, type, sortBy = 'views', sortOrder = 'desc', range = '30d' }) => ({
        url: '/admin/analytics/content-performance',
        params: { page, limit, type, sortBy, sortOrder, range },
      }),
      providesTags: ['Analytics'],
    }),

    // Get specific content analytics
    getContentAnalyticsById: builder.query<{
      views: ViewsAnalytics[];
      engagement: EngagementMetrics;
      demographics: {
        countries: Array<{ country: string; percentage: number }>;
        devices: Array<{ device: string; percentage: number }>;
        ages: Array<{ ageGroup: string; percentage: number }>;
      };
      traffic: {
        sources: Array<{ source: string; visits: number; percentage: number }>;
        referrers: Array<{ referrer: string; visits: number }>;
      };
    }, { contentId: string; type: string; range: string }>({
      query: ({ contentId, type, range }) => ({
        url: `/admin/analytics/content/${contentId}`,
        params: { type, range },
      }),
      providesTags: (result, error, { contentId }) => [
        { type: 'Analytics', id: contentId },
      ],
    }),
  }),
});

export const {
  useGetContentAnalyticsQuery,
  useGetPopularContentQuery,
  useGetEngagementMetricsQuery,
  useGetViewsAnalyticsQuery,
  useGetUserEngagementAnalyticsQuery,
  useGetContentPerformanceQuery,
  useGetContentAnalyticsByIdQuery,
} = analyticsApi;