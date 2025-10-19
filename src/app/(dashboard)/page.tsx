"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppAreaChart from "@/components/AppAreaChart";
import AppBarChart from "@/components/AppBarChart";
import AppLineChart from "@/components/AppLineChart";
import AppPieChart from "@/components/AppPieChart";
import {
  Users,
  BookOpen,
  Video,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Star,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useGetDashboardQuery } from "@/lib/features/api/dashboardApi";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Failed to Load Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Unable to fetch dashboard data. Please try again.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    overview,
    users,
    courses,
    livestreams,
    documents,
    activities,
    growth,
  } = dashboardData;

  // Prepare data for charts

  // 1. Area Chart - Monthly growth trends
  const areaChartData = users.monthlyRegistrations.map((userMonth) => ({
    month: userMonth.month,
    desktop: Number(userMonth.count),
    mobile:
      Number(
        courses.monthlyCourses.find((c) => c.month === userMonth.month)?.count
      ) || 0,
  }));

  // 2. Bar Chart - Price distribution
  const barChartData = courses.priceDistribution.map((item) => ({
    month: item.priceRange,
    desktop: Number(item.count),
    mobile: Math.floor(Number(item.count) * 0.7), // Simulated mobile enrollment
  }));

  // 3. Line Chart - Livestream views vs Documents downloads
  const lineChartData = livestreams.monthlyLivestreams.map((liveMonth) => ({
    month: liveMonth.month,
    desktop: Number(liveMonth.count) * 100, // Simulated views per livestream
    mobile:
      (Number(
        documents.monthlyDocuments.find((d) => d.month === liveMonth.month)
          ?.count
      ) || 0) * 50,
  }));

  // 4. Line Chart - User growth over months
  const userGrowthChartData = users.monthlyRegistrations.map((userMonth) => ({
    month: userMonth.month,
    desktop: Number(userMonth.count), // Use desktop key for compatibility with AppLineChart
    mobile: 0, // Not needed for user growth, set to 0
  }));

  // 5. Pie Chart - Popular Topics Distribution
  const topicsChartData = courses.topicsPopularity
    .slice(0, 6)
    .map((topic, index) => ({
      name: topic.title,
      value: Number(topic.courseCount), // Ensure number for recharts
      fill: `var(--chart-${(index % 5) + 1})`,
    }));

  // Chart configs
  const growthConfig = {
    desktop: { label: "New Users", color: "var(--chart-1)" },
    mobile: { label: "New Courses", color: "var(--chart-2)" },
  };

  const priceConfig = {
    desktop: { label: "Total Courses", color: "var(--chart-3)" },
    mobile: { label: "Mobile Enrollment", color: "var(--chart-4)" },
  };

  const activityConfig = {
    desktop: { label: "Livestream Views", color: "var(--chart-1)" },
    mobile: { label: "Document Downloads", color: "var(--chart-5)" },
  };

  const userGrowthConfig = {
    desktop: { label: "New Users", color: "var(--chart-1)" },
    mobile: { label: "", color: "transparent" }, // Hidden line
  };

  const topicsConfig = {
    topic1: { label: "Topic 1", color: "var(--chart-1)" },
    topic2: { label: "Topic 2", color: "var(--chart-2)" },
    topic3: { label: "Topic 3", color: "var(--chart-3)" },
    topic4: { label: "Topic 4", color: "var(--chart-4)" },
    topic5: { label: "Topic 5", color: "var(--chart-5)" },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard overview
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.users.total.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Active: {overview.users.active.toLocaleString()}</span>
              {growth.users.growth !== 0 && (
                <Badge
                  variant={growth.users.growth > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {growth.users.growth > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(growth.users.growth)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.courses.total.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>
                Enrollments: {overview.enrollments.total.toLocaleString()}
              </span>
              {growth.courses.growth !== 0 && (
                <Badge
                  variant={
                    growth.courses.growth > 0 ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {growth.courses.growth > 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(growth.courses.growth)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livestreams</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.livestreams.total.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>
                {overview.livestreams?.totalViews?.toLocaleString() || 0} views
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.documents.total.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Download className="h-3 w-3" />
              <span>
                {overview.documents.totalDownloads.toLocaleString()} downloads
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Using Custom Chart Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - User & Course Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Monthly Growth Trends
            </CardTitle>
            <CardDescription>
              New users and courses registration over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppAreaChart
              title="Growth Trends"
              data={areaChartData}
              config={growthConfig}
            />
          </CardContent>
        </Card>

        {/* Bar Chart - Course Price Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Course Distribution
            </CardTitle>
            <CardDescription>
              Courses distributed by price range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppBarChart
              title="Price Distribution"
              data={barChartData}
              config={priceConfig}
            />
          </CardContent>
        </Card>

        {/* Line Chart - Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Content Activity
            </CardTitle>
            <CardDescription>
              Livestream views vs document downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppLineChart data={lineChartData} config={activityConfig} />
          </CardContent>
        </Card>

        {/* Line Chart - User Growth Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>
              Monthly user registration growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppLineChart
              data={userGrowthChartData}
              config={userGrowthConfig}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                New Users
              </h4>
              {activities.recentUsers.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                New Courses
              </h4>
              {activities.recentCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {course.teacher?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Most Viewed Livestreams
              </h4>
              {livestreams.topLivestreams
                .slice(0, 3)
                .map((livestream, index) => (
                  <div
                    key={livestream.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {livestream.title}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Eye className="mr-1 h-3 w-3" />
                        {livestream.view.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Most Downloaded
              </h4>
              {documents.topDocuments.slice(0, 3).map((document, index) => (
                <div key={document.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {document.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Download className="h-3 w-3" />
                      <span>{document.downloadCount.toLocaleString()}</span>
                      {document.vip && (
                        <Badge variant="secondary" className="text-xs">
                          VIP
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Topics as Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Topics</CardTitle>
          <CardDescription>
            Most popular course topics by course count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppPieChart
            data={topicsChartData}
            config={topicsConfig}
            centerLabel="Topics"
          />
        </CardContent>
      </Card>
    </div>
  );
}
