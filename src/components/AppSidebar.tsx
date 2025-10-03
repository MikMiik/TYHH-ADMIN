"use client";

import {
  Home,
  Users,
  BookOpen,
  Video,
  FileText,
  Settings,
  User2,
  ChevronUp,
  ChevronDown,
  Send,
  LifeBuoy,
  LogOut,
  User,
  TableOfContents,
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
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
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

  // Function to check if a path is active
  const isActivePath = (itemUrl: string) => {
    if (itemUrl === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(itemUrl);
  };

  // Admin Menu Structure - Only implemented pages
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
        },
        {
          title: "Course Management",
          url: "/courses",
          icon: BookOpen,
        },
        {
          title: "Outline Management",
          url: "/course-outlines",
          icon: TableOfContents,
        },
        {
          title: "Livestream Management",
          url: "/livestreams",
          icon: Video,
        },
        {
          title: "Document Library",
          url: "/documents",
          icon: FileText,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "System Administration",
          url: "/system",
          icon: Settings,
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
            <SidebarMenuButton asChild isActive={isActivePath("/")}>
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
                          <SidebarMenuButton
                            className={
                              isActivePath(item.url)
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : ""
                            }
                          >
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
                                  <SidebarMenuButton
                                    asChild
                                    isActive={isActivePath(child.url)}
                                  >
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
                      <SidebarMenuButton
                        asChild
                        isActive={isActivePath(item.url)}
                      >
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
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${user.username}`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
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
