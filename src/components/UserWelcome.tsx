"use client";

import { useAuth } from "@/lib/hooks/redux";
import { useAuthActions } from "@/lib/hooks/useAuthActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut } from "lucide-react";

export default function UserWelcome() {
  const { user, isLoading } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Welcome back!</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{user.name}</div>
            <p className="text-xs text-muted-foreground">
              @{user.username} • {user.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
