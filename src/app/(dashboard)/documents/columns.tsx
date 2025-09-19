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
  FileText,
  Edit,
  Eye,
  Trash2,
  Download,
  Archive,
} from "lucide-react";
import { Document } from "@/lib/features/api/documentApi";
import { format } from "date-fns";
import Link from "next/link";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500 text-white";
    case "archived":
      return "bg-yellow-500 text-white";
    case "deleted":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Active";
    case "archived":
      return "Archived";
    case "deleted":
      return "Deleted";
    default:
      return status;
  }
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Get file type icon
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📈";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("video")) return "🎥";
  if (mimeType.includes("audio")) return "🎵";
  return "📁";
};

export const documentColumns: ColumnDef<Document>[] = [
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
          Document
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const document = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="text-lg">{getFileIcon(document.mimeType)}</div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/documents/${document.id}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {document.title}
            </Link>
            {document.description && (
              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {document.description}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {document.originalName} • {formatFileSize(document.fileSize)}
            </div>
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
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? (
        <Badge variant="outline">{category.name}</Badge>
      ) : (
        <span className="text-muted-foreground">No category</span>
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
    accessorKey: "uploadedBy",
    header: "Uploaded By",
    cell: ({ row }) => {
      const uploadedBy = row.original.uploadedBy;
      return (
        <div>
          <div className="font-medium">{uploadedBy.name}</div>
          <div className="text-sm text-muted-foreground">
            {uploadedBy.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "downloadCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Downloads
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("downloadCount") as number;
      return <div className="font-medium">{count.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => {
      const version = row.getValue("version") as string;
      return <Badge variant="secondary">{version}</Badge>;
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
      const document = row.original;

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
              onClick={() => navigator.clipboard.writeText(document.filePath)}
            >
              Copy file path
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/documents/${document.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/documents/${document.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit document
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download file
            </DropdownMenuItem>
            {document.status === "active" && (
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            {document.status === "archived" && (
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
