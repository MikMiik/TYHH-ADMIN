import { baseApi, ApiResponse } from "./baseApi";

// System interfaces theo BE model thực tế
export interface SiteInfo {
  id: number | null;
  siteName: string;
  companyName: string;
  email: string;
  taxCode: string;
  phone: string;
  address: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface City {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: number;
  name: string;
  cityId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  city?: City;
}

export interface Notification {
  id: number;
  title: string;
  content?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface QueueJob {
  id: number;
  status: string;
  type?: string;
  payload?: string;
  maxRetries: number;
  retriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface QueueResponse {
  jobs: QueueJob[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface CreateCityData {
  name: string;
}

export interface UpdateCityData {
  name?: string;
}

export interface CreateSchoolData {
  name: string;
  cityId?: number;
}

export interface UpdateSchoolData {
  name?: string;
  cityId?: number;
}

export interface CreateNotificationData {
  title: string;
  content?: string;
  type?: string;
}

export interface UpdateNotificationData {
  title?: string;
  content?: string;
  type?: string;
}

export interface UpdateSiteInfoData {
  siteName?: string;
  companyName?: string;
  email?: string;
  taxCode?: string;
  phone?: string;
  address?: string;
}

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Site Info endpoints
    getSiteInfo: builder.query<SiteInfo, void>({
      query: () => "/system/site-info",
      transformResponse: (response: ApiResponse<SiteInfo>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get site info');
        }
        return response.data;
      },
      providesTags: ["SiteInfo"],
    }),

    updateSiteInfo: builder.mutation<SiteInfo, UpdateSiteInfoData>({
      query: (data) => ({
        url: "/system/site-info",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<SiteInfo>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update site info');
        }
        return response.data;
      },
      invalidatesTags: ["SiteInfo"],
    }),

    // Cities endpoints
    getCities: builder.query<City[], void>({
      query: () => "/system/cities",
      transformResponse: (response: ApiResponse<City[]>) => {
        return response.data || [];
      },
      providesTags: ["City"],
    }),

    addCity: builder.mutation<City, CreateCityData>({
      query: (data) => ({
        url: "/system/cities",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<City>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create city');
        }
        return response.data;
      },
      invalidatesTags: ["City"],
    }),

    updateCity: builder.mutation<City, { id: number; data: UpdateCityData }>({
      query: ({ id, data }) => ({
        url: `/system/cities/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<City>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update city');
        }
        return response.data;
      },
      invalidatesTags: ["City"],
    }),

    deleteCity: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/cities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["City"],
    }),

    // Schools endpoints
    getSchools: builder.query<School[], void>({
      query: () => "/system/schools",
      transformResponse: (response: ApiResponse<School[]>) => {
        return response.data || [];
      },
      providesTags: ["School"],
    }),

    addSchool: builder.mutation<School, CreateSchoolData>({
      query: (data) => ({
        url: "/system/schools",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<School>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create school');
        }
        return response.data;
      },
      invalidatesTags: ["School"],
    }),

    updateSchool: builder.mutation<School, { id: number; data: UpdateSchoolData }>({
      query: ({ id, data }) => ({
        url: `/system/schools/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<School>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update school');
        }
        return response.data;
      },
      invalidatesTags: ["School"],
    }),

    deleteSchool: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/schools/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["School"],
    }),

    // Notifications endpoints
    getNotifications: builder.query<Notification[], void>({
      query: () => "/system/notifications",
      transformResponse: (response: ApiResponse<Notification[]>) => {
        return response.data || [];
      },
      providesTags: ["Notification"],
    }),

    addNotification: builder.mutation<Notification, CreateNotificationData>({
      query: (data) => ({
        url: "/system/notifications",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Notification>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create notification');
        }
        return response.data;
      },
      invalidatesTags: ["Notification"],
    }),

    updateNotification: builder.mutation<Notification, { id: number; data: UpdateNotificationData }>({
      query: ({ id, data }) => ({
        url: `/system/notifications/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Notification>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update notification');
        }
        return response.data;
      },
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Queue endpoints
    getQueue: builder.query<QueueResponse, void>({
      query: () => "/system/queue",
      transformResponse: (response: ApiResponse<QueueResponse>) => {
        return response.data || { jobs: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, limit: 20 } };
      },
      providesTags: ["Queue"],
    }),

    getQueueStats: builder.query<QueueStats, void>({
      query: () => "/system/queue/stats",
      transformResponse: (response: ApiResponse<QueueStats>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get queue stats');
        }
        return response.data;
      },
      providesTags: ["Queue"],
    }),

    retryQueueJob: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/queue/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: ["Queue"],
    }),

    deleteQueueJob: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/queue/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Queue"],
    }),
  }),
});

export const {
  useGetSiteInfoQuery,
  useUpdateSiteInfoMutation,
  useGetCitiesQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetSchoolsQuery,
  useAddSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useGetNotificationsQuery,
  useAddNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetQueueQuery,
  useGetQueueStatsQuery,
  useRetryQueueJobMutation,
  useDeleteQueueJobMutation,
} = systemApi;
