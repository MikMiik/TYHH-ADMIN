import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000/admin',
    credentials: 'include', // Send cookies automatically for auth
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  // Define tag types for cache invalidation
  tagTypes: [
    'User', 
    'Course', 
    'Livestream', 
    'Document', 
    'DocumentCategory',
    'DocumentAnalytics',
    'Analytics',
    'Dashboard',
    'Notification', 
    'SiteInfo',
    'Topic',
    'Teacher',
    'Schedule',
    'City',
    'School',
    'Social',
    'Job'
  ],
  endpoints: () => ({}),
});

// Export types for usage in components
export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};