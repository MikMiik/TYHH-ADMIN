"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/TablePagination";
import { DataTableCard } from "@/components/ui/data-table-card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  onPaginationChange?: (updater: unknown) => void;
  // New props for styling control
  showBorder?: boolean;
  className?: string;
  // Bulk delete functionality
  onBulkDelete?: (selectedIds: number[]) => void;
  isDeleting?: boolean;
}

export function DataTableWithCard<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  pagination,
  onPaginationChange,
  showBorder = false,
  className = "",
  onBulkDelete,
  isDeleting = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      }),
    },
    ...(pagination && {
      pageCount: pagination.pageCount,
      onPaginationChange,
      manualPagination: true,
    }),
  });

  const errorElement = error && (
    <span>
      Error loading data:{" "}
      {typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error
        ? String((error as { message: string }).message)
        : "An unexpected error occurred"}
    </span>
  );

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkDelete = () => {
    if (!onBulkDelete || selectedCount === 0) return;
    
    const selectedIds = selectedRows.map((row) => {
      const rowData = row.original as { id: number };
      return rowData.id;
    });
    
    onBulkDelete(selectedIds);
    setRowSelection({});
  };

  return (
    <DataTableCard error={errorElement} className={className}>
      <div
        className={
          showBorder ? "overflow-hidden rounded-md border" : "overflow-hidden"
        }
      >
        {onBulkDelete && selectedCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
            <div className="text-sm text-muted-foreground">
              {selectedCount} row(s) selected
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : `Delete ${selectedCount} item(s)`}
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </DataTableCard>
  );
}
