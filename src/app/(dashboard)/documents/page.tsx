"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, RefreshCw, Upload } from "lucide-react";

import { documentColumns } from "./columns";
import { DataTableWithCard } from "@/components/ui/data-table-with-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import EnhancedPdfUploader from "@/components/EnhancedPdfUploader";

import {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useBulkDeleteDocumentsMutation,
  type Document,
} from "@/lib/features/api/documentApi";
import { useGetLivestreamsQuery } from "@/lib/features/api/livestreamApi";
import { createDocumentSchema } from "@/lib/schemas/document";

// Tham khảo quy tắc phát triển tại .github/development-instructions.md
export default function DocumentsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [vipFilter, setVipFilter] = useState<string>("all");
  const [livestreamFilter, setLivestreamFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPdfUploadDialogOpen, setIsPdfUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );

  // Form state for creating document
  const [formData, setFormData] = useState({
    title: "",
    vip: false,
    livestreamId: "",
  });

  // API queries
  const {
    data: documentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetDocumentsQuery({
    page,
    limit,
    search: searchValue || undefined,
    vip:
      vipFilter === "vip" ? true : vipFilter === "public" ? false : undefined,
    livestreamId:
      livestreamFilter !== "all" ? Number(livestreamFilter) : undefined,
  });

  // Get livestreams for select dropdown
  const { data: livestreamsForSelectResponse } = useGetLivestreamsQuery({
    limit: 100, // Get all livestreams
  });

  // Create document mutation
  const [createDocument, { isLoading: isCreating }] =
    useCreateDocumentMutation();

  // Delete document mutation
  const [deleteDocument, { isLoading: isSingleDeleting }] =
    useDeleteDocumentMutation();
  const [bulkDeleteDocuments, { isLoading: isDeleting }] =
    useBulkDeleteDocumentsMutation();

  // Transform data similar to livestreams page
  const documents = useMemo(() => {
    const result = documentsResponse?.items || [];
    // Debug log to check data structure
    if (result.length > 0) {
      console.log("Sample document data:", result[0]);
    }
    if (documentsResponse?.stats) {
      console.log("Stats from backend:", documentsResponse.stats);
    }
    return result;
  }, [documentsResponse]);

  const pagination = useMemo(
    () => ({
      total: documentsResponse?.pagination?.total || 0,
      totalPages: documentsResponse?.pagination?.lastPage || 0,
      currentPage: documentsResponse?.pagination?.currentPage || 1,
    }),
    [documentsResponse]
  );

  // Use backend filtered data directly, no frontend filtering needed
  const displayData = documents;

  // Calculate stats from current data
  const stats = useMemo(() => {
    // Use stats from backend if available
    if (documentsResponse?.stats) {
      return {
        total: Number(documentsResponse.stats.total) || 0,
        vip: Number(documentsResponse.stats.vip) || 0,
        free: Number(documentsResponse.stats.free) || 0,
        totalDownloads: Number(documentsResponse.stats.totalDownloads) || 0,
      };
    }

    // Fallback calculation
    if (!documents || !Array.isArray(documents)) {
      return { total: 0, vip: 0, free: 0, totalDownloads: 0 };
    }

    const total = pagination.total || 0;
    const vip = documents.filter((doc) => doc?.vip).length;
    const free = documents.filter((doc) => !doc?.vip).length;
    const totalDownloads = documents.reduce(
      (sum, document: Document) => sum + (document?.downloadCount || 0),
      0
    );

    return {
      total: Number(total) || 0,
      vip: Number(vip) || 0,
      free: Number(free) || 0,
      totalDownloads: Number(totalDownloads) || 0,
    };
  }, [documents, pagination.total, documentsResponse?.stats]);

  // Listen for delete document events from columns
  useEffect(() => {
    const handleDeleteDocument = (event: CustomEvent) => {
      const { document } = event.detail;
      setDocumentToDelete(document);
      setIsDeleteDialogOpen(true);
    };

    window.addEventListener(
      "delete-document",
      handleDeleteDocument as EventListener
    );

    return () => {
      window.removeEventListener(
        "delete-document",
        handleDeleteDocument as EventListener
      );
    };
  }, []);

  const handleClearFilters = () => {
    setSearchValue("");
    setVipFilter("all");
    setLivestreamFilter("all");
    setPage(1);
  };

  const handleCreateDocument = async () => {
    try {
      // Validation using Zod schema
      const validationResult = createDocumentSchema.safeParse({
        title: formData.title.trim(),
        vip: formData.vip,
        livestreamId: formData.livestreamId
          ? parseInt(formData.livestreamId)
          : undefined,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError?.message || "Invalid form data");
        return;
      }

      const documentData = {
        title: formData.title.trim(),
        vip: formData.vip,
        livestreamId: formData.livestreamId
          ? parseInt(formData.livestreamId)
          : undefined,
      };

      await createDocument(documentData).unwrap();
      toast.success("Document created successfully!");

      // Reset form and close dialog
      setFormData({
        title: "",
        vip: false,
        livestreamId: "",
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      console.error("Create document error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String((error.data as Record<string, unknown>).message)
          : error && typeof error === "object" && "message" in error
          ? String((error as Record<string, unknown>).message)
          : "Failed to create document";
      toast.error(errorMessage);
    }
  };

  const handlePdfDocumentCreate = async (data: {
    title: string;
    vip: boolean;
    livestreamId: string;
    url: string;
  }) => {
    try {
      // Create document with the enhanced data
      const documentData = {
        title: data.title,
        vip: data.vip,
        livestreamId: data.livestreamId
          ? parseInt(data.livestreamId)
          : undefined,
        url: data.url, // PDF URL from ImageKit
      };

      await createDocument(documentData).unwrap();
      toast.success("PDF document created successfully!");

      setIsPdfUploadDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      console.error("Create document from PDF error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String((error.data as Record<string, unknown>).message)
          : error && typeof error === "object" && "message" in error
          ? String((error as Record<string, unknown>).message)
          : "Failed to create document from PDF";
      toast.error(errorMessage);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete.id).unwrap();
      toast.success("Document deleted successfully!");

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      refetch();
    } catch (error: unknown) {
      console.error("Delete document error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String((error.data as Record<string, unknown>).message)
          : error && typeof error === "object" && "message" in error
          ? String((error as Record<string, unknown>).message)
          : "Failed to delete document";
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async (selectedIds: number[]) => {
    try {
      await bulkDeleteDocuments(selectedIds).unwrap();
      toast.success(`Successfully deleted ${selectedIds.length} document(s)`);
      refetch();
    } catch (error: unknown) {
      console.error("Bulk delete error:", error);
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String((error.data as Record<string, unknown>).message)
          : error && typeof error === "object" && "message" in error
          ? String((error as Record<string, unknown>).message)
          : "Failed to delete documents";
      toast.error(errorMessage);
    }
  };

  // Early returns for loading/error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Documents API Error:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Error Loading Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              There was an error loading the document data. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage document library and learning materials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPdfUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : typeof stats.total === "number"
                ? stats.total
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading
                ? "..."
                : typeof stats.vip === "number"
                ? stats.vip
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Free Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading
                ? "..."
                : typeof stats.free === "number"
                ? stats.free
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading
                ? "..."
                : typeof stats.totalDownloads === "number"
                ? (stats.totalDownloads ?? 0).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Search and filter documents by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select value={vipFilter} onValueChange={setVipFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vip">VIP Only</SelectItem>
                  <SelectItem value="public">Public Only</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={livestreamFilter}
                onValueChange={setLivestreamFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Livestreams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Livestreams</SelectItem>
                  {livestreamsForSelectResponse?.items?.map((livestream) => (
                    <SelectItem
                      key={livestream.id}
                      value={livestream.id.toString()}
                    >
                      {livestream.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchValue ||
                vipFilter !== "all" ||
                livestreamFilter !== "all") && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchValue ||
            vipFilter !== "all" ||
            livestreamFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchValue && (
                <Badge variant="secondary">Search: {searchValue}</Badge>
              )}
              {vipFilter !== "all" && (
                <Badge variant="secondary">
                  Type: {vipFilter === "vip" ? "VIP" : "Public"}
                </Badge>
              )}
              {livestreamFilter !== "all" && (
                <Badge variant="secondary">
                  Livestream:{" "}
                  {livestreamsForSelectResponse?.items?.find(
                    (l) => l.id.toString() === livestreamFilter
                  )?.title || livestreamFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {Array.isArray(displayData) ? displayData.length : 0} of{" "}
          {typeof stats.total === "number" ? stats.total : 0} documents
        </div>
      </div>

      {/* Data Table */}
      <DataTableWithCard
        columns={documentColumns}
        data={displayData}
        loading={isLoading}
        error={
          error
            ? String(
                typeof error === "string"
                  ? error
                  : error && typeof error === "object" && "message" in error
                  ? (error as { message: string }).message
                  : "An unexpected error occurred"
              )
            : null
        }
        pagination={{
          pageIndex: page - 1,
          pageSize: limit,
          pageCount: pagination.totalPages,
          total: pagination.total,
        }}
        onPaginationChange={(updater: unknown) => {
          if (typeof updater === "function") {
            const newState = updater({
              pageIndex: page - 1,
              pageSize: limit,
            }) as { pageIndex: number; pageSize: number };
            setPage(newState.pageIndex + 1);
          }
        }}
        onBulkDelete={handleBulkDelete}
        isDeleting={isDeleting}
      />

      {/* Create Document Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>
              Add a new document to the system. Fill in the document information
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title - Required */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Document title"
                className="col-span-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* VIP Checkbox */}
            <div className="grid grid-cols-4 items-center gap-5">
              <Label htmlFor="vip" className="text-left">
                VIP Document
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="vip"
                  checked={formData.vip}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, vip: !!checked }))
                  }
                />
                <Label htmlFor="vip" className="text-sm">
                  Requires VIP access
                </Label>
              </div>
            </div>

            {/* Livestream */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="livestreamId" className="text-right">
                Livestream
              </Label>
              <Select
                value={
                  formData.livestreamId === "" ? "none" : formData.livestreamId
                }
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    livestreamId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue
                    placeholder="Select livestream (optional)"
                    className="truncate"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No livestream</SelectItem>
                  {livestreamsForSelectResponse?.items?.map((livestream) => (
                    <SelectItem
                      key={livestream.id}
                      value={livestream.id.toString()}
                      className="max-w-full"
                    >
                      <span
                        className="truncate block max-w-[300px]"
                        title={livestream.title}
                      >
                        {livestream.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateDocument}
              disabled={isCreating || !formData.title.trim()}
            >
              {isCreating ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{documentToDelete?.title}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Upload Dialog */}
      <Dialog
        open={isPdfUploadDialogOpen}
        onOpenChange={setIsPdfUploadDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload PDF Document</DialogTitle>
            <DialogDescription>
              Upload a PDF file to create a new document. You can set the title,
              mark as VIP, and assign to a livestream.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <EnhancedPdfUploader
              onDocumentCreate={handlePdfDocumentCreate}
              onUploadError={(error) => {
                toast.error(`PDF upload failed: ${error}`);
              }}
              uploadFolder="documents"
              title="Upload PDF Document"
              livestreams={livestreamsForSelectResponse?.items || []}
              isCreating={isCreating}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
