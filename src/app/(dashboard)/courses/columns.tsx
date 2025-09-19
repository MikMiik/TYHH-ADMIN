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
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { Course } from "@/lib/features/api/courseApi";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

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
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
          )}
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

      return (
        <div className="space-y-1">
          <div className="font-medium">
            {course.price ? `$${course.price}` : "N/A"}
          </div>
          {course.discount && course.discount > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="line-through">${course.price}</span>
              <span className="ml-1 text-green-600">${course.discount}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "enrollmentCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Enrollments
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("enrollmentCount") as number;
      return <div className="font-medium">{count || 0}</div>;
    },
  },
  {
    accessorKey: "group",
    header: "Category",
    cell: ({ row }) => {
      const group = row.getValue("group") as string;
      return group ? (
        <Badge variant="outline">{group}</Badge>
      ) : (
        <span className="text-muted-foreground">Uncategorized</span>
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(course.slug)}
            >
              Copy course slug
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/courses/${course.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/courses/${course.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit course
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
