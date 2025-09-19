"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Users,
  Eye,
} from "lucide-react";

import { courseColumns } from "./columns";
import { DataTable } from "./data-table";
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

import { useGetCoursesQuery, Course } from "@/lib/features/api/courseApi";

// Define course type for type safety - using imported Course type
export default function CoursesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "published" | "draft" | "archived" | "all"
  >("all");
  const [levelFilter, setLevelFilter] = useState<
    "beginner" | "intermediate" | "advanced" | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API call với parameters
  const {
    data: coursesData,
    isLoading,
    error,
    refetch,
  } = useGetCoursesQuery({
    page,
    limit,
    search: searchValue || undefined,
    teacherId: undefined,
  });

  // Use real data from API
  const displayData = coursesData?.courses || [];
  const courses = coursesData?.courses || [];
  const pagination = {
    total: coursesData?.total || 0,
    totalPages: coursesData?.totalPages || 0,
    currentPage: coursesData?.currentPage || 1,
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setLevelFilter("all");
    setPage(1);
  };

  // Stats calculation
  const totalCourses = pagination?.total || 0;
  const publishedCourses = courses.filter(
    (course: Course) => course.createdAt
  ).length; // Simplified
  const draftCourses = totalCourses - publishedCourses;
  // Note: enrollmentCount không có trong BE model, sẽ cần tính từ course_user table
  const totalEnrollments = 0; // TODO: Implement proper enrollment count from BE

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Course Management
          </h1>
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCourses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All courses in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedCourses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Live courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {draftCourses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEnrollments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>
            Manage and monitor all courses in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by title, teacher..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as "published" | "draft" | "archived" | "all"
                )
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={levelFilter}
              onValueChange={(value) =>
                setLevelFilter(
                  value as "beginner" | "intermediate" | "advanced" | "all"
                )
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {(searchValue ||
              (statusFilter && statusFilter !== "all") ||
              (levelFilter && levelFilter !== "all")) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">
                Error loading courses: {error.toString()}
              </div>
            </div>
          )}

          <DataTable
            columns={courseColumns}
            data={displayData}
            loading={isLoading}
            pagination={{
              pageIndex: page - 1,
              pageSize: limit,
              pageCount: pagination?.totalPages || 0,
              total: pagination?.total || 0,
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
        </CardContent>
      </Card>
    </div>
  );
}
