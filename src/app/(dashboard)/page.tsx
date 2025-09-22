"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetContentAnalyticsQuery,
  useGetPopularContentQuery,
  useGetViewsAnalyticsQuery,
  useGetUserEngagementAnalyticsQuery,
} from "@/lib/features/api/analyticsApi";
import { useGetUsersQuery } from "@/lib/features/api/userApi";
import { useGetCoursesQuery } from "@/lib/features/api/courseApi";
import { useGetLivestreamsQuery } from "@/lib/features/api/livestreamApi";
import { useGetDocumentsQuery } from "@/lib/features/api/documentApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  BookOpen,
  Video,
  FileText,
  Activity,
  Eye,
  Heart,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  // Get system totals
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 1 });
  const { data: coursesData } = useGetCoursesQuery({ page: 1, limit: 1 });
  const { data: livestreamsData } = useGetLivestreamsQuery({
    page: 1,
    limit: 1,
  });
  const { data: documentsData } = useGetDocumentsQuery({ page: 1, limit: 1 });

  // Get analytics data (temporarily skipped due to missing backend endpoints)
  const { data: contentAnalytics } = useGetContentAnalyticsQuery(
    {
      range: "30d",
    },
    { skip: true }
  );
  const { data: popularContent } = useGetPopularContentQuery(
    {
      range: "7d",
      limit: 5,
    },
    { skip: true }
  );
  const { data: viewsAnalytics } = useGetViewsAnalyticsQuery(
    { range: "7d" },
    { skip: true }
  );
  const { data: userEngagement } = useGetUserEngagementAnalyticsQuery(
    {
      range: "7d",
    },
    { skip: true }
  );

  const totalUsers = usersData?.pagination?.total || 0;
  const totalCourses = coursesData?.total || 0;
  const totalLivestreams = livestreamsData?.stats?.total || 0;
  const totalDocuments = documentsData?.total || 0;

  // Transform data for charts
  const viewsChartData =
    viewsAnalytics?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      views: item.views,
      courses: item.courses,
      livestreams: item.livestreams,
      documents: item.documents,
    })) || [];

  const engagementChartData =
    userEngagement?.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      active: item.activeUsers,
      new: item.newUsers,
      returning: item.returningUsers,
    })) || [];

  const contentTypeData = [
    { name: "Courses", value: totalCourses, color: "#0088FE" },
    { name: "Livestreams", value: totalLivestreams, color: "#00C49F" },
    { name: "Documents", value: totalDocuments, color: "#FFBB28" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{contentAnalytics?.viewsGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(contentAnalytics?.totalViews || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{contentAnalytics?.viewsGrowth || 0}% from last month
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
              {(contentAnalytics?.totalLikes || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{contentAnalytics?.likesGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Content
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                totalCourses +
                totalLivestreams +
                totalDocuments
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all content types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Analytics (7 Days)</CardTitle>
            <CardDescription>
              Daily views breakdown by content type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="courses"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                  <Area
                    type="monotone"
                    dataKey="livestreams"
                    stackId="1"
                    stroke="#ffc658"
                    fill="#ffc658"
                  />
                  <Area
                    type="monotone"
                    dataKey="documents"
                    stackId="1"
                    stroke="#ff7c7c"
                    fill="#ff7c7c"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement (7 Days)</CardTitle>
            <CardDescription>Active, new and returning users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="returning"
                    stroke="#ffc658"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
            <CardDescription>Breakdown by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Content */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Popular Content (7 Days)</CardTitle>
            <CardDescription>Top performing content by views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularContent?.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="capitalize">{item.type}</span>
                      <span>{item.views.toLocaleString()} views</span>
                      <span>{item.likes.toLocaleString()} likes</span>
                      <span>
                        {formatDistanceToNow(new Date(item.createdAt))} ago
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    {item.type === "course" && <BookOpen className="w-4 h-4" />}
                    {item.type === "livestream" && (
                      <Video className="w-4 h-4" />
                    )}
                    {item.type === "document" && (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-8">
                  No popular content data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Total published courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livestreams</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLivestreams}</div>
            <p className="text-xs text-muted-foreground">
              Total livestream sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Total documents uploaded
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
