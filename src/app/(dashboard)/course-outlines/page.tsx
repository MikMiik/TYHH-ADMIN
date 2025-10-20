"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

import { courseOutlineColumns, type CourseOutline } from "./columns";
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

// RTK Query API imports
import {
  useGetCourseOutlinesQuery,
  useCreateCourseOutlineMutation,
  useDeleteCourseOutlineMutation,
  useBulkDeleteCourseOutlinesMutation,
} from "@/lib/features/api/courseOutlineApi";
import { useGetCoursesQuery } from "@/lib/features/api/courseApi";

// Tham khảo quy tắc phát triển tại .github/development-instructions.md
export default function CourseOutlinesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [outlineToDelete, setOutlineToDelete] = useState<CourseOutline | null>(
    null
  );

  // Form state for creating course outline
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
  });

  // RTK Query hooks
  const {
    data: outlineData,
    isLoading,
    error,
    refetch,
  } = useGetCourseOutlinesQuery({
    page,
    limit,
    search: searchValue || undefined,
    courseId: courseFilter !== "all" ? parseInt(courseFilter) : undefined,
  });

  const { data: coursesData } = useGetCoursesQuery({ page: 1, limit: 100 }); // Get all courses for filter

  const [createOutline, { isLoading: isCreating }] =
    useCreateCourseOutlineMutation();
  const [deleteOutline, { isLoading: isSingleDeleting }] =
    useDeleteCourseOutlineMutation();
  const [bulkDeleteOutlines, { isLoading: isDeleting }] =
    useBulkDeleteCourseOutlinesMutation();

  // Extract data from API response with proper memoization
  const outlines = useMemo(
    () => outlineData?.outlines || [],
    [outlineData?.outlines]
  );
  const pagination = outlineData?.pagination;
  const courses = coursesData?.courses || [];

  // Transform and filter data (client-side filtering if needed)
  const filteredOutlines = useMemo(() => {
    const filtered = outlines;
    // Additional client-side filtering can be added here if needed
    // The main filtering is already done by the API
    return filtered;
  }, [outlines]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalOutlines = pagination?.totalItems || 0;
    const activeCourses = new Set(outlines.map((outline) => outline.courseId))
      .size;
    const avgOutlinesPerCourse =
      activeCourses > 0 ? Math.round(totalOutlines / activeCourses) : 0;

    return {
      totalOutlines,
      activeCourses,
      avgOutlinesPerCourse,
      recentOutlines: outlines.filter((outline) => {
        const createdAt = new Date(outline.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      }).length,
    };
  }, [outlines, pagination]);

  // Handlers
  const handleCreateOutline = async () => {
    if (!formData.title || !formData.courseId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createOutline({
        title: formData.title,
        courseId: parseInt(formData.courseId),
      }).unwrap();

      toast.success("Course outline created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ title: "", courseId: "" });
      refetch(); // Refresh data
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to create course outline";
      toast.error(errorMessage);
    }
  };

  const handleDeleteOutline = async () => {
    if (!outlineToDelete) return;

    try {
      await deleteOutline(outlineToDelete.id).unwrap();
      toast.success("Course outline deleted successfully");
      setIsDeleteDialogOpen(false);
      setOutlineToDelete(null);
      refetch(); // Refresh data
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete course outline";
      toast.error(errorMessage);
    }
  };

  const openDeleteDialog = (outline: CourseOutline) => {
    setOutlineToDelete(outline);
    setIsDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Data refreshed");
  };

  const handleBulkDelete = async (selectedIds: number[]) => {
    try {
      await bulkDeleteOutlines(selectedIds).unwrap();
      toast.success(`Successfully deleted ${selectedIds.length} course outline(s)`);
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to delete course outlines";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Outlines</h1>
          <p className="text-muted-foreground">
            Manage course outline structure and organization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Outline
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Outlines
            </CardTitle>
            <Badge variant="secondary">{stats.totalOutlines}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutlines}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <Badge variant="secondary">{stats.activeCourses}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              With course outlines
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg per Course
            </CardTitle>
            <Badge variant="outline">{stats.avgOutlinesPerCourse}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgOutlinesPerCourse}
            </div>
            <p className="text-xs text-muted-foreground">Outlines per course</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Badge variant="outline">{stats.recentOutlines}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentOutlines}</div>
            <p className="text-xs text-muted-foreground">Added this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter course outlines by search term and course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search outlines..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTableWithCard
        columns={courseOutlineColumns(openDeleteDialog)}
        data={filteredOutlines}
        pagination={{
          pageIndex: (pagination?.currentPage || 1) - 1, // Convert to 0-based index
          pageSize: pagination?.itemsPerPage || limit,
          pageCount: pagination?.totalPages || 1,
          total: pagination?.totalItems || 0,
        }}
        onPaginationChange={(updater) => {
          if (typeof updater === "function") {
            const newState = updater({ pageIndex: page - 1, pageSize: limit });
            setPage(newState.pageIndex + 1); // Convert back to 1-based index
          }
        }}
        loading={isLoading}
        error={error ? "Failed to load course outlines" : null}
        onBulkDelete={handleBulkDelete}
        isDeleting={isDeleting}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course Outline</DialogTitle>
            <DialogDescription>
              Add a new outline to organize course content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter outline title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">
                Course
              </Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData({ ...formData, courseId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCreateOutline}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Outline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course Outline</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{outlineToDelete?.title}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOutline}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
