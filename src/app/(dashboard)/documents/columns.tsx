"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, FileText, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Document } from "@/lib/features/api/documentApi";

// Helper function for file icons (simplified)
const getFileIcon = () => {
  return <FileText className="h-4 w-4" />;
};

// Document columns based on actual BE model
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
    header: "Title",
    cell: ({ row }) => {
      const document = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="text-lg">{getFileIcon()}</div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/documents/${document.slug || document.id}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {document.title || "Untitled Document"}
            </Link>
            <div className="text-sm text-muted-foreground">
              {document.vip ? "VIP Document" : "Public Document"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "vip",
    header: "Type",
    cell: ({ row }) => {
      const vip = row.getValue("vip") as boolean;
      return (
        <Badge variant={vip ? "default" : "secondary"}>
          {vip ? "VIP" : "Public"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "livestream",
    header: "Livestream",
    cell: ({ row }) => {
      const livestream = row.original.livestream;
      if (!livestream) {
        return <span className="text-muted-foreground">No livestream</span>;
      }
      return (
        <div>
          <div>
            <Link
              href={`/livestreams/${livestream.slug}`}
              className="font-medium hover:underline cursor-pointer"
            >
              {livestream.title}
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">{livestream.slug}</div>
          {livestream.course && (
            <div className="text-xs text-muted-foreground">
              Course: {livestream.course.title}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "downloadCount",
    header: "Downloads",
    cell: ({ row }) => {
      const downloadCount = row.getValue("downloadCount") as number;
      return (
        <div className="font-medium">
          {(downloadCount ?? 0).toLocaleString()}
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
      const document = row.original;

      const handleDeleteClick = () => {
        // Dispatch custom event for delete
        const event = new CustomEvent("delete-document", {
          detail: { document },
        });
        window.dispatchEvent(event);
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
            <DropdownMenuItem asChild>
              <Link href={`/documents/${document.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
