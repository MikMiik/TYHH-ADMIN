"use client";

import { useState } from "react";
import {
  TrendingUp,
  Eye,
  Heart,
  Target,
  Clock,
  BarChart3,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  useGetContentAnalyticsQuery,
  useGetPopularContentQuery,
  useGetEngagementMetricsQuery,
  useGetViewsAnalyticsQuery,
  useGetUserEngagementAnalyticsQuery,
} from "@/lib/features/api/analyticsApi";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );

  // API calls
  const {
    data: contentAnalytics,
    isLoading: isLoadingContent,
    refetch: refetchContent,
  } = useGetContentAnalyticsQuery({ range: timeRange });

  const { data: popularContent, isLoading: isLoadingPopular } =
    useGetPopularContentQuery({ range: timeRange, limit: 5 });

  const { data: engagementMetrics, isLoading: isLoadingEngagement } =
    useGetEngagementMetricsQuery({ range: timeRange });

  const { data: viewsAnalytics, isLoading: isLoadingViews } =
    useGetViewsAnalyticsQuery({ range: timeRange });

  const { data: userEngagement, isLoading: isLoadingUsers } =
    useGetUserEngagementAnalyticsQuery({ range: timeRange });

  const isLoading = isLoadingContent || isLoadingPopular || isLoadingEngagement;

  const handleRefresh = () => {
    refetchContent();
  };

  const getTimeRangeLabel = (range: string) => {
    const labels: Record<string, string> = {
      "7d": "Last 7 Days",
      "30d": "Last 30 Days",
      "90d": "Last 3 Months",
      "1y": "Last Year",
    };
    return labels[range] || "Last 30 Days";
  };

  // Chart configurations
  const viewsChartConfig = {
    views: {
      label: "Views",
      color: "hsl(var(--chart-1))",
    },
    uniqueViews: {
      label: "Unique Views",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const contentTypeChartConfig = {
    courses: {
      label: "Courses",
      color: "hsl(var(--chart-1))",
    },
    livestreams: {
      label: "Livestreams",
      color: "hsl(var(--chart-2))",
    },
    documents: {
      label: "Documents",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const userEngagementChartConfig = {
    activeUsers: {
      label: "Active Users",
      color: "hsl(var(--chart-1))",
    },
    newUsers: {
      label: "New Users",
      color: "hsl(var(--chart-2))",
    },
    returningUsers: {
      label: "Returning Users",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Content performance and user engagement insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value: "7d" | "30d" | "90d" | "1y") =>
              setTimeRange(value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentAnalytics?.totalViews?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`inline-flex items-center ${
                  (contentAnalytics?.viewsGrowth ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {contentAnalytics?.viewsGrowth ?? 0}%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentAnalytics?.totalLikes?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              <span
                className={`inline-flex items-center ${
                  (contentAnalytics?.likesGrowth ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {contentAnalytics?.likesGrowth ?? 0}%
              </span>{" "}
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementMetrics?.interactionRate
                ? `${(engagementMetrics.interactionRate * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average interaction rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Watch Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementMetrics?.avgWatchTime
                ? `${Math.round(engagementMetrics.avgWatchTime / 60)}m`
                : "0m"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average session duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>
              Daily views and unique views for {getTimeRangeLabel(timeRange)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingViews ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ChartContainer config={viewsChartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={viewsChartConfig.views.color}
                      fill={viewsChartConfig.views.color}
                      fillOpacity={0.4}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueViews"
                      stroke={viewsChartConfig.uniqueViews.color}
                      fill={viewsChartConfig.uniqueViews.color}
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content Type Views</CardTitle>
            <CardDescription>
              Views distribution by content type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingViews ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ChartContainer config={contentTypeChartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="courses"
                      fill={contentTypeChartConfig.courses.color}
                    />
                    <Bar
                      dataKey="livestreams"
                      fill={contentTypeChartConfig.livestreams.color}
                    />
                    <Bar
                      dataKey="documents"
                      fill={contentTypeChartConfig.documents.color}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>
              Active, new, and returning users over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ChartContainer
                config={userEngagementChartConfig}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke={userEngagementChartConfig.activeUsers.color}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke={userEngagementChartConfig.newUsers.color}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="returningUsers"
                      stroke={userEngagementChartConfig.returningUsers.color}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Popular Content */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Content</CardTitle>
            <CardDescription>Top performing content by views</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPopular ? (
              <div className="h-80 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {popularContent?.map((content, index) => (
                  <div key={content.id} className="flex items-center space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {content.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="capitalize">{content.type}</span>
                        <span>•</span>
                        <span>{content.views.toLocaleString()} views</span>
                        <span>•</span>
                        <span>{content.likes.toLocaleString()} likes</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {content.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                )) ?? (
                  <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No popular content data available
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
