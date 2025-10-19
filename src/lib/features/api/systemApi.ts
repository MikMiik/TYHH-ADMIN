import { baseApi, ApiResponse } from "./baseApi";

// System interfaces theo BE model thực tế
export interface Social {
  id: number;
  platform: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface City {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: number;
  title: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Role {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message?: string;
  teacherId?: number;
  teacher?: {
    id: number;
    name: string;
    email?: string;
  };
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

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface CreateSocialData {
  platform: string;
  url: string;
}

export interface UpdateSocialData {
  platform?: string;
  url?: string;
}

export interface CreateCityData {
  name: string;
}

export interface UpdateCityData {
  name?: string;
}

export interface CreateTopicData {
  title: string;
}

export interface UpdateTopicData {
  title?: string;
}

export interface CreateNotificationData {
  title: string;
  message?: string;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
}

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Roles endpoints
    getRoles: builder.query<Role[], void>({
      query: () => "/system/roles",
      transformResponse: (response: ApiResponse<Role[]>) => {
        return response.data || [];
      },
      providesTags: ["Role"],
    }),

    // Socials endpoints
    getSocials: builder.query<Social[], void>({
      query: () => "/system/socials",
      transformResponse: (response: ApiResponse<Social[]>) => {
        return response.data || [];
      },
      providesTags: ["Social"],
    }),

    addSocial: builder.mutation<Social, CreateSocialData>({
      query: (data) => ({
        url: "/system/socials",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Social>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create social');
        }
        return response.data;
      },
      invalidatesTags: ["Social"],
    }),

    updateSocial: builder.mutation<Social, { id: number; data: UpdateSocialData }>({
      query: ({ id, data }) => ({
        url: `/system/socials/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Social>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update social');
        }
        return response.data;
      },
      invalidatesTags: ["Social"],
    }),

    deleteSocial: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/socials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Social"],
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

    // Topics endpoints
    getTopics: builder.query<Topic[], void>({
      query: () => "/system/topics",
      transformResponse: (response: ApiResponse<Topic[]>) => {
        return response.data || [];
      },
      providesTags: ["Topic"],
    }),

    addTopic: builder.mutation<Topic, CreateTopicData>({
      query: (data) => ({
        url: "/system/topics",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Topic>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create topic');
        }
        return response.data;
      },
      invalidatesTags: ["Topic"],
    }),

    updateTopic: builder.mutation<Topic, { id: number; data: UpdateTopicData }>({
      query: ({ id, data }) => ({
        url: `/system/topics/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Topic>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update topic');
        }
        return response.data;
      },
      invalidatesTags: ["Topic"],
    }),

    deleteTopic: builder.mutation<void, number>({
      query: (id) => ({
        url: `/system/topics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Topic"],
    }),

    // Notifications endpoints
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => "/system/notifications",
      transformResponse: (response: ApiResponse<NotificationsResponse>) => {
        return response.data || { notifications: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, limit: 10 } };
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
  useGetRolesQuery,
  useGetSocialsQuery,
  useAddSocialMutation,
  useUpdateSocialMutation,
  useDeleteSocialMutation,
  useGetCitiesQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetTopicsQuery,
  useAddTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useGetNotificationsQuery,
  useAddNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetQueueQuery,
  useGetQueueStatsQuery,
  useRetryQueueJobMutation,
  useDeleteQueueJobMutation,
} = systemApi;
