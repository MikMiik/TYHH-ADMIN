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
  BookOpen,
  Eye,
  Trash2,
} from "lucide-react";
import { Course } from "@/lib/features/api/courseApi";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteCourseMutation } from "@/lib/features/api/courseApi";
import { toast } from "sonner";

// Course Image Component with placeholder fallback
const CourseImage = ({ course }: { course: Course }) => {
  const [imageError] = useState(false);

  if (!course.thumbnail || imageError) {
    return (
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    // <Image
    //   src={course.thumbnail}
    //   alt={course.title}
    //   width={48}
    //   height={48}
    //   className="h-12 w-12 rounded-lg object-cover"
    //   onError={() => setImageError(true)}
    // />
    null
  );
};

// Actions component for course table
const CourseActions = ({ course }: { course: Course }) => {
  const router = useRouter();
  const [deleteCourse, { isLoading }] = useDeleteCourseMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = () => {
    router.push(`/courses/${course.id}`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete course "${course.title}"? This action cannot be undone.`
      )
    ) {
      try {
        setIsDeleting(true);
        await deleteCourse(course.id).unwrap();
        toast.success("Course deleted successfully");
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "data" in error
            ? (error.data as Record<string, unknown>)?.message ||
              "Failed to delete course"
            : "Failed to delete course";
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
        <DropdownMenuSeparator />
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
          {isDeleting ? "Deleting..." : "Delete course"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const courseColumns: ColumnDef<Course>[] = [
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
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Course
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center space-x-3">
          <CourseImage course={course} />
          <div>
            <Link
              href={`/courses/${course.id}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {course.title}
            </Link>
            <div className="text-sm text-muted-foreground">{course.slug}</div>
            {course.description && (
              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {course.description}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) => {
      const teacher = row.original.teacher;
      return teacher ? (
        <div>
          <div className="font-medium">{teacher.name}</div>
          <div className="text-sm text-muted-foreground">{teacher.email}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">No teacher assigned</span>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const course = row.original;

      if (course.isFree) {
        return <Badge variant="secondary">Free</Badge>;
      }

      // Đảm bảo price và discount là number, fallback 0 nếu undefined/null
      const price =
        typeof course.price === "number"
          ? course.price
          : Number(course.price) || 0;
      const discount =
        typeof course.discount === "number"
          ? course.discount
          : Number(course.discount) || 0;

      return (
        <div className="space-y-1">
          {discount > 0 ? (
            <div className="text-sm text-muted-foreground">
              <p className="line-through">{price.toLocaleString("vi-VN")}₫</p>
              <span className="text-green-600">
                {discount.toLocaleString("vi-VN")}₫
              </span>
            </div>
          ) : (
            <span>{price > 0 ? `${price.toLocaleString("vi-VN")}₫` : "-"}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">{format(new Date(date), "MMM dd, yyyy")}</div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const course = row.original;
      return <CourseActions course={course} />;
    },
  },
];
