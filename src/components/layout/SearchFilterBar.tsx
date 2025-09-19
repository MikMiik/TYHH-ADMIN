import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onFilterChange?: (filterId: string, value: string) => void;
  onClearFilters?: () => void;
  children?: ReactNode;
  className?: string;
}

interface FilterOption {
  id: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SearchFilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  onClearFilters,
  children,
  className,
}: SearchFilterBarProps) {
  const hasActiveFilters = filters.some((filter) => filter.value);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-4 items-start sm:items-center",
        className
      )}
    >
      {/* Search Input */}
      {onSearchChange && (
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filter.value || ""}
            onValueChange={(value) => onFilterChange?.(filter.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Clear Filters */}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-10"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}

        {/* Custom Actions */}
        {children}
      </div>
    </div>
  );
}

interface ActionButtonsProps {
  children: ReactNode;
  className?: string;
}

export function ActionButtons({ children, className }: ActionButtonsProps) {
  return (
    <div className={cn("flex gap-2 items-center", className)}>{children}</div>
  );
}
