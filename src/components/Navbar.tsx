"use client";

import { LogOut, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuth } from "@/lib/hooks/redux";
import { useAuthActions } from "@/lib/hooks/useAuthActions";

const Navbar = () => {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout API fails, redirect to login
      router.push("/login");
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.name || user.username || user.email;
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.name || user.username || user.email;
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="p-4 flex justify-between items-center">
      {/* LEFT */}
      <SidebarTrigger />
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href="/">Dashboard</Link>
        {/* THEME MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* USER MENU hoặc LOGIN BUTTON */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage
                  src={
                    `${process.env.NEXT_PUBLIC_IK_URL_ENDPOINT}${user.avatar}` ||
                    "https://github.com/shadcn.png"
                  }
                />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10}>
              <DropdownMenuLabel>{getUserDisplayName()}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/users/${user.username}`}>
                  <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
