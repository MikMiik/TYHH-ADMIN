"use client";

import {
  useGetLivestreamQuery,
  useDeleteLivestreamMutation,
  useUpdateLivestreamMutation,
} from "@/lib/features/api/livestreamApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import VideoUploader from "@/components/VideoUploader";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Video,
  Eye,
  PlayCircle,
  BookOpen,
  Calendar,
  ExternalLink,
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

interface LivestreamDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function LivestreamDetailPage({
  params,
}: LivestreamDetailPageProps) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  // Use slug directly as identifier (BE supports slug)
  const livestreamSlug = slug;

  const {
    data: livestream,
    isLoading,
    error,
    refetch,
  } = useGetLivestreamQuery(livestreamSlug);

  const [deleteLivestream] = useDeleteLivestreamMutation();
  const [updateLivestream] = useUpdateLivestreamMutation();

  // Action handlers
  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = async () => {
    if (!livestream) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${livestream.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteLivestream(livestream.id).unwrap();
      toast.success("Livestream deleted successfully");
      router.push("/livestreams"); // Navigate back to livestreams list
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to delete livestream"
          : "Failed to delete livestream";
      toast.error(String(errorMessage));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWatchVideo = () => {
    if (livestream?.url) {
      window.open(livestream.url, "_blank", "noopener,noreferrer");
    }
  };

  // Helper function to update livestream fields
  const updateLivestreamField = async (
    fieldName: string,
    value: string,
    successMessage: string
  ) => {
    if (!livestream) return;

    try {
      await updateLivestream({
        id: livestream.id,
        data: { [fieldName]: value },
      }).unwrap();

      toast.success(successMessage);
      // Refetch livestream data to update UI
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
          <p className="text-sm text-muted-foreground">Loading livestream...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !livestream) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Livestream Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The livestream you&apos;re looking for doesn&apos;t exist or has
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
              {livestream.title}
            </h1>
            <p className="text-muted-foreground">
              Livestream Details & Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {livestream.url && (
            <Button variant="outline" size="sm" onClick={handleWatchVideo}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Watch Video
            </Button>
          )}
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
          {/* Livestream Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {livestream.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      Created{" "}
                      {format(new Date(livestream.createdAt), "MMM dd, yyyy")}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="outline" className="text-xs">
                    Slug: {livestream.slug}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Upload and Player */}
              <div className="space-y-4">
                <VideoUploader
                  currentVideoUrl={uploadedVideo || livestream.url}
                  onUploadSuccess={async (url) => {
                    setUploadedVideo(url);
                    try {
                      const relativePath = extractImageKitPath(url);
                      await updateLivestreamField(
                        "url",
                        relativePath,
                        "Livestream video updated successfully!"
                      );
                    } catch {
                      // Error already handled in updateLivestreamField
                      setUploadedVideo(null); // Reset on error
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Video upload failed: ${error}`);
                  }}
                  className="w-full"
                  uploadFolder="livestreams"
                  title="Livestream Video"
                />
              </div>

              {/* Video URL */}
              {livestream.url && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Video URL
                  </h4>
                  <div className="p-3 bg-muted rounded border">
                    <a
                      href={
                        process.env.NEXT_PUBLIC_CLIENT_URL +
                        "/livestreams/" +
                        livestream.slug
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {process.env.NEXT_PUBLIC_CLIENT_URL +
                        "/livestreams/" +
                        livestream.slug}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Context */}
          {livestream.course && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Course Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{livestream.course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Course • {livestream.course.slug}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/courses/${livestream.course.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Course
                  </Link>
                </div>

                {livestream.courseOutline && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-secondary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {livestream.courseOutline.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Chapter • {livestream.courseOutline.slug}
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
                <Eye className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {livestream.view.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </CardContent>
          </Card>

          {/* Livestream Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{livestream.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground mr-4">Slug:</span>
                  <span className="font-mono text-xs">{livestream.slug}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Course ID:</span>
                  <span className="font-mono">{livestream.courseId}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chapter ID:</span>
                  <span className="font-mono">
                    {livestream.courseOutlineId}
                  </span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-xs">
                      {format(
                        new Date(livestream.createdAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-muted-foreground">Updated:</span>
                    <span className="text-xs">
                      {format(
                        new Date(livestream.updatedAt),
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
              {livestream.url && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleWatchVideo}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch Video
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Livestream
              </Button>

              {livestream.course && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/courses/${livestream.course.slug}`}>
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
                {isDeleting ? "Deleting..." : "Delete Livestream"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
