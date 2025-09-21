"use client";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface DataTableCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  error?: ReactNode;
}

export function DataTableCard({
  children,
  title,
  description,
  className = "",
  error,
}: DataTableCardProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      {error && (
        <div className="border-b border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
