"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

import { courseColumns } from "./columns";
import { DataTableWithCard } from "@/components/ui/data-table-with-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  useGetCoursesQuery,
  useCreateCourseMutation,
  useBulkDeleteCoursesMutation,
  type Course,
} from "@/lib/features/api/courseApi";
import { useGetUsersQuery } from "@/lib/features/api/userApi";
import { createCourseSchema } from "@/lib/schemas/course";

// Tham khảo quy tắc phát triển tại .github/development-instructions.md
export default function CoursesPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [freeFilter, setFreeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating course
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teacherId: "",
    price: "",
    discount: "",
    isFree: false,
    purpose: "",
    topicId: "",
    content: "",
  });

  // API queries
  const {
    data: coursesResponse,
    isLoading,
    error,
    refetch,
  } = useGetCoursesQuery({
    page,
    limit,
    search: searchValue || undefined,
    topicId: topicFilter !== "all" ? topicFilter : undefined,
    isFree:
      freeFilter === "free" ? true : freeFilter === "paid" ? false : undefined,
  });

  // Get teachers for select dropdown
  const { data: teachersResponse } = useGetUsersQuery({
    role: "teacher",
    limit: 100, // Get all teachers
  });

  // Create course mutation
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [bulkDeleteCourses, { isLoading: isDeleting }] = useBulkDeleteCoursesMutation();

  // Transform data similar to users page
  const courses = useMemo(() => {
    const result = coursesResponse?.courses || [];
    // Debug log to check data structure
    if (result.length > 0) {
      console.log("Sample course data:", result[0]);
    }
    if (coursesResponse?.stats) {
      console.log("Stats from backend:", coursesResponse.stats);
    }
    return result;
  }, [coursesResponse]);
  const pagination = useMemo(
    () => ({
      total: coursesResponse?.total || 0,
      totalPages: coursesResponse?.totalPages || 0,
      currentPage: coursesResponse?.currentPage || 1,
    }),
    [coursesResponse]
  );

  // Use backend filtered data directly, no frontend filtering needed
  const displayData = courses;

  // Calculate stats from current data
  const stats = useMemo(() => {
    // Use stats from backend if available, otherwise calculate from current data
    if (coursesResponse?.stats) {
      return {
        total: Number(coursesResponse.stats.total) || 0,
        free: Number(coursesResponse.stats.free) || 0,
        paid: Number(coursesResponse.stats.paid) || 0,
      };
    }

    // Fallback calculation (should not be used if BE provides stats)
    if (!courses || !Array.isArray(courses)) {
      return { total: 0, free: 0, paid: 0 };
    }

    const total = pagination.total || 0;
    const free = courses.filter(
      (course: Course) => course?.isFree === true
    ).length;
    const paid = courses.filter(
      (course: Course) => course?.isFree === false
    ).length;

    return {
      total: Number(total) || 0,
      free: Number(free) || 0,
      paid: Number(paid) || 0,
    };
  }, [courses, pagination.total, coursesResponse?.stats]);

  const handleClearFilters = () => {
    setSearchValue("");
    setTopicFilter("all");
    setFreeFilter("all");
    setPage(1);
  };

  const handleCreateCourse = async () => {
    try {
      // Prepare course data
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        teacherId:
          formData.teacherId && formData.teacherId !== "0"
            ? parseInt(formData.teacherId)
            : undefined,
        price: formData.isFree
          ? undefined
          : formData.price
          ? parseFloat(formData.price)
          : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        isFree: formData.isFree,
        purpose: formData.purpose.trim() || undefined,
        group: formData.topicId && formData.topicId !== "0" 
          ? coursesResponse?.topics?.find(topic => topic.id.toString() === formData.topicId)?.title
          : undefined,
        content: formData.content.trim() || undefined,
      };

      // Frontend validation using Zod schema
      const validationResult = createCourseSchema.safeParse(courseData);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        const errorMessage = firstError?.message || "Dữ liệu không hợp lệ";
        toast.error(errorMessage);
        return;
      }

      // Create the course and get the result
      const createdCourse = await createCourse(validationResult.data).unwrap();
      toast.success("Course created successfully!");

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        teacherId: "",
        price: "",
        discount: "",
        isFree: false,
        purpose: "",
        topicId: "",
        content: "",
      });
      setIsCreateDialogOpen(false);

      // Navigate to the course detail page using the slug
      if (createdCourse?.slug) {
        router.push(`/courses/${createdCourse.slug}`);
      }
    } catch (error: unknown) {
      console.error("Create course error:", error);
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
          : "Failed to create course";
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async (selectedIds: number[]) => {
    try {
      await bulkDeleteCourses(selectedIds).unwrap();
      toast.success(`Successfully deleted ${selectedIds.length} course(s)`);
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
          : "Failed to delete courses";
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
              Error Loading Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              There was an error loading the course data. Please try again.
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
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage courses, outlines, topics, and teacher assignments
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
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
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
            <CardTitle className="text-sm font-medium">Free Courses</CardTitle>
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
            <CardTitle className="text-sm font-medium">Paid Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading
                ? "..."
                : typeof stats.paid === "number"
                ? stats.paid
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? "..." : coursesResponse?.topics?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Search and filter courses by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by title, description..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {coursesResponse?.topics?.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id.toString()}>
                    {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={freeFilter} onValueChange={setFreeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            {(searchValue || topicFilter !== "all" || freeFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchValue || topicFilter !== "all" || freeFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchValue && (
                <Badge variant="secondary">Search: {searchValue}</Badge>
              )}
              {topicFilter !== "all" && (
                <Badge variant="secondary">
                  Topic:{" "}
                  {coursesResponse?.topics?.find(
                    (t) => t.id.toString() === topicFilter
                  )?.title || topicFilter}
                </Badge>
              )}
              {freeFilter !== "all" && (
                <Badge variant="secondary">Type: {freeFilter}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {Array.isArray(displayData) ? displayData.length : 0} of{" "}
          {typeof stats.total === "number" ? stats.total : 0} courses
        </div>
      </div>

      {/* Data Table */}
      <DataTableWithCard
        columns={courseColumns}
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

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="max-h-[90vh] overflow-y-auto rounded-lg custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Add a new course to the system. Fill in the course information
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
                    placeholder="Course title"
                    className="col-span-3"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                {/* Description */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right mt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description"
                    className="col-span-3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Teacher */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teacherId" className="text-right">
                    Teacher
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, teacherId: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No teacher assigned</SelectItem>
                      {teachersResponse?.items?.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.name} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Is Free Checkbox */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isFree" className="text-right">
                    Free Course
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="isFree"
                      checked={formData.isFree}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isFree: checked as boolean,
                          price: checked ? "" : prev.price,
                          discount: checked ? "" : prev.discount,
                        }))
                      }
                    />
                    <Label htmlFor="isFree" className="text-sm">
                      This course is free for students
                    </Label>
                  </div>
                </div>

                {/* Price - Only show if not free */}
                {!formData.isFree && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price (₫)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="1,000,000"
                        className="col-span-3"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="discount" className="text-right">
                        Discount (₫)
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        placeholder="800,000"
                        className="col-span-3"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            discount: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                {/* Purpose */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="purpose" className="text-right">
                    Purpose
                  </Label>
                  <Input
                    id="purpose"
                    placeholder="Course objective"
                    className="col-span-3"
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, purpose: e.target.value }))
                    }
                  />
                </div>

                {/* Topic */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="topicId" className="text-right">
                    Topic
                  </Label>
                  <Select
                    value={formData.topicId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, topicId: value }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No topic assigned</SelectItem>
                      {coursesResponse?.topics?.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id.toString()}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right mt-2">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Detailed course content (HTML supported)"
                    className="col-span-3"
                    rows={3}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                  />
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
                  onClick={handleCreateCourse}
                  disabled={isCreating || !formData.title.trim()}
                >
                  {isCreating ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
