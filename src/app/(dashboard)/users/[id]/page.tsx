"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, UserX, UserCheck, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  useGetUserQuery,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
} from "@/lib/features/api/userApi";

// Import types
type UpdateUserData = {
  name?: string;
  email?: string;
  username?: string;
  role?: "admin" | "teacher" | "user";
  activeKey?: boolean;
  password?: string;
};

// Define user form type
type UserFormData = {
  name: string;
  email: string;
  username: string;
  role: "admin" | "teacher" | "user";
  activeKey: boolean;
  password?: string;
  confirmPassword?: string;
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    role: "user",
    activeKey: true,
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"keep" | "change">("keep");

  // RTK Query hooks
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUserQuery(userId);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [toggleUserStatus, { isLoading: isTogglingStatus }] =
    useToggleUserStatusMutation();

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "user",
        activeKey: user.activeKey ?? true,
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.username.trim()
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (passwordMode === "change") {
        if (!formData.password || formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      }

      // Prepare update data
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        role: formData.role,
        activeKey: formData.activeKey,
      };

      // Only include password if changing
      if (passwordMode === "change" && formData.password) {
        updateData.password = formData.password;
      }

      await updateUser({
        id: userId,
        data: updateData,
      }).unwrap();

      toast.success("User updated successfully");
      setIsEditing(false);
      setPasswordMode("keep");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to update user"
          : "Failed to update user";
      toast.error(String(errorMessage));
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus({
        id: userId,
        activeKey: !formData.activeKey,
      }).unwrap();

      setFormData((prev) => ({
        ...prev,
        activeKey: !prev.activeKey,
      }));

      toast.success(
        `User ${formData.activeKey ? "deactivated" : "activated"} successfully`
      );
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to update user status"
          : "Failed to update user status";
      toast.error(String(errorMessage));
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "user",
        activeKey: user.activeKey ?? true,
        password: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
    setPasswordMode("keep");
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load user details. Please try again.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The user you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/users")}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEditing ? "Edit User" : "User Details"}
            </h2>
            <p className="text-muted-foreground">
              {isEditing
                ? "Update user information and settings"
                : "View and manage user information"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={formData.activeKey ? "outline" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className="flex items-center"
          >
            {formData.activeKey ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit User</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Basic user details and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center h-10">
                    <Badge
                      variant={formData.activeKey ? "default" : "secondary"}
                    >
                      {formData.activeKey ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              {isEditing && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Password Settings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Choose whether to keep current password or set a new one
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant={
                          passwordMode === "keep" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPasswordMode("keep")}
                      >
                        Keep Current Password
                      </Button>
                      <Button
                        type="button"
                        variant={
                          passwordMode === "change" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPasswordMode("change")}
                      >
                        Change Password
                      </Button>
                    </div>

                    {passwordMode === "change" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password || ""}
                              onChange={(e) =>
                                handleInputChange("password", e.target.value)
                              }
                              placeholder="Enter new password (min 6 chars)"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User ID:</span>
                <span className="text-sm font-medium">#{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Points:</span>
                <span className="text-sm font-medium">{user.point || 0}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Updated:
                </span>
                <span className="text-sm font-medium">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Verified:</span>
                <span className="text-sm font-medium">
                  {user.verifiedAt ? (
                    <Badge variant="default" className="text-xs">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Unverified
                    </Badge>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                View Login History
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                Reset Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                Send Verification Email
              </Button>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
