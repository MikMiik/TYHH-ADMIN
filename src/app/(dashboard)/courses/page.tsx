"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

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
  });

  // Transform data similar to users page
  const courses = useMemo(
    () => coursesResponse?.courses || [],
    [coursesResponse]
  );
  const pagination = useMemo(
    () => ({
      total: coursesResponse?.total || 0,
      totalPages: coursesResponse?.totalPages || 0,
      currentPage: coursesResponse?.currentPage || 1,
    }),
    [coursesResponse]
  );

  // Frontend filtering for group and free status
  const filteredCourses = useMemo(() => {
    return courses.filter((course: Course) => {
      const matchesGroup =
        groupFilter === "all" || course.group === groupFilter;
      const matchesFree =
        freeFilter === "all" ||
        (freeFilter === "free" && course.isFree) ||
        (freeFilter === "paid" && !course.isFree);

      return matchesGroup && matchesFree;
    });
  }, [courses, groupFilter, freeFilter]);

  const handleClearFilters = () => {
    setSearchValue("");
    setGroupFilter("all");
    setFreeFilter("all");
    setPage(1);
  };

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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
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

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">
                Error loading courses: {error.toString()}
              </div>
            </div>
          )}

          <DataTable
            columns={courseColumns}
            data={filteredCourses}
            loading={isLoading}
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
        </CardContent>
      </Card>

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
