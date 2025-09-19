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
  Video,
  Edit,
  Eye,
  Trash2,
  Play,
  Square,
} from "lucide-react";
import { Livestream } from "@/lib/features/api/livestreamApi";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";

const getStatusColor = (status: string) => {
  switch (status) {
    case "live":
      return "bg-red-500 text-white";
    case "scheduled":
      return "bg-blue-500 text-white";
    case "ended":
      return "bg-gray-500 text-white";
    case "cancelled":
      return "bg-orange-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "live":
      return "LIVE";
    case "scheduled":
      return "Scheduled";
    case "ended":
      return "Ended";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

export const livestreamColumns: ColumnDef<Livestream>[] = [
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
          Livestream
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const livestream = row.original;
      return (
        <div className="flex items-center space-x-3">
          {livestream.thumbnail ? (
            <Image
              src={livestream.thumbnail}
              alt={livestream.title}
              width={64}
              height={36}
              className="h-9 w-16 rounded object-cover"
            />
          ) : (
            <div className="h-9 w-16 rounded bg-muted flex items-center justify-center">
              <Video className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Link
              href={`/livestreams/${livestream.id}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {livestream.title}
            </Link>
            {livestream.description && (
              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {livestream.description}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={getStatusColor(status)}>
          {status === "live" && (
            <div className="h-2 w-2 bg-white rounded-full mr-1 animate-pulse" />
          )}
          {getStatusLabel(status)}
        </Badge>
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
    accessorKey: "course",
    header: "Course",
    cell: ({ row }) => {
      const course = row.original.course;
      return course ? (
        <Link
          href={`/courses/${course.id}`}
          className="text-blue-600 hover:underline"
        >
          {course.title}
        </Link>
      ) : (
        <span className="text-muted-foreground">No course</span>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startTime = row.getValue("startTime") as string;
      return startTime ? (
        <div className="text-sm">
          {format(new Date(startTime), "MMM dd, yyyy HH:mm")}
        </div>
      ) : (
        <span className="text-muted-foreground">Not scheduled</span>
      );
    },
  },
  {
    accessorKey: "viewCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Views
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("viewCount") as number;
      return <div className="font-medium">{(count || 0).toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "maxViewers",
    header: "Peak Viewers",
    cell: ({ row }) => {
      const maxViewers = row.getValue("maxViewers") as number;
      return (
        <div className="font-medium">{(maxViewers || 0).toLocaleString()}</div>
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
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(livestream.streamKey || "")
              }
            >
              Copy stream key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/livestreams/${livestream.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/livestreams/${livestream.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit livestream
              </Link>
            </DropdownMenuItem>
            {livestream.status === "scheduled" && (
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Start stream
              </DropdownMenuItem>
            )}
            {livestream.status === "live" && (
              <DropdownMenuItem>
                <Square className="mr-2 h-4 w-4" />
                End stream
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete livestream
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
