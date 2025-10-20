"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, FileText, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Course outline interface based on BE model
export interface CourseOutline {
  id: number;
  title: string;
  slug: string;
  order: number;
  courseId: number;
  course?: {
    id: number;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const courseOutlineColumns = (
  onDelete?: (outline: CourseOutline) => void
): ColumnDef<CourseOutline>[] => [
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
    header: "Title",
    cell: ({ row }) => {
      const outline = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-9 w-16 rounded bg-muted flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/course-outlines/${outline.slug}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {outline.title}
            </Link>
            <div className="text-sm text-muted-foreground">{outline.slug}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => {
      const course = row.getValue("course") as CourseOutline["course"];
      if (!course) return <span className="text-muted-foreground">-</span>;

      return (
        <div className="space-y-1">
          <Link
            href={`/courses/${course.slug}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {course.title}
          </Link>
          <div className="text-xs text-muted-foreground">ID: {course.id}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => {
      const order = row.getValue("order") as number;
      return (
        <Badge variant="secondary" className="font-mono">
          #{order}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="text-sm">
          {format(new Date(createdAt), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const outline = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/course-outlines/${outline.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(outline)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete outline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
