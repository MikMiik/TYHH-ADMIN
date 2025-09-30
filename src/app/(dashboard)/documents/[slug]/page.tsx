"use client";

import {
  useGetDocumentQuery,
  useDeleteDocumentMutation,
  useUpdateDocumentMutation,
} from "@/lib/features/api/documentApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ThumbnailUploader from "@/components/ThumbnailUploader";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Download,
  Star,
  BookOpen,
  Video,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React from "react";
import Link from "next/link";

interface DocumentDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(
    null
  );

  // Use slug directly as identifier (BE supports both ID and slug)
  const documentSlug = slug;

  const {
    data: document,
    isLoading,
    error,
    refetch,
  } = useGetDocumentQuery(documentSlug);

  const [deleteDocument] = useDeleteDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();

  // Action handlers
  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = async () => {
    if (!document) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteDocument(document.id).unwrap();
      toast.success("Document deleted successfully");
      router.push("/documents"); // Navigate back to documents list
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to delete document"
          : "Failed to delete document";
      toast.error(String(errorMessage));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    toast.info("Download functionality coming soon");
  };

  // Helper function to update document fields
  const updateDocumentField = async (
    fieldName: string,
    value: string,
    successMessage: string
  ) => {
    if (!document) return;

    try {
      await updateDocument({
        id: document.id,
        data: { [fieldName]: value },
      }).unwrap();

      toast.success(successMessage);
      // Refetch document data to update UI
      refetch();
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            `Failed to update ${fieldName}`
          : `Failed to update ${fieldName}`;
      toast.error(String(errorMessage));
      throw error; // Re-throw to handle in upload components
    }
  };

  // Helper function to extract relative path from ImageKit URL
  const extractImageKitPath = (url: string): string => {
    try {
      // ImageKit URL format: https://ik.imagekit.io/your-id/folder/filename.ext
      const urlObj = new URL(url);
      // Extract path and remove leading slash
      const path = urlObj.pathname.substring(1);
      // Remove the ImageKit ID prefix if it exists
      const pathParts = path.split("/");
      if (pathParts.length > 1) {
        // Skip the first part (ImageKit ID) and join the rest
        return pathParts.slice(1).join("/");
      }
      return path;
    } catch (error) {
      console.error("Error extracting ImageKit path:", error);
      return url; // Fallback to original URL
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Document Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The document you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {document.title || "Untitled Document"}
            </h1>
            <p className="text-muted-foreground">
              Document Details & Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {document.title || "Untitled Document"}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      Created{" "}
                      {format(new Date(document.createdAt), "MMM dd, yyyy")}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge
                    variant={document.vip ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {document.vip ? (
                      <>
                        <Star className="mr-1 h-3 w-3" />
                        VIP Document
                      </>
                    ) : (
                      "Public Document"
                    )}
                  </Badge>
                  {document.slug && (
                    <Badge variant="outline" className="text-xs">
                      Slug: {document.slug}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Thumbnail Upload */}
              <div className="space-y-4">
                <ThumbnailUploader
                  currentThumbnail={uploadedThumbnail || document.thumbnail}
                  onUploadSuccess={async (url) => {
                    setUploadedThumbnail(url);
                    try {
                      const relativePath = extractImageKitPath(url);
                      await updateDocumentField(
                        "thumbnail",
                        relativePath,
                        "Document thumbnail updated successfully!"
                      );
                    } catch {
                      // Error already handled in updateDocumentField
                      setUploadedThumbnail(null); // Reset on error
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Thumbnail upload failed: ${error}`);
                  }}
                  className="w-full"
                  uploadFolder="doc-thumbnails"
                  title="Document Thumbnail"
                />
              </div>
            </CardContent>
          </Card>

          {/* Livestream Context */}
          {document.livestream && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="mr-2 h-5 w-5" />
                  Related Livestream
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {document.livestream.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Livestream • {document.livestream.slug}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/livestreams/${document.livestream.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Livestream
                  </Link>
                </div>

                {/* Course Context */}
                {document.livestream.course && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-secondary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {document.livestream.course.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Course • {document.livestream.course.slug}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/courses/${document.livestream.course.slug}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Course
                    </Link>
                  </div>
                )}

                {/* Chapter Context */}
                {document.livestream.courseOutline && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-accent/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {document.livestream.courseOutline.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Chapter • {document.livestream.courseOutline.slug}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Download className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {document.downloadCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{document.id}</span>
                </div>

                {document.slug && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Slug:</span>
                    <span className="font-mono text-xs">{document.slug}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge
                    variant={document.vip ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {document.vip ? "VIP" : "Public"}
                  </Badge>
                </div>

                {document.livestreamId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Livestream ID:
                    </span>
                    <span className="font-mono">{document.livestreamId}</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-xs">
                      {format(
                        new Date(document.createdAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-xs">
                      {format(
                        new Date(document.updatedAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Document
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Document
              </Button>

              {document.livestream && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/livestreams/${document.livestream.slug}`}>
                    <Video className="mr-2 h-4 w-4" />
                    View Livestream
                  </Link>
                </Button>
              )}

              {document.livestream?.course && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/courses/${document.livestream.course.slug}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Course
                  </Link>
                </Button>
              )}

              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Document"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
