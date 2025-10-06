"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Shield,
  User,
  UserCheck,
  Eye,
  Trash2,
} from "lucide-react";
import { User as UserType } from "@/lib/types/auth";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteUserMutation } from "@/lib/features/api/userApi";
import { toast } from "sonner";
import { useState } from "react";
import ImageLazy from "@/components/ImageLazy";

// Actions component for user table
const UserActions = ({ user }: { user: UserType }) => {
  const router = useRouter();
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = () => {
    router.push(`/users/${user.username}`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
      )
    ) {
      try {
        setIsDeleting(true);
        await deleteUser(user.id).unwrap();
        toast.success("User deleted successfully");
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "data" in error
            ? (error.data as Record<string, unknown>)?.message ||
              "Failed to delete user"
            : "Failed to delete user";
        toast.error(String(errorMessage));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive"
          disabled={isLoading || isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// User columns definition
export const userColumns: ColumnDef<UserType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-2">
          {user.avatar ? (
            <ImageLazy
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          )}
          <div>
            <Link
              href={`/users/${user.username}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {user.name}
            </Link>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-2">
          <span>{user.email}</span>
          {user.verifiedAt && <UserCheck className="h-4 w-4 text-green-600" />}
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      // Get primary role from roles array
      const role =
        user.roles && user.roles.length > 0 ? user.roles[0].name : "user";

      return (
        <Badge
          variant={
            role === "admin"
              ? "destructive"
              : role === "teacher"
              ? "secondary"
              : "outline"
          }
        >
          {role === "admin" && <Shield className="mr-1 h-3 w-3" />}
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      // Ưu tiên status BE, fallback về activeKey
      if (user.status) {
        let variant: "default" | "secondary" | "destructive" = "default";
        if (user.status === "inactive") variant = "secondary";
        if (user.status === "banned" || user.status === "locked")
          variant = "destructive";
        return (
          <Badge variant={variant}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        );
      }
      const isActive = user.activeKey;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "point",
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Points
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const pointValue = row.getValue("point");
      const points = pointValue != null ? parseFloat(pointValue as string) : 0;
      return (
        <div className="text-center font-mono">
          {isNaN(points) ? 0 : points.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin") as Date | null;
      if (!lastLogin)
        return <span className="text-muted-foreground">Never</span>;
      return (
        <span className="text-sm">
          {format(new Date(lastLogin), "MMM dd, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return <UserActions user={user} />;
    },
  },
];
