"use client";

import {
  useGetLivestreamQuery,
  useDeleteLivestreamMutation,
  useUpdateLivestreamMutation,
  type UpdateLivestreamData,
} from "@/lib/features/api/livestreamApi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import LocalVideoUploader from "@/components/LocalVideoUploader";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React from "react";
import Link from "next/link";
import { useGetCoursesQuery } from "@/lib/features/api/courseApi";
import { updateLivestreamSchema } from "@/lib/schemas/livestream";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourseOutlines, setSelectedCourseOutlines] = useState<
    Array<{ id: number; title: string }>
  >([]);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    courseId: "",
    courseOutlineId: "",
  });

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

  // Get courses for edit dropdown
  const { data: coursesForSelectResponse } = useGetCoursesQuery({
    limit: 100, // Get all courses
  });

  // Populate edit form when livestream data is loaded
  useEffect(() => {
    if (livestream) {
      setEditFormData({
        title: livestream.title || "",
        courseId: livestream.courseId?.toString() || "",
        courseOutlineId: livestream.courseOutlineId?.toString() || "",
      });
    }
  }, [livestream]);

  // Update course outlines when course is selected in edit form
  useEffect(() => {
    if (editFormData.courseId) {
      const selectedCourse = coursesForSelectResponse?.courses?.find(
        (course) => course.id.toString() === editFormData.courseId
      );

      if (selectedCourse?.outlines && selectedCourse.outlines.length > 0) {
        setSelectedCourseOutlines(
          selectedCourse.outlines.map((outline) => ({
            id: outline.id,
            title: outline.title,
          }))
        );
      } else {
        setSelectedCourseOutlines([]);
      }
    } else {
      setSelectedCourseOutlines([]);
    }
  }, [editFormData.courseId, coursesForSelectResponse?.courses]);

  // Action handlers
  const handleEdit = () => {
    setIsEditDialogOpen(true);
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
    const videoUrl = `${process.env.NEXT_PUBLIC_CLIENT_URL}/livestreams/${livestream?.slug}`;
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  const handleUpdateLivestream = async () => {
    if (!livestream) return;

    try {
      // Build update data object with only changed fields
      const updateData: UpdateLivestreamData = {};

      if (editFormData.title.trim() !== livestream.title) {
        updateData.title = editFormData.title.trim();
      }

      if (editFormData.courseId !== livestream.courseId?.toString()) {
        updateData.courseId = parseInt(editFormData.courseId);
      }

      if (
        editFormData.courseOutlineId !== livestream.courseOutlineId?.toString()
      ) {
        updateData.courseOutlineId = parseInt(editFormData.courseOutlineId);
      }

      // If no changes, show message and return
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to update");
        return;
      }

      // Validation using Zod schema
      const validationResult = updateLivestreamSchema.safeParse(updateData);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError?.message || "Invalid form data");
        return;
      }

      await updateLivestream({
        id: livestream.id,
        data: updateData,
      }).unwrap();

      toast.success("Livestream updated successfully!");

      // Close dialog and refetch data
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      console.error("Update livestream error:", error);
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
          : "Failed to update livestream";
      toast.error(errorMessage);
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
                <LocalVideoUploader
                  currentVideoUrl={uploadedVideo || livestream.url}
                  onUploadSuccess={async (response) => {
                    setUploadedVideo(response.filePath);
                    try {
                      await updateLivestreamField(
                        "url",
                        response.filePath,
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
                  title="Livestream Video"
                  fileName="livestream"
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
                          Outline • {livestream.courseOutline.slug}
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
                  {(livestream?.view ?? 0).toLocaleString()}
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
                  <span className="text-muted-foreground">Outline ID:</span>
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
        </div>
      </div>

      {/* Edit Livestream Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Livestream</DialogTitle>
            <DialogDescription>
              Update the livestream information. Make sure all required fields
              are filled.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title - Required */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Title *
              </Label>
              <Input
                id="edit-title"
                placeholder="Livestream title"
                className="col-span-3"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            {/* Course */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-courseId" className="text-right">
                Course *
              </Label>
              <Select
                value={editFormData.courseId}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    courseId: value,
                    courseOutlineId: "", // Reset outline when course changes
                  }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue
                    placeholder="Select course"
                    className="truncate"
                  />
                </SelectTrigger>
                <SelectContent>
                  {coursesForSelectResponse?.courses?.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id.toString()}
                      className="max-w-full"
                    >
                      <span
                        className="truncate block max-w-[300px]"
                        title={course.title}
                      >
                        {course.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Outline */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-courseOutlineId" className="text-right">
                Outline *
              </Label>
              <Select
                value={editFormData.courseOutlineId}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    courseOutlineId: value,
                  }))
                }
                disabled={
                  !editFormData.courseId || selectedCourseOutlines.length === 0
                }
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue
                    placeholder="Select course outline"
                    className="truncate"
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedCourseOutlines.map((outline) => (
                    <SelectItem
                      key={outline.id}
                      value={outline.id.toString()}
                      className="max-w-full"
                    >
                      <span
                        className="truncate block max-w-[300px]"
                        title={outline.title}
                      >
                        {outline.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editFormData.courseId && selectedCourseOutlines.length === 0 && (
                <p className="col-span-3 text-xs text-muted-foreground">
                  No outlines available for selected course.
                </p>
              )}
              {!editFormData.courseId && (
                <p className="col-span-3 text-xs text-muted-foreground">
                  Please select a course first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLivestream}
              disabled={
                !editFormData.title.trim() ||
                !editFormData.courseId ||
                !editFormData.courseOutlineId
              }
            >
              Update Livestream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
