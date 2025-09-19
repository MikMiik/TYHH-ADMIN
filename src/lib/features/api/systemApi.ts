import { baseApi } from './baseApi';

export interface SiteInfo {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface Social {
  id: string;
  platform: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  cityId: string;
  city?: City;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  attempts: number;
  maxAttempts: number;
  delay: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failedAt?: string;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetUsers: 'all' | 'specific' | 'role';
  targetData?: string;
  scheduled?: boolean;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Site Settings Management
    getSiteSettings: builder.query<SiteInfo[], void>({
      query: () => '/admin/system/settings',
      providesTags: ['SiteInfo'],
    }),

    getSiteSetting: builder.query<SiteInfo, string>({
      query: (key) => `/admin/system/settings/${key}`,
      providesTags: (result, error, key) => [
        { type: 'SiteInfo', id: key },
      ],
    }),

    updateSiteSetting: builder.mutation<SiteInfo, { key: string; value: string }>({
      query: ({ key, value }) => ({
        url: `/admin/system/settings/${key}`,
        method: 'PUT',
        body: { value },
      }),
      invalidatesTags: (result, error, { key }) => [
        'SiteInfo',
        { type: 'SiteInfo', id: key },
      ],
    }),

    createSiteSetting: builder.mutation<SiteInfo, { key: string; value: string }>({
      query: ({ key, value }) => ({
        url: '/admin/system/settings',
        method: 'POST',
        body: { key, value },
      }),
      invalidatesTags: ['SiteInfo'],
    }),

    deleteSiteSetting: builder.mutation<void, string>({
      query: (key) => ({
        url: `/admin/system/settings/${key}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SiteInfo'],
    }),

    // Social Links Management
    getSocialLinks: builder.query<Social[], void>({
      query: () => '/admin/system/socials',
      providesTags: ['Social'],
    }),

    createSocialLink: builder.mutation<Social, { platform: string; url: string }>({
      query: (data) => ({
        url: '/admin/system/socials',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Social'],
    }),

    updateSocialLink: builder.mutation<Social, { id: string; platform: string; url: string }>({
      query: ({ id, ...data }) => ({
        url: `/admin/system/socials/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Social'],
    }),

    deleteSocialLink: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/system/socials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Social'],
    }),

    // Cities Management
    getCities: builder.query<City[], void>({
      query: () => '/admin/system/cities',
      providesTags: ['City'],
    }),

    createCity: builder.mutation<City, { name: string }>({
      query: (data) => ({
        url: '/admin/system/cities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['City'],
    }),

    updateCity: builder.mutation<City, { id: string; name: string }>({
      query: ({ id, ...data }) => ({
        url: `/admin/system/cities/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['City'],
    }),

    deleteCity: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/system/cities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['City'],
    }),

    // Schools Management
    getSchools: builder.query<School[], { cityId?: string }>({
      query: ({ cityId }) => ({
        url: '/admin/system/schools',
        params: { cityId },
      }),
      providesTags: ['School'],
    }),

    createSchool: builder.mutation<School, { name: string; cityId: string }>({
      query: (data) => ({
        url: '/admin/system/schools',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['School'],
    }),

    updateSchool: builder.mutation<School, { id: string; name: string; cityId: string }>({
      query: ({ id, ...data }) => ({
        url: `/admin/system/schools/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['School'],
    }),

    deleteSchool: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/system/schools/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['School'],
    }),

    // Background Jobs Management
    getBackgroundJobs: builder.query<{
      data: BackgroundJob[];
      total: number;
      page: number;
      limit: number;
    }, {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
    }>({
      query: ({ page = 1, limit = 20, status, type }) => ({
        url: '/admin/system/jobs',
        params: { page, limit, status, type },
      }),
      providesTags: ['Job'],
    }),

    retryBackgroundJob: builder.mutation<BackgroundJob, string>({
      query: (id) => ({
        url: `/admin/system/jobs/${id}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['Job'],
    }),

    deleteBackgroundJob: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/system/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Job'],
    }),

    clearFailedJobs: builder.mutation<void, void>({
      query: () => ({
        url: '/admin/system/jobs/clear-failed',
        method: 'DELETE',
      }),
      invalidatesTags: ['Job'],
    }),

    // Notification Management
    getNotificationTemplates: builder.query<NotificationTemplate[], void>({
      query: () => '/admin/system/notifications/templates',
      providesTags: ['Notification'],
    }),

    createNotificationTemplate: builder.mutation<NotificationTemplate, Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (data) => ({
        url: '/admin/system/notifications/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    updateNotificationTemplate: builder.mutation<NotificationTemplate, { id: string } & Partial<NotificationTemplate>>({
      query: ({ id, ...data }) => ({
        url: `/admin/system/notifications/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotificationTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/system/notifications/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    sendNotification: builder.mutation<void, {
      templateId?: string;
      title: string;
      content: string;
      type: string;
      targetUsers: string;
      targetData?: string;
      scheduledAt?: string;
    }>({
      query: (data) => ({
        url: '/admin/system/notifications/send',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSiteSettingsQuery,
  useGetSiteSettingQuery,
  useUpdateSiteSettingMutation,
  useCreateSiteSettingMutation,
  useDeleteSiteSettingMutation,
  useGetSocialLinksQuery,
  useCreateSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useGetBackgroundJobsQuery,
  useRetryBackgroundJobMutation,
  useDeleteBackgroundJobMutation,
  useClearFailedJobsMutation,
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useSendNotificationMutation,
} = systemApi;