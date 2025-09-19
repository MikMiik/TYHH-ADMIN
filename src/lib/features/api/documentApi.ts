import { baseApi } from "./baseApi";

// Document interfaces
export interface Document {
  id: number;
  title: string;
  description: string | null;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  course: {
    id: number;
    title: string;
  } | null;
  isPublic: boolean;
  downloadCount: number;
  version: string;
  status: "active" | "archived" | "deleted";
  uploadedBy: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  documentCount: number;
}

export interface DocumentsListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: "active" | "archived" | "deleted" | "all";
  courseId?: number;
  sortBy?: "title" | "createdAt" | "downloadCount" | "fileSize";
  sortOrder?: "asc" | "desc";
}

export interface DocumentsListResponse {
  documents: Document[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DocumentAnalytics {
  totalDocuments: number;
  totalDownloads: number;
  totalFileSize: number;
  documentsByCategory: Array<{
    category: string;
    count: number;
  }>;
  recentUploads: number;
  popularDocuments: Array<{
    id: number;
    title: string;
    downloadCount: number;
  }>;
}

export interface CreateDocumentData {
  title: string;
  description?: string;
  file: File;
  categoryId: number;
  courseId?: number;
  isPublic: boolean;
  version: string;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  categoryId?: number;
  courseId?: number;
  isPublic?: boolean;
  version?: string;
  status?: "active" | "archived" | "deleted";
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get documents list with pagination and filters
    getDocuments: builder.query<DocumentsListResponse, DocumentsListParams>({
      query: (params) => ({
        url: "/admin/documents",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.search && { search: params.search }),
          ...(params.category && { category: params.category }),
          ...(params.status && params.status !== "all" && { status: params.status }),
          ...(params.courseId && { courseId: params.courseId }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: ["Document"],
    }),

    // Get single document by ID
    getDocument: builder.query<Document, number>({
      query: (id) => `/admin/documents/${id}`,
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),

    // Get document categories
    getDocumentCategories: builder.query<DocumentCategory[], void>({
      query: () => "/admin/documents/categories",
      providesTags: ["DocumentCategory"],
    }),

    // Get document analytics
    getDocumentAnalytics: builder.query<DocumentAnalytics, void>({
      query: () => "/admin/documents/analytics",
      providesTags: ["DocumentAnalytics"],
    }),

    // Upload new document
    createDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: "/admin/documents",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Document", "DocumentAnalytics", "DocumentCategory"],
    }),

    // Update document
    updateDocument: builder.mutation<Document, { id: number; data: UpdateDocumentData }>({
      query: ({ id, data }) => ({
        url: `/admin/documents/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Document", id },
        "Document",
        "DocumentAnalytics",
      ],
    }),

    // Delete document
    deleteDocument: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document", "DocumentAnalytics", "DocumentCategory"],
    }),

    // Download document (track download count)
    downloadDocument: builder.mutation<{ downloadUrl: string }, number>({
      query: (id) => ({
        url: `/admin/documents/${id}/download`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Document", id },
        "DocumentAnalytics",
      ],
    }),

    // Toggle document status (archive/activate)
    toggleDocumentStatus: builder.mutation<Document, { id: number; status: "active" | "archived" }>({
      query: ({ id, status }) => ({
        url: `/admin/documents/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Document", id },
        "Document",
        "DocumentAnalytics",
      ],
    }),

    // Create document category
    createDocumentCategory: builder.mutation<DocumentCategory, { name: string; description?: string }>({
      query: (data) => ({
        url: "/admin/documents/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DocumentCategory"],
    }),

    // Update document category
    updateDocumentCategory: builder.mutation<DocumentCategory, { id: number; data: { name?: string; description?: string } }>({
      query: ({ id, data }) => ({
        url: `/admin/documents/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DocumentCategory"],
    }),

    // Delete document category
    deleteDocumentCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/documents/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DocumentCategory"],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useGetDocumentCategoriesQuery,
  useGetDocumentAnalyticsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useDownloadDocumentMutation,
  useToggleDocumentStatusMutation,
  useCreateDocumentCategoryMutation,
  useUpdateDocumentCategoryMutation,
  useDeleteDocumentCategoryMutation,
} = documentApi;