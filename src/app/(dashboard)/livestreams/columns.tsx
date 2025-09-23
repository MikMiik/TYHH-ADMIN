"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Video, Eye } from "lucide-react";
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

import { Livestream } from "@/lib/features/api/livestreamApi";

// Livestream columns based on actual BE model
export const livestreamColumns: ColumnDef<Livestream>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const livestream = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-9 w-16 rounded bg-muted flex items-center justify-center">
            <Video className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/livestreams/${livestream.slug}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {livestream.title}
            </Link>
            <div className="text-sm text-muted-foreground">
              {livestream.slug}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original.course;
      if (!course) {
        return <span className="text-muted-foreground">No course</span>;
      }
      return (
        <div>
          <div className="font-medium">{course.title}</div>
          <div className="text-sm text-muted-foreground">{course.slug}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "courseOutline",
    header: "Chapter",
    cell: ({ row }) => {
      const courseOutline = row.original.courseOutline;
      if (!courseOutline) {
        return <span className="text-muted-foreground">No chapter</span>;
      }
      return <div className="font-medium">{courseOutline.title}</div>;
    },
  },
  {
    accessorKey: "view",
    header: "Views",
    cell: ({ row }) => {
      const view = row.getValue("view") as number;
      return (
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{view.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "url",
    header: "Video URL",
    cell: ({ row }) => {
      const url = row.getValue("url") as string;
      if (!url) {
        return <span className="text-muted-foreground">No URL</span>;
      }
      return (
        <div className="max-w-[200px] truncate">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {url}
          </a>
        </div>
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
      const livestream = row.original;

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
              <Link href={`/livestreams/${livestream.slug}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/livestreams/${livestream.slug}/edit`}>
                Edit livestream
              </Link>
            </DropdownMenuItem>
            {livestream.url && (
              <DropdownMenuItem asChild>
                <a
                  href={livestream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch video
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete livestream
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
