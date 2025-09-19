"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Video,
  Calendar,
  Eye,
} from "lucide-react";

import { livestreamColumns } from "./columns";
import { LivestreamDataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  useGetLivestreamsQuery,
  useGetLivestreamAnalyticsQuery,
} from "@/lib/features/api/livestreamApi";

export default function LivestreamsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "scheduled" | "live" | "ended" | "cancelled" | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // API calls
  const {
    data: livestreamsData,
    isLoading,
    error,
    refetch,
  } = useGetLivestreamsQuery({
    page,
    limit,
    search: searchValue || undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: analytics } = useGetLivestreamAnalyticsQuery();

  // Use real data from API
  const displayData = livestreamsData?.livestreams || [];

  const handleClearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Livestream Management
          </h1>
          <p className="text-muted-foreground">
            Manage livestreams, schedules, and streaming settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Livestream
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Livestreams
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalLivestreams || 0}
            </div>
            <p className="text-xs text-muted-foreground">All livestreams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.liveLivestreams || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently streaming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.scheduledLivestreams || 0}
            </div>
            <p className="text-xs text-muted-foreground">Upcoming streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.totalViews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Livestream List</CardTitle>
          <CardDescription>
            Manage and monitor all livestreams in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex flex-1 items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search livestreams by title, teacher..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as "scheduled" | "live" | "ended" | "cancelled" | "all"
                )
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {(searchValue || (statusFilter && statusFilter !== "all")) && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">
                Error loading livestreams: {error.toString()}
              </div>
            </div>
          )}

          <LivestreamDataTable
            columns={livestreamColumns}
            data={displayData}
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
