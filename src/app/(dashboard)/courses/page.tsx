"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

import { courseColumns } from "./columns";
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

import { useGetCoursesQuery, type Course } from "@/lib/features/api/courseApi";

// Tham khảo quy tắc phát triển tại .github/development-instructions.md
export default function CoursesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [freeFilter, setFreeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // API call với parameters - tương tự như users page
  const {
    data: coursesResponse,
    isLoading,
    error,
    refetch,
  } = useGetCoursesQuery({
    page,
    limit,
    search: searchValue || undefined,
    group: groupFilter !== "all" ? groupFilter : undefined,
    isFree:
      freeFilter === "free" ? true : freeFilter === "paid" ? false : undefined,
  });

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
        groups: Number(coursesResponse.stats.groups) || 0,
      };
    }

    // Fallback calculation (should not be used if BE provides stats)
    if (!courses || !Array.isArray(courses)) {
      return { total: 0, free: 0, paid: 0, groups: 0 };
    }

    const total = pagination.total || 0;
    const free = courses.filter(
      (course: Course) => course?.isFree === true
    ).length;
    const paid = courses.filter(
      (course: Course) => course?.isFree === false
    ).length;
    const groups = [
      ...new Set(
        courses.map((course: Course) => course?.group).filter(Boolean)
      ),
    ].length;

    return {
      total: Number(total) || 0,
      free: Number(free) || 0,
      paid: Number(paid) || 0,
      groups: Number(groups) || 0,
    };
  }, [courses, pagination.total, coursesResponse?.stats]);

  const handleClearFilters = () => {
    setSearchValue("");
    setGroupFilter("all");
    setFreeFilter("all");
    setPage(1);
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
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading
                ? "..."
                : typeof stats.groups === "number"
                ? stats.groups
                : 0}
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

            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={freeFilter} onValueChange={setFreeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            {(searchValue || groupFilter !== "all" || freeFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchValue || groupFilter !== "all" || freeFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchValue && (
                <Badge variant="secondary">Search: {searchValue}</Badge>
              )}
              {groupFilter !== "all" && (
                <Badge variant="secondary">Group: {groupFilter}</Badge>
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
      />

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to the system. Fill in the basic information
              below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Course title"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Brief description"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
