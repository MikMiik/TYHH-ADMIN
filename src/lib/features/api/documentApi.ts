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
  documents: Document[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface CreateDocumentData {
  livestreamId?: number;
  vip?: boolean;
  title?: string;
  slug?: string;
  thumbnail?: string;
}

interface UpdateDocumentData {
  livestreamId?: number;
  vip?: boolean;
  title?: string;
  slug?: string;
  thumbnail?: string;
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all documents with pagination
    getDocuments: builder.query<DocumentsListResponse, DocumentsListParams>({
      query: (params = {}) => ({
        url: "/admin/documents",
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
        response.data || { documents: [], total: 0, currentPage: 1, totalPages: 0 },
      providesTags: ["Document"],
    }),

    // Get single document by ID
    getDocument: builder.query<Document, number>({
      query: (id) => `/admin/documents/${id}`,
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
        url: "/admin/documents",
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
        url: `/admin/documents/${id}`,
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
        url: `/admin/documents/${id}`,
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
        url: `/admin/documents/${id}/download`,
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
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useIncrementDownloadCountMutation,
} = documentApi;