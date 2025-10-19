"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";

import { userColumns } from "./columns";
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
import LocalImageUploader from "@/components/LocalImageUploader";

import {
  useGetUsersQuery,
  useCreateUserMutation,
} from "@/lib/features/api/userApi";
import { createUserSchema, type CreateUserForm } from "@/lib/schemas/user";

// Tham khảo quy tắc phát triển tại .github/development-instructions.md
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserForm>({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "user" as "admin" | "teacher" | "user",
    phone: "",
    yearOfBirth: "",
    city: "",
    school: "",
    facebook: "",
    avatar: "",
  });
  type FormErrors = {
    name?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: string;
    phone?: string;
    yearOfBirth?: string;
    city?: string;
    school?: string;
    facebook?: string;
  };
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string>("");

  // API calls
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

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

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
      // Handle roles array from backend
      const userRole =
        user.roles && user.roles.length > 0
          ? user.roles[0].name
          : user.role || "user"; // Fallback to role field or default to 'user'

      if (userRole !== roleFilter) {
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

  const validateForm = () => {
    try {
      createUserSchema.parse(newUser);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as {
          issues: Array<{ path: string[]; message: string }>;
        };
        const errors: FormErrors = {};
        zodError.issues.forEach((issue) => {
          const field = issue.path[0] as keyof FormErrors;
          if (field) {
            errors[field] = issue.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleAddUser = async () => {
    setServerError("");
    if (!validateForm()) return;
    try {
      // Prepare data with proper type conversion
      const userData = {
        ...newUser,
        yearOfBirth: newUser.yearOfBirth
          ? parseInt(newUser.yearOfBirth)
          : undefined,
        phone: newUser.phone || undefined,
        city: newUser.city || undefined,
        school: newUser.school || undefined,
        facebook: newUser.facebook || undefined,
        avatar: newUser.avatar || undefined,
      };
      await createUser(userData).unwrap();
      // Reset form and close modal
      setNewUser({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "user",
        phone: "",
        yearOfBirth: "",
        city: "",
        school: "",
        facebook: "",
        avatar: "",
      });
      setFormErrors({});
      setShowAddModal(false);
      // Refetch data
      refetch();
    } catch (error) {
      // Hiển thị lỗi trả về từ BE
      if (typeof error === "object" && error && "data" in error) {
        // RTK Query error type
        type RTKError = { data?: { message?: string }; message?: string };
        // @ts-expect-error: RTK Query error type is not strict
        const rtkError: RTKError = error;
        setServerError(
          rtkError.data?.message || rtkError.message || "Đã có lỗi xảy ra."
        );
      } else {
        setServerError((error as Error).message || "Đã có lỗi xảy ra.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewUser({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "user",
      phone: "",
      yearOfBirth: "",
      city: "",
      school: "",
      facebook: "",
      avatar: "",
    });
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
        <Button size="sm" onClick={() => setShowAddModal(true)}>
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
      <DataTableWithCard
        columns={userColumns}
        data={displayData}
        loading={isLoading}
      />

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <div className="max-h-[90vh] overflow-y-auto rounded-lg custom-scrollbar">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. Fill in all required fields.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <span className="text-xs text-red-600">
                      {formErrors.name}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <span className="text-xs text-red-600">
                      {formErrors.email}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    placeholder="Enter username"
                  />
                  {formErrors.username && (
                    <span className="text-xs text-red-600">
                      {formErrors.username}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                  {formErrors.password && (
                    <span className="text-xs text-red-600">
                      {formErrors.password}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      setNewUser({
                        ...newUser,
                        role: value as "admin" | "teacher" | "user",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.role && (
                    <span className="text-xs text-red-600">
                      {formErrors.role}
                    </span>
                  )}
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                    {formErrors.phone && (
                      <span className="text-xs text-red-600">
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="yearOfBirth">Year of Birth</Label>
                    <Input
                      id="yearOfBirth"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={newUser.yearOfBirth}
                      onChange={(e) =>
                        setNewUser({ ...newUser, yearOfBirth: e.target.value })
                      }
                      placeholder="Enter year of birth"
                    />
                    {formErrors.yearOfBirth && (
                      <span className="text-xs text-red-600">
                        {formErrors.yearOfBirth}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newUser.city}
                      onChange={(e) =>
                        setNewUser({ ...newUser, city: e.target.value })
                      }
                      placeholder="Enter city"
                    />
                    {formErrors.city && (
                      <span className="text-xs text-red-600">
                        {formErrors.city}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="school">School</Label>
                    <Input
                      id="school"
                      value={newUser.school}
                      onChange={(e) =>
                        setNewUser({ ...newUser, school: e.target.value })
                      }
                      placeholder="Enter school"
                    />
                    {formErrors.school && (
                      <span className="text-xs text-red-600">
                        {formErrors.school}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={newUser.facebook}
                    onChange={(e) =>
                      setNewUser({ ...newUser, facebook: e.target.value })
                    }
                    placeholder="Enter Facebook URL (optional)"
                  />
                  {formErrors.facebook && (
                    <span className="text-xs text-red-600">
                      {formErrors.facebook}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Avatar</Label>
                  <LocalImageUploader
                    currentImage={newUser.avatar}
                    onUploadSuccess={(response) => {
                      setNewUser({ ...newUser, avatar: response.filePath });
                      toast.success("Avatar uploaded successfully");
                    }}
                    onUploadError={(error) => {
                      toast.error(`Failed to upload avatar: ${error}`);
                    }}
                    title="User Avatar"
                    fileName="user-avatar"
                    className="w-full"
                  />
                </div>
                {serverError && (
                  <div className="mb-2 text-red-600 text-sm font-medium text-center">
                    {serverError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={
                    !newUser.name ||
                    !newUser.email ||
                    !newUser.username ||
                    !newUser.password ||
                    isCreating
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
