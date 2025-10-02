"use client";

import {
  useGetCourseOutlineQuery,
  useDeleteCourseOutlineMutation,
  useUpdateCourseOutlineMutation,
} from "@/lib/features/api/courseOutlineApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Play,
  Eye,
  Calendar,
  Hash,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import React from "react";

interface CourseOutlineDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseOutlineDetailPage({
  params,
}: CourseOutlineDetailPageProps) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: "",
  });

  // Use slug directly as identifier (BE supports slug)
  const outlineSlug = slug;

  const {
    data: outline,
    isLoading,
    error,
    refetch,
  } = useGetCourseOutlineQuery(outlineSlug);

  const [deleteOutline] = useDeleteCourseOutlineMutation();
  const [updateOutline] = useUpdateCourseOutlineMutation();

  // Populate edit form when outline data is loaded
  useEffect(() => {
    if (outline) {
      setEditFormData({
        title: outline.title || "",
      });
    }
  }, [outline]);

  // Action handlers
  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!outline) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${outline.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteOutline(outline.id).unwrap();
      toast.success("Course outline deleted successfully");
      router.push("/course-outlines"); // Navigate back to outlines list
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to delete course outline"
          : "Failed to delete course outline";
      toast.error(String(errorMessage));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateOutline = async () => {
    if (!outline) return;

    try {
      // If no changes, show message and return
      if (editFormData.title.trim() === outline.title) {
        toast.info("No changes to update");
        return;
      }

      await updateOutline({
        id: outline.id,
        data: { title: editFormData.title.trim() },
      }).unwrap();

      toast.success("Course outline updated successfully");
      setIsEditDialogOpen(false);
      refetch(); // Refresh outline data
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to update course outline"
          : "Failed to update course outline";
      toast.error(String(errorMessage));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">
              Loading course outline...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !outline) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">
              Course outline not found
            </h3>
            <p className="mt-1 text-muted-foreground">
              The course outline you are looking for does not exist or has been
              deleted.
            </p>
            <Button asChild className="mt-4">
              <Link href="/course-outlines">Back to Course Outlines</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/course-outlines">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course Outlines
            </Link>
          </Button>
          <div className="h-6 border-l border-border" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {outline.title}
            </h1>
            <p className="text-muted-foreground">
              Course Outline from {outline.course?.title}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleEdit} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Main Content */}
        <div>
          {/* Course Outline Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Outline Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Title
                  </Label>
                  <p className="text-lg font-medium">{outline.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Slug
                  </Label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {outline.slug}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Order
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span className="text-lg font-medium">{outline.order}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Course
                  </Label>
                  <Link
                    href={`/courses/${outline.course?.slug}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {outline.course?.title}
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Created At
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(outline.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(outline.updatedAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Livestreams Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Related Livestreams</span>
                </div>
                <Badge variant="secondary">
                  {outline.livestreams?.length || 0} streams
                </Badge>
              </CardTitle>
              <CardDescription>
                Livestreams associated with this course outline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outline.livestreams && outline.livestreams.length > 0 ? (
                <div className="space-y-3">
                  {outline.livestreams.map((livestream) => (
                    <div
                      key={livestream.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{livestream.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{livestream.view || 0} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/livestreams/${livestream.slug}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No livestreams</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This outline doesn&apos;t have any livestreams yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course Outline</DialogTitle>
            <DialogDescription>
              Update the course outline information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter outline title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOutline}>Update Outline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
