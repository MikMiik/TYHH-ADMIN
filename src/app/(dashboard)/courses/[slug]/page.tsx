"use client";

import {
  useGetCourseQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
} from "@/lib/features/api/courseApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  DollarSign,
  BookOpen,
  Tag,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import React from "react";
import ThumbnailUploader from "@/components/ThumbnailUploader";
import VideoUploader from "@/components/VideoUploader";

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for upload management
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(
    null
  );
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  // Use slug directly as identifier (BE now supports both ID and slug)
  const courseSlug = slug;

  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useGetCourseQuery(courseSlug);

  const [deleteCourse] = useDeleteCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();

  // Action handlers
  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = async () => {
    if (!course) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteCourse(course.id).unwrap();
      toast.success("Course deleted successfully");
      router.push("/courses"); // Navigate back to courses list
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to delete course"
          : "Failed to delete course";
      toast.error(String(errorMessage));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddOutline = () => {
    // TODO: Open add outline modal
    toast.info("Add outline functionality coming soon");
  };

  const handleManageStudents = () => {
    // TODO: Navigate to student management page
    toast.info("Student management functionality coming soon");
  };

  // Helper function to update course fields
  const updateCourseField = async (
    fieldName: string,
    value: string,
    successMessage: string
  ) => {
    if (!course) return;

    try {
      await updateCourse({
        id: course.id,
        data: { [fieldName]: value },
      }).unwrap();

      toast.success(successMessage);
      // Refetch course data to update UI
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
      // Fallback: return the original URL if parsing fails
      return url;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Course Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The course you&apos;re looking for doesn&apos;t exist or has been
              removed.
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
              {course.title}
            </h1>
            <p className="text-muted-foreground">Course Details & Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Created {format(new Date(course.createdAt), "MMM dd, yyyy")}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={course.isFree ? "secondary" : "default"}>
                    {course.isFree ? "Free" : "Paid"}
                  </Badge>
                  {course.group && (
                    <Badge variant="outline">{course.group}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.description && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>
                </div>
              )}

              {course.purpose && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Purpose</h4>
                  <p className="text-sm text-muted-foreground">
                    {course.purpose}
                  </p>
                </div>
              )}

              {course.content && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Content</h4>
                  <div
                    className="text-sm text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.content }}
                  />
                </div>
              )}

              {/* Media Upload Section */}
              <div className="flex sm:flex-col lg:flex-row gap-4 items-stretch">
                <ThumbnailUploader
                  currentThumbnail={uploadedThumbnail || course.thumbnail}
                  onUploadSuccess={async (url) => {
                    setUploadedThumbnail(url);
                    try {
                      const relativePath = extractImageKitPath(url);
                      await updateCourseField(
                        "thumbnail",
                        relativePath,
                        "Thumbnail updated successfully!"
                      );
                    } catch {
                      // Error already handled in updateCourseField
                      setUploadedThumbnail(null); // Reset on error
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Thumbnail upload failed: ${error}`);
                  }}
                  className="flex-1"
                />

                <VideoUploader
                  currentVideoUrl={uploadedVideo || course.introVideo}
                  onUploadSuccess={async (url) => {
                    setUploadedVideo(url);
                    try {
                      const relativePath = extractImageKitPath(url);
                      await updateCourseField(
                        "introVideo",
                        relativePath,
                        "Intro video updated successfully!"
                      );
                    } catch {
                      // Error already handled in updateCourseField
                      setUploadedVideo(null); // Reset on error
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Video upload failed: ${error}`);
                  }}
                  className="flex-1"
                  uploadFolder="course-intro"
                  title="Intro Video"
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Outlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Course Outlines ({course.outlines?.length || 0})
                </CardTitle>
                <Button size="sm" onClick={handleAddOutline}>
                  Add Outline
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {course.outlines && course.outlines.length > 0 ? (
                <div className="space-y-3">
                  {course.outlines.map((outline, index) => (
                    <div
                      key={outline.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-medium">{outline.title}</h5>
                          <p className="text-xs text-muted-foreground">
                            {outline.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No outlines</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating an outline.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {course.students?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {course.outlines?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Outlines</p>
                </div>
              </div>

              {!course.isFree && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="space-y-1">
                    {course.discount !== undefined &&
                    course.discount !== null &&
                    !isNaN(Number(course.discount)) ? (
                      <>
                        <p className="text-xs line-through text-muted-foreground">
                          {course.price !== undefined &&
                          course.price !== null &&
                          !isNaN(Number(course.price))
                            ? Number(course.price).toLocaleString("vi-VN") + "₫"
                            : "-"}
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {Number(course.discount).toLocaleString("vi-VN")}₫
                        </p>
                      </>
                    ) : (
                      <p className="text-xl font-bold">
                        {course.price !== undefined &&
                        course.price !== null &&
                        !isNaN(Number(course.price))
                          ? Number(course.price).toLocaleString("vi-VN") + "₫"
                          : "-"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">Price</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teacher Info */}
          {course.teacher && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {course.teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{course.teacher.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.teacher.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Topics */}
          {course.topics && course.topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.topics.map((topic) => (
                    <Badge key={topic.id} variant="outline">
                      {topic.title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Students */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Students ({course.students?.length || 0})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManageStudents}
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {course.students && course.students.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {course.students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  {course.students.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{course.students.length - 5} more students
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No students enrolled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
