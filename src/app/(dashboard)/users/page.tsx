"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

import { userColumns } from "./columns";
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
import { Badge } from "@/components/ui/badge";

import { useGetUsersQuery } from "@/lib/features/api/userApi";

// Define user type for type safety
type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "admin" | "teacher" | "user";
  status?: string | null;
  activeKey: boolean;
  point?: number;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date | null;
};

export default function UsersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "admin" | "teacher" | "user" | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API call - CHỈ lấy toàn bộ danh sách users, KHÔNG filter gì ở backend
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    // TẤT CẢ filtering chỉ làm ở frontend, không gửi parameter lên backend
  });

  // Use real data from API
  const rawUsers = usersData?.items || [];

  // FRONTEND FILTERING - Tất cả filtering chỉ làm ở frontend
  const displayData = rawUsers.filter((user) => {
    // 1. Search filter (name, email, username)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const matchSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower);
      if (!matchSearch) {
        return false;
      }
    }

    // 2. Role filter
    if (roleFilter && roleFilter !== "all") {
      if (user.role !== roleFilter) {
        return false;
      }
    }

    // 3. Status filter - CHỈ dùng user.status field
    if (statusFilter && statusFilter !== "all") {
      if (user.status) {
        const isMatch = user.status === statusFilter;
        if (!isMatch) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  });

  const users = rawUsers; // Keep original for stats
  const pagination = usersData?.pagination;

  // Get available status options from actual user data - only from status field
  const availableStatuses = useMemo(() => {
    if (!usersData?.items || usersData.items.length === 0)
      return ["active", "inactive"]; // Default fallback
    const statuses = new Set<string>();
    usersData.items.forEach((user: User) => {
      if (user.status) {
        statuses.add(user.status);
      }
    });
    // If no status found in data, provide default options
    if (statuses.size === 0) {
      return ["active", "inactive"];
    }
    return Array.from(statuses).sort();
  }, [usersData?.items]);

  const handleClearFilters = () => {
    setSearchValue("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  // Stats calculation - ONLY use backend status field, NO activeKey
  const stats = {
    total: pagination?.total || 0,
    active: users.filter((u: User) => u.status === "active").length,
    inactive: users.filter((u: User) => u.status === "inactive").length,
    admins: users.filter((u: User) => u.role === "admin").length,
    teachers: users.filter((u: User) => u.role === "teacher").length,
    users: users.filter((u: User) => u.role === "user").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Error Loading Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              There was an error loading the user data. Please try again.
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.admins}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.teachers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.users}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Search and filter users by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as "admin" | "teacher" | "user" | "all")
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="user">Student</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchValue ||
              (roleFilter && roleFilter !== "all") ||
              (statusFilter && statusFilter !== "all")) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchValue || roleFilter || statusFilter) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchValue && (
                <Badge variant="secondary">Search: {searchValue}</Badge>
              )}
              {roleFilter && (
                <Badge variant="secondary">Role: {roleFilter}</Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary">Status: {statusFilter}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {displayData.length} of {stats.total} users
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable columns={userColumns} data={displayData} />
        </CardContent>
      </Card>
    </div>
  );
}
