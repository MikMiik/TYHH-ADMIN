"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  PageContainer,
  PageHeader,
  PageHeaderActions,
  DataTable,
  SearchFilterBar,
  LoadingSpinner,
  EmptyState,
} from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useGetUsersQuery } from "@/lib/features/api/userApi";
import { User } from "@/lib/types/auth";

export default function UsersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API call với parameters
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    search: searchValue || undefined,
    role: (roleFilter as "admin" | "teacher" | "user") || undefined,
    status: (statusFilter as "active" | "inactive") || undefined,
  });

  // Filter options
  const filters = [
    {
      id: "role",
      label: "Role",
      value: roleFilter,
      placeholder: "All Roles",
      options: [
        { value: "admin", label: "Admin" },
        { value: "teacher", label: "Teacher" },
        { value: "user", label: "User" },
      ],
    },
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      placeholder: "All Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === "role") {
      setRoleFilter(value);
    } else if (filterId === "status") {
      setStatusFilter(value);
    }
    setPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
    setSearchValue("");
    setPage(1);
  };

  // Helper function to get user initials
  const getUserInitials = (user: User) => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.username ? user.username.slice(0, 2).toUpperCase() : "U";
  };

  // Table columns definition
  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "avatar",
        header: "",
        cell: ({ row }) => (
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={row.original.avatar || ""}
              alt={row.original.name}
            />
            <AvatarFallback>{getUserInitials(row.original)}</AvatarFallback>
          </Avatar>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">
              @{row.original.username}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.original.role;
          const roleColors = {
            admin: "destructive",
            teacher: "default",
            user: "secondary",
          } as const;

          return (
            <Badge
              variant={roleColors[role] || "secondary"}
              className="capitalize"
            >
              {role}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.activeKey;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "point",
        header: "Points",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.original.point}</div>
        ),
      },
      {
        accessorKey: "lastLogin",
        header: "Last Login",
        cell: ({ row }) => {
          const lastLogin = row.original.lastLogin;
          if (!lastLogin)
            return <span className="text-muted-foreground">Never</span>;

          return (
            <div className="text-sm">
              {new Date(lastLogin).toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {row.original.activeKey ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="Failed to load users"
          description="There was an error loading the user data. Please try again."
          action={<Button onClick={() => refetch()}>Try Again</Button>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage users, roles, and account settings"
        action={
          <PageHeaderActions>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </PageHeaderActions>
        }
      />

      <div className="space-y-4">
        <SearchFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search users by name, email, or username..."
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <DataTable
          columns={columns}
          data={usersData?.items || []}
          searchKey="name"
          loading={isLoading}
          onRowClick={(user) => {
            console.log("Navigate to user detail:", user.id);
            // TODO: Navigate to user detail page
          }}
        />
      </div>
    </PageContainer>
  );
}
