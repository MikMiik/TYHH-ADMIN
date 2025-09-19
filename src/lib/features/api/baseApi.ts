import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
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
    'Notification', 
    'SiteInfo',
    'Topic',
    'Schedule',
    'City',
    'School',
    'Social'
  ],
  endpoints: () => ({}),
});

// Export types for usage in components
export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};