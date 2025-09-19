"use client";

import {
  Home,
  Users,
  BookOpen,
  Video,
  Bell,
  Settings,
  BarChart3,
  User2,
  ChevronUp,
  ChevronDown,
  Send,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useAuth } from "@/lib/hooks/redux";
import { useAuthActions } from "@/lib/hooks/useAuthActions";

// Types for menu structure
interface MenuChild {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  children?: MenuChild[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const AppSidebar = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "Admin";
    return user.name || user.username || "Admin";
  };

  // Admin Menu Structure based on TYHH Data Model
  const menuGroups: MenuGroup[] = [
    {
      label: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: Home,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "User Management",
          url: "/users",
          icon: Users,
          children: [
            { title: "All Users", url: "/users" },
            { title: "Roles & Permissions", url: "/users/roles" },
            { title: "Account Status", url: "/users/status" },
            { title: "Login Sessions", url: "/users/sessions" },
          ],
        },
        {
          title: "Course Management",
          url: "/courses",
          icon: BookOpen,
          children: [
            { title: "All Courses", url: "/courses" },
            { title: "Course Builder", url: "/courses/builder" },
            { title: "Topics & Tags", url: "/courses/topics" },
            { title: "Enrollments", url: "/courses/enrollments" },
            { title: "Teacher Assignment", url: "/courses/teachers" },
          ],
        },
        {
          title: "Content Management",
          url: "/content",
          icon: Video,
          children: [
            { title: "Livestreams", url: "/content/livestreams" },
            { title: "Documents", url: "/content/documents" },
            { title: "View Analytics", url: "/content/analytics" },
            { title: "Slide Notes", url: "/content/slides" },
          ],
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Communication",
          url: "/communication",
          icon: Bell,
          children: [
            { title: "Notifications", url: "/communication/notifications" },
            { title: "User Messages", url: "/communication/messages" },
            { title: "Schedules", url: "/communication/schedules" },
            { title: "Broadcast", url: "/communication/broadcast" },
          ],
        },
        {
          title: "System Settings",
          url: "/settings",
          icon: Settings,
          children: [
            { title: "Site Configuration", url: "/settings/site" },
            { title: "Social Links", url: "/settings/social" },
            { title: "Geographic Data", url: "/settings/locations" },
            { title: "Background Jobs", url: "/settings/queue" },
          ],
        },
        {
          title: "Analytics & Reports",
          url: "/analytics",
          icon: BarChart3,
          children: [
            { title: "User Analytics", url: "/analytics/users" },
            { title: "Course Performance", url: "/analytics/courses" },
            { title: "Revenue Reports", url: "/analytics/revenue" },
            { title: "System Reports", url: "/analytics/system" },
          ],
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="/vercel.svg" alt="logo" width={20} height={20} />
                <span>Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="-ml-0.5" />
      {/* Sidebar Content */}
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.children ? (
                      // Menu với submenu
                      <Collapsible className="group/collapsible">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              {item.children.map((child) => (
                                <SidebarMenuItem key={child.title}>
                                  <SidebarMenuButton asChild>
                                    <Link href={child.url}>
                                      <span>{child.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      // Menu thông thường
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Help Section */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Help
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/help/support">
                        <LifeBuoy />
                        Support
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/help/feedback">
                        <Send />
                        Feedback
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      {/* Sidebar Footer - chỉ hiển thị nếu đã đăng nhập */}
      {isAuthenticated && user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {getUserDisplayName()}{" "}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Account</DropdownMenuItem>
                  <DropdownMenuItem>Setting</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
