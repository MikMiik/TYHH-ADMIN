"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

import { livestreamColumns } from "./columns";
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

import {
  useGetLivestreamsQuery,
  useCreateLivestreamMutation,
  useDeleteLivestreamMutation,
  type Livestream,
} from "@/lib/features/api/livestreamApi";
import { useGetCoursesQuery } from "@/lib/features/api/courseApi";
import { createLivestreamSchema } from "@/lib/schemas/livestream";

// Tham khảo quy tắc phát triển tại .github/development-instructions.md
export default function LivestreamsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [livestreamToDelete, setLivestreamToDelete] =
    useState<Livestream | null>(null);
  const [selectedCourseOutlines, setSelectedCourseOutlines] = useState<
    Array<{ id: number; title: string }>
  >([]);

  // Form state for creating livestream
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    courseOutlineId: "",
  });

  // API queries
  const {
    data: livestreamsResponse,
    isLoading,
    error,
    refetch,
  } = useGetLivestreamsQuery({
    page,
    limit,
    search: searchValue || undefined,
    courseId: topicFilter !== "all" ? Number(topicFilter) : undefined,
  });

  // Get courses for select dropdown
  const { data: coursesForSelectResponse } = useGetCoursesQuery({
    limit: 100, // Get all courses
  });

  // Create livestream mutation
  const [createLivestream, { isLoading: isCreating }] =
    useCreateLivestreamMutation();

  // Delete livestream mutation
  const [deleteLivestream, { isLoading: isDeleting }] =
    useDeleteLivestreamMutation();

  // Transform data similar to courses page
  const livestreams = useMemo(() => {
    const result = livestreamsResponse?.items || [];
    // Debug log to check data structure
    if (result.length > 0) {
      console.log("Sample livestream data:", result[0]);
    }
    if (livestreamsResponse?.stats) {
      console.log("Stats from backend:", livestreamsResponse.stats);
    }
    return result;
  }, [livestreamsResponse]);
  const pagination = useMemo(
    () => ({
      total: livestreamsResponse?.pagination?.total || 0,
      totalPages: livestreamsResponse?.pagination?.lastPage || 0,
      currentPage: livestreamsResponse?.pagination?.currentPage || 1,
    }),
    [livestreamsResponse]
  );

  // Use backend filtered data directly, no frontend filtering needed
  const displayData = livestreams;

  // Calculate stats from current data
  const stats = useMemo(() => {
    // Use stats from backend if available
    if (livestreamsResponse?.stats) {
      return {
        total: Number(livestreamsResponse.stats.total) || 0,
        totalViews: Number(livestreamsResponse.stats.totalViews) || 0,
      };
    }

    // Fallback calculation
    if (!livestreams || !Array.isArray(livestreams)) {
      return { total: 0, totalViews: 0 };
    }

    const total = pagination.total || 0;
    const totalViews = livestreams.reduce(
      (sum, livestream: Livestream) => sum + (livestream?.view || 0),
      0
    );

    return {
      total: Number(total) || 0,
      totalViews: Number(totalViews) || 0,
    };
  }, [livestreams, pagination.total, livestreamsResponse?.stats]);

  // Update course outlines when course is selected
  useEffect(() => {
    if (formData.courseId) {
      const selectedCourse = coursesForSelectResponse?.courses?.find(
        (course) => course.id.toString() === formData.courseId
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
      // Reset course outline selection when course changes
      setFormData((prev) => ({ ...prev, courseOutlineId: "" }));
    } else {
      setSelectedCourseOutlines([]);
      setFormData((prev) => ({ ...prev, courseOutlineId: "" }));
    }
  }, [formData.courseId, coursesForSelectResponse?.courses]);

  // Listen for delete livestream events from columns
  useEffect(() => {
    const handleDeleteLivestream = (event: CustomEvent) => {
      const { livestream } = event.detail;
      setLivestreamToDelete(livestream);
      setIsDeleteDialogOpen(true);
    };

    window.addEventListener(
      "delete-livestream",
      handleDeleteLivestream as EventListener
    );

    return () => {
      window.removeEventListener(
        "delete-livestream",
        handleDeleteLivestream as EventListener
      );
    };
  }, []);

  const handleClearFilters = () => {
    setSearchValue("");
    setTopicFilter("all");
    setPage(1);
  };

  const handleCreateLivestream = async () => {
    try {
      // Validation using Zod schema
      const validationResult = createLivestreamSchema.safeParse({
        title: formData.title.trim(),
        courseId: formData.courseId ? parseInt(formData.courseId) : undefined,
        courseOutlineId: formData.courseOutlineId
          ? parseInt(formData.courseOutlineId)
          : undefined,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError?.message || "Invalid form data");
        return;
      }

      const livestreamData = {
        title: formData.title.trim(),
        courseId: parseInt(formData.courseId),
        courseOutlineId: parseInt(formData.courseOutlineId),
      };

      await createLivestream(livestreamData).unwrap();
      toast.success("Livestream created successfully!");

      // Reset form and close dialog
      setFormData({
        title: "",
        courseId: "",
        courseOutlineId: "",
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      console.error("Create livestream error:", error);
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
          : "Failed to create livestream";
      toast.error(errorMessage);
    }
  };

  const handleDeleteLivestream = async () => {
    if (!livestreamToDelete) return;

    try {
      await deleteLivestream(livestreamToDelete.id).unwrap();
      toast.success("Livestream deleted successfully!");

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setLivestreamToDelete(null);
      refetch();
    } catch (error: unknown) {
      console.error("Delete livestream error:", error);
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
          : "Failed to delete livestream";
      toast.error(errorMessage);
    }
  };

  // Early returns for loading/error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Courses API Error:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Error Loading Livestreams
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              There was an error loading the livestream data. Please try again.
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
          <h1 className="text-3xl font-bold tracking-tight">Livestreams</h1>
          <p className="text-muted-foreground">
            Manage livestream events and their associated courses
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Livestream
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Livestreams
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
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading
                ? "..."
                : typeof stats.totalViews === "number"
                ? stats.totalViews
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "..." : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? "..." : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Search and filter livestreams by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search livestreams by title..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {coursesForSelectResponse?.courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {searchValue && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchValue || topicFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchValue && (
                <Badge variant="secondary">Search: {searchValue}</Badge>
              )}
              {topicFilter !== "all" && (
                <Badge variant="secondary">
                  Course:{" "}
                  {coursesForSelectResponse?.courses?.find(
                    (c) => c.id.toString() === topicFilter
                  )?.title || topicFilter}
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
          {typeof stats.total === "number" ? stats.total : 0} livestreams
        </div>
      </div>

      {/* Data Table */}
      <DataTableWithCard
        columns={livestreamColumns}
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
      />

      {/* Create Livestream Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Livestream</DialogTitle>
            <DialogDescription>
              Add a new livestream to the system. Fill in the livestream
              information below.
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
                placeholder="Livestream title"
                className="col-span-3"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Course */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseId" className="text-right">
                Course *
              </Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, courseId: value }))
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
              <Label htmlFor="courseOutlineId" className="text-right">
                Outline *
              </Label>
              <Select
                value={formData.courseOutlineId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, courseOutlineId: value }))
                }
                disabled={
                  !formData.courseId || selectedCourseOutlines.length === 0
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
              {formData.courseId && selectedCourseOutlines.length === 0 && (
                <p className="col-span-3 text-xs text-muted-foreground">
                  No outlines available for selected course. Please create
                  outlines for this course first.
                </p>
              )}
              {!formData.courseId && (
                <p className="col-span-3 text-xs text-muted-foreground">
                  Please select a course first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLivestream}
              disabled={
                isCreating ||
                !formData.title.trim() ||
                !formData.courseId ||
                !formData.courseOutlineId
              }
            >
              {isCreating ? "Creating..." : "Create Livestream"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Livestream</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this livestream? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {livestreamToDelete && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold">{livestreamToDelete.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Course: {livestreamToDelete.course?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Views: {livestreamToDelete.view || 0}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setLivestreamToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLivestream}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Livestream"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
