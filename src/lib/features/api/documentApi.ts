import { baseApi, ApiResponse } from "./baseApi";

// Document interfaces theo BE model thực tế
export interface Document {
  id: number;
  livestreamId?: number;
  vip: boolean;                        // VIP-only document
  title?: string;
  slug?: string;
  downloadCount: number;
  thumbnail?: string;                  // Document preview image
  livestream?: {
    id: number;
    title: string;
    slug: string;
    course?: {
      id: number;
      title: string;
      slug: string;
    };
    courseOutline?: {
      id: number;
      title: string;
      slug: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DocumentsListParams {
  page?: number;
  limit?: number;
  search?: string;
  vip?: boolean;
  livestreamId?: number;
  sortBy?: "title" | "createdAt" | "downloadCount";
  sortOrder?: "asc" | "desc";
}

export interface DocumentsListResponse {
  items: Document[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  stats: {
    total: number;
    vip: number;
    free: number;
    totalDownloads: number;
  };
}

export interface CreateDocumentData {
  title: string;
  slug?: string;
  thumbnail?: string;
  vip?: boolean;
  livestreamId?: number;
}

export interface UpdateDocumentData {
  title?: string;
  thumbnail?: string;
  vip?: boolean;
  livestreamId?: number;
}

export interface DocumentAnalytics {
  totalDocuments: number;
  vipDocuments: number;
  freeDocuments: number;
  totalDownloads: number;
  averageDownloads: number;
  topDownloaded?: Array<{
    id: number;
    title?: string;
    slug?: string;
    downloadCount: number;
    vip: boolean;
    livestream?: {
      title: string;
    };
  }>;
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all documents with pagination
    getDocuments: builder.query<DocumentsListResponse, DocumentsListParams>({
      query: (params = {}) => ({
        url: "/documents",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
          ...(params.vip !== undefined && { vip: params.vip }),
          ...(params.livestreamId && { livestreamId: params.livestreamId }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      transformResponse: (response: ApiResponse<DocumentsListResponse>) => 
        response.data || { 
          items: [], 
          pagination: { currentPage: 1, perPage: 10, total: 0, lastPage: 0 },
          stats: { total: 0, vip: 0, free: 0, totalDownloads: 0 }
        },
      providesTags: ["Document"],
    }),

    // Get single document by ID or slug
    getDocument: builder.query<Document, number | string>({
      query: (id) => `/documents/${id}`,
      transformResponse: (response: ApiResponse<Document>) => {
        if (!response.data) {
          throw new Error(response.message || 'Document not found');
        }
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),

    // Create new document
    createDocument: builder.mutation<Document, CreateDocumentData>({
      query: (data) => ({
        url: "/documents",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Document>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to create document');
        }
        return response.data;
      },
      invalidatesTags: ["Document"],
    }),

    // Update document
    updateDocument: builder.mutation<Document, { id: number; data: UpdateDocumentData }>({
      query: ({ id, data }) => ({
        url: `/documents/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Document>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to update document');
        }
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Document", id },
        "Document",
      ],
    }),

    // Delete document
    deleteDocument: builder.mutation<void, number>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Document", id },
        "Document",
      ],
    }),

    // Increment download count
    incrementDownloadCount: builder.mutation<Document, number>({
      query: (id) => ({
        url: `/documents/${id}/download`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<Document>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to track download');
        }
        return response.data;
      },
      invalidatesTags: (result, error, id) => [
        { type: "Document", id },
        "Document",
      ],
    }),

    // Get documents analytics
    getDocumentAnalytics: builder.query<DocumentAnalytics, void>({
      query: () => "/documents/analytics",
      transformResponse: (response: ApiResponse<DocumentAnalytics>) => {
        if (!response.data) {
          throw new Error(response.message || 'Failed to get analytics');
        }
        return response.data;
      },
      providesTags: ["Document"],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useIncrementDownloadCountMutation,
  useGetDocumentAnalyticsQuery,
} = documentApi;