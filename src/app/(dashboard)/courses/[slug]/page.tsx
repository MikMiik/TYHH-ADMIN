"use client";

import {
  useGetCourseQuery,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
  useRemoveStudentFromCourseMutation,
  useGetTeachersQuery,
  useGetTopicsQuery,
  useUpdateCourseTeacherMutation,
  useUpdateCourseTopicsMutation,
} from "@/lib/features/api/courseApi";
import {
  useCreateCourseOutlineMutation,
  useUpdateCourseOutlineMutation,
  useDeleteCourseOutlineMutation,
  useReorderCourseOutlinesMutation,
} from "@/lib/features/api/courseOutlineApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  GripVertical,
  X,
  UserCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  validateCourseField,
  type UpdateCourseFieldData,
  createCourseOutlineSchema,
} from "@/lib/schemas/course";
import { CourseOutline } from "@/lib/features/api/courseApi";
import React from "react";
import ThumbnailUploader from "@/components/ThumbnailUploader";
import VideoUploader from "@/components/VideoUploader";
import InlineEdit from "@/components/InlineEdit";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Outline Item Component
interface SortableOutlineItemProps {
  outline: CourseOutline;
  index: number;
  onEdit: (outline: CourseOutline) => void;
  onDelete: (outline: CourseOutline) => void;
}

function SortableOutlineItem({
  outline,
  index,
  onEdit,
  onDelete,
}: SortableOutlineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: outline.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-lg gap-3 bg-background"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="font-medium text-sm truncate">{outline.title}</h5>
          <p className="text-xs text-muted-foreground truncate">
            {outline.slug}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(outline)}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onDelete(outline)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const { slug } = React.use(params);
  const [isDeleting, setIsDeleting] = useState(false);

  // Outline management state
  const [isAddOutlineDialogOpen, setIsAddOutlineDialogOpen] = useState(false);
  const [newOutlineTitle, setNewOutlineTitle] = useState("");
  const [isCreatingOutline, setIsCreatingOutline] = useState(false);

  // Edit/Delete outline state
  const [isEditOutlineDialogOpen, setIsEditOutlineDialogOpen] = useState(false);
  const [editingOutline, setEditingOutline] = useState<CourseOutline | null>(
    null
  );
  const [editOutlineTitle, setEditOutlineTitle] = useState("");
  const [isUpdatingOutline, setIsUpdatingOutline] = useState(false);
  const [isDeleteOutlineDialogOpen, setIsDeleteOutlineDialogOpen] =
    useState(false);
  const [deletingOutline, setDeletingOutline] = useState<CourseOutline | null>(
    null
  );
  const [isDeletingOutline, setIsDeletingOutline] = useState(false);

  // State for upload management
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(
    null
  );
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  // State for topic selection
  const [selectedTopicValue, setSelectedTopicValue] = useState<string>("");

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
  const [createCourseOutline] = useCreateCourseOutlineMutation();
  const [updateCourseOutline] = useUpdateCourseOutlineMutation();
  const [deleteCourseOutline] = useDeleteCourseOutlineMutation();
  const [reorderCourseOutlines] = useReorderCourseOutlinesMutation();
  const [removeStudentFromCourse] = useRemoveStudentFromCourseMutation();
  const [updateCourseTeacher] = useUpdateCourseTeacherMutation();
  const [updateCourseTopics] = useUpdateCourseTopicsMutation();

  // Fetch teachers and topics data
  const { data: teachers = [] } = useGetTeachersQuery();
  const { data: topics = [] } = useGetTopicsQuery();

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Action handlers
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
    setIsAddOutlineDialogOpen(true);
  };

  const handleCreateOutline = async () => {
    if (!course || !newOutlineTitle.trim()) {
      toast.error("Please enter outline title");
      return;
    }

    // Frontend validation
    const validationResult = createCourseOutlineSchema.safeParse({
      title: newOutlineTitle.trim(),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(firstError?.message || "Invalid outline data");
      return;
    }

    setIsCreatingOutline(true);
    try {
      await createCourseOutline({
        courseId: course.id,
        title: newOutlineTitle.trim(),
      }).unwrap();

      toast.success("Course outline created successfully!");
      setNewOutlineTitle("");
      setIsAddOutlineDialogOpen(false);
      refetch(); // Refresh course data to show new outline
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to create outline";
      toast.error(errorMessage);
    } finally {
      setIsCreatingOutline(false);
    }
  };

  // Handle drag end for reordering outlines
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    if (!course?.outlines) return;

    const oldIndex = course.outlines.findIndex((item) => item.id === active.id);
    const newIndex = course.outlines.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Create new order array
    const reorderedOutlines = arrayMove(course.outlines, oldIndex, newIndex);

    // Create orders payload for API
    const orders = reorderedOutlines.map((outline, index) => ({
      id: outline.id,
      order: index + 1,
    }));

    try {
      await reorderCourseOutlines({
        courseId: course.id,
        data: { orders },
      }).unwrap();

      toast.success("Outlines reordered successfully!");
      refetch(); // Refresh to get updated order
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to reorder outlines";
      toast.error(errorMessage);
    }
  };

  // Handle remove student from course
  const handleRemoveStudent = async (
    studentId: number,
    studentName: string
  ) => {
    if (!course?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove "${studentName}" from this course?`
    );

    if (!confirmed) return;

    try {
      await removeStudentFromCourse({
        courseId: course.id,
        userId: studentId,
      }).unwrap();

      toast.success(`${studentName} has been removed from the course`);
      refetch(); // Refresh course data to update student list
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to remove student";
      toast.error(errorMessage);
    }
  };

  // Handle edit outline
  const handleEditOutline = (outline: CourseOutline) => {
    setEditingOutline(outline);
    setEditOutlineTitle(outline.title);
    setIsEditOutlineDialogOpen(true);
  };

  const handleUpdateOutline = async () => {
    if (!editingOutline || !editOutlineTitle.trim()) {
      toast.error("Please enter outline title");
      return;
    }

    // Frontend validation
    const validationResult = createCourseOutlineSchema.safeParse({
      title: editOutlineTitle.trim(),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error(firstError?.message || "Invalid outline data");
      return;
    }

    setIsUpdatingOutline(true);
    try {
      await updateCourseOutline({
        id: editingOutline.id,
        data: { title: editOutlineTitle.trim() },
      }).unwrap();

      toast.success("Course outline updated successfully!");
      setEditOutlineTitle("");
      setEditingOutline(null);
      setIsEditOutlineDialogOpen(false);

      // Refresh course data (outline slug may have changed)
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to update outline";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingOutline(false);
    }
  };

  // Handle delete outline
  const handleDeleteOutline = (outline: CourseOutline) => {
    setDeletingOutline(outline);
    setIsDeleteOutlineDialogOpen(true);
  };

  const handleConfirmDeleteOutline = async () => {
    if (!deletingOutline) return;

    setIsDeletingOutline(true);
    try {
      await deleteCourseOutline(deletingOutline.id).unwrap();

      toast.success("Course outline deleted successfully!");
      setDeletingOutline(null);
      setIsDeleteOutlineDialogOpen(false);
      refetch(); // Refresh course data
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to delete outline";
      toast.error(errorMessage);
    } finally {
      setIsDeletingOutline(false);
    }
  };

  // Handle teacher change (direct update)
  const handleTeacherChange = async (value: string) => {
    if (!course?.id) return;

    const teacherId = value === "none" ? null : parseInt(value);

    try {
      await updateCourseTeacher({
        courseId: course.id,
        teacherId,
      }).unwrap();

      toast.success("Course teacher updated successfully!");
      refetch(); // Refresh course data
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to update teacher";
      toast.error(errorMessage);
    }
  };

  // Handle add topic (direct update)
  const handleAddTopic = async (topicIdStr: string) => {
    if (!course?.id) return;

    const topicId = parseInt(topicIdStr);
    const currentTopicIds = course.topics?.map((t) => t.id) || [];
    const newTopicIds = [...currentTopicIds, topicId];

    try {
      await updateCourseTopics({
        courseId: course.id,
        topicIds: newTopicIds,
      }).unwrap();

      toast.success("Topic added successfully!");
      setSelectedTopicValue(""); // Reset select value
      refetch(); // Refresh course data
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to add topic";
      toast.error(errorMessage);
    }
  };

  // Handle remove topic (direct update)
  const handleRemoveTopic = async (topicId: number) => {
    if (!course?.id) return;

    const currentTopicIds = course.topics?.map((t) => t.id) || [];
    const newTopicIds = currentTopicIds.filter((id) => id !== topicId);

    try {
      await updateCourseTopics({
        courseId: course.id,
        topicIds: newTopicIds,
      }).unwrap();

      toast.success("Topic removed successfully!");
      refetch(); // Refresh course data
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String(error.data.message)
          : "Failed to remove topic";
      toast.error(errorMessage);
    }
  };

  // Helper function to update course fields
  const updateCourseField = async (
    fieldName: string,
    value: string | number,
    successMessage: string
  ) => {
    if (!course) return;

    try {
      // Convert string numbers to actual numbers for numeric fields
      let processedValue: string | number = value;
      if (fieldName === "price" || fieldName === "discount") {
        processedValue =
          typeof value === "string" ? parseFloat(value) || 0 : value;
      }

      // Frontend validation - only for supported fields
      const supportedFields: (keyof UpdateCourseFieldData)[] = [
        "title",
        "description",
        "purpose",
        "content",
        "group",
        "price",
        "discount",
        "thumbnail",
        "introVideo",
      ];

      if (supportedFields.includes(fieldName as keyof UpdateCourseFieldData)) {
        const validationResult = validateCourseField(
          fieldName as keyof UpdateCourseFieldData,
          processedValue
        );
        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0];
          const errorMessage = firstError?.message || "Dữ liệu không hợp lệ";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      }

      const updateResult = await updateCourse({
        id: course.id,
        data: { [fieldName]: processedValue },
      }).unwrap();

      toast.success(successMessage);

      // If title was updated, redirect to new slug
      if (
        fieldName === "title" &&
        updateResult?.slug &&
        updateResult.slug !== course.slug
      ) {
        toast.success("Đang chuyển hướng đến đường dẫn mới...");
        router.push(`/courses/${updateResult.slug}`);
        return;
      }

      // Refetch course data to update UI
      refetch();
    } catch (error) {
      // Handle different types of errors
      if (
        error instanceof Error &&
        error.message.includes("Dữ liệu không hợp lệ")
      ) {
        // This is already a formatted validation error - don't reformat
        return; // Error already shown in toast above
      }

      // Handle API errors
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
              <Button variant="outline" onClick={() => router.push("/courses")}>
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
  console.log(topics);
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Page Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/courses")}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">
              {course.title}
            </h1>
            <p className="text-muted-foreground text-sm">
              Course Details & Management
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6 min-w-0">
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4 p-4 lg:p-6">
              {/* Title - Inline Edit */}
              <div>
                <h4 className="font-medium text-sm mb-2">Title</h4>
                <InlineEdit
                  value={course.title}
                  onSave={async (value) => {
                    await updateCourseField(
                      "title",
                      value,
                      "Title updated successfully!"
                    );
                  }}
                  type="text"
                  placeholder="Enter course title..."
                />
              </div>

              {/* Description - Inline Edit */}
              <div>
                <h4 className="font-medium text-sm mb-2">Description</h4>
                <InlineEdit
                  value={course.description}
                  onSave={async (value) => {
                    await updateCourseField(
                      "description",
                      value,
                      "Description updated successfully!"
                    );
                  }}
                  type="textarea"
                  placeholder="Add course description..."
                />
              </div>

              {/* Purpose - Inline Edit */}
              <div>
                <h4 className="font-medium text-sm mb-2">Purpose</h4>
                <InlineEdit
                  value={course.purpose}
                  onSave={async (value) => {
                    await updateCourseField(
                      "purpose",
                      value,
                      "Purpose updated successfully!"
                    );
                  }}
                  type="textarea"
                  placeholder="Add course purpose..."
                />
              </div>

              {/* Content - Inline Edit */}
              <div>
                <h4 className="font-medium text-sm mb-2">Content</h4>
                <InlineEdit
                  value={course.content}
                  onSave={async (value) => {
                    await updateCourseField(
                      "content",
                      value,
                      "Content updated successfully!"
                    );
                  }}
                  type="textarea"
                  placeholder="Add course content..."
                />
              </div>

              {/* Group - Inline Edit */}
              <div>
                <h4 className="font-medium text-sm mb-2">Group</h4>
                <InlineEdit
                  value={course.group || ""}
                  onSave={async (value) => {
                    await updateCourseField(
                      "group",
                      value,
                      "Group updated successfully!"
                    );
                  }}
                  type="text"
                  placeholder="Add course group..."
                />
              </div>

              {/* Media Upload Section */}
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch">
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
                  uploadFolder="course-thumbnails"
                  title="Course Thumbnail"
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={course.outlines.map((outline) => outline.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {course.outlines.map((outline, index) => (
                        <SortableOutlineItem
                          key={outline.id}
                          outline={outline}
                          index={index}
                          onEdit={handleEditOutline}
                          onDelete={handleDeleteOutline}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
        <div className="space-y-4 lg:space-y-6 min-w-0">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4 p-4 lg:p-6">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
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

          {/* Price Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div>
                <h4 className="font-medium text-sm mb-2">Price (VND)</h4>
                <InlineEdit
                  value={
                    Number(course.price)?.toLocaleString("vi-VN") + "₫" || ""
                  }
                  onSave={async (value) => {
                    const numericValue = parseFloat(value) || 0;
                    await updateCourseField(
                      "price",
                      numericValue,
                      "Price updated successfully!"
                    );
                  }}
                  type="number"
                  placeholder="Enter price in VND..."
                />
              </div>

              {/* Discount */}
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Discount Price (VND)
                </h4>
                <InlineEdit
                  value={
                    Number(course.discount)?.toLocaleString("vi-VN") + "₫" || ""
                  }
                  onSave={async (value) => {
                    const numericValue = parseFloat(value) || 0;
                    await updateCourseField(
                      "discount",
                      numericValue,
                      "Discount updated successfully!"
                    );
                  }}
                  type="number"
                  placeholder="Enter discount price..."
                />
              </div>

              {/* Free Course Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Free Course</span>
                <Badge variant={course.isFree ? "secondary" : "default"}>
                  {course.isFree ? "Free" : "Paid"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="teacher-select">Assign Teacher</Label>
                <Select
                  value={course.teacherId?.toString() || "none"}
                  onValueChange={handleTeacherChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No teacher</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{teacher.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {teacher.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {course.teacher && (
                  <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {course.teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {course.teacher.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.teacher.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Tag className="mr-2 h-5 w-5" />
                Topics ({course.topics?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.topics && course.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {course.topics.map((topic) => (
                      <div key={topic.id} className="flex items-center gap-1">
                        <Badge variant="outline" className="pr-1">
                          <span>{topic.title}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveTopic(topic.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Topic Section */}
                <div className="space-y-2">
                  <Label>Add Topic</Label>
                  <Select
                    value={selectedTopicValue}
                    onValueChange={(value) => {
                      setSelectedTopicValue(value);
                      handleAddTopic(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(topics || [])
                        .filter(
                          (topic) =>
                            !course.topics?.some((ct) => ct.id === topic.id)
                        )
                        .map((topic) => (
                          <SelectItem
                            key={topic.id}
                            value={topic.id.toString()}
                          >
                            {topic.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {(topics || []).filter(
                    (topic) => !course.topics?.some((ct) => ct.id === topic.id)
                  ).length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      All available topics have been added to this course.
                    </p>
                  )}
                </div>

                {course.topics?.length === 0 && topics.length === 0 && (
                  <div className="text-center py-4">
                    <Tag className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No topics available. Create topics first.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Students ({course.students?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.students && course.students.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {course.students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 border rounded group hover:border-primary/30 transition-colors"
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
                      <Link
                        href={`/users/${student.username}`}
                        className="flex-1 min-w-0 hover:text-primary transition-colors"
                      >
                        <p className="text-sm font-medium truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() =>
                          handleRemoveStudent(student.id, student.name)
                        }
                        title={`Remove ${student.name} from course`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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

      {/* Add Outline Dialog */}
      <Dialog
        open={isAddOutlineDialogOpen}
        onOpenChange={setIsAddOutlineDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course Outline</DialogTitle>
            <DialogDescription>
              Create a new outline section for this course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="outline-title" className="mb-2">
                Outline Title
              </Label>
              <Input
                id="outline-title"
                placeholder="Enter outline title..."
                value={newOutlineTitle}
                onChange={(e) => setNewOutlineTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newOutlineTitle.trim()) {
                    handleCreateOutline();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOutlineDialogOpen(false);
                setNewOutlineTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOutline}
              disabled={isCreatingOutline || !newOutlineTitle.trim()}
            >
              {isCreatingOutline ? "Creating..." : "Create Outline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Outline Dialog */}
      <Dialog
        open={isEditOutlineDialogOpen}
        onOpenChange={setIsEditOutlineDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course Outline</DialogTitle>
            <DialogDescription>
              Update the outline title for this course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-outline-title">Outline Title</Label>
              <Input
                id="edit-outline-title"
                placeholder="Enter outline title..."
                value={editOutlineTitle}
                onChange={(e) => setEditOutlineTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editOutlineTitle.trim()) {
                    handleUpdateOutline();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOutlineDialogOpen(false);
                setEditOutlineTitle("");
                setEditingOutline(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOutline}
              disabled={isUpdatingOutline || !editOutlineTitle.trim()}
            >
              {isUpdatingOutline ? "Updating..." : "Update Outline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Outline Dialog */}
      <Dialog
        open={isDeleteOutlineDialogOpen}
        onOpenChange={setIsDeleteOutlineDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course Outline</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingOutline?.title}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOutlineDialogOpen(false);
                setDeletingOutline(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteOutline}
              disabled={isDeletingOutline}
            >
              {isDeletingOutline ? "Deleting..." : "Delete Outline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
