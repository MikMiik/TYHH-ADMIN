"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Shuffle,
} from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import LocalImageUploader from "@/components/LocalImageUploader";
import {
  useGetUserByUsernameQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSetUserKeyMutation,
  useSendVerificationEmailMutation,
} from "@/lib/features/api/userApi";
import { useGetRolesQuery } from "@/lib/features/api/systemApi";
import { Checkbox } from "@/components/ui/checkbox";

// Import validation schema and z for type safety (following .github/development-instructions.md guidelines)
import { editUserSchema, type EditUserFormData } from "@/lib/schemas/user";
import { z } from "zod";
// Define user form type - using EditUserFormData from schema
type UserFormData = EditUserFormData;

// Validation errors type
type ValidationErrors = {
  [K in keyof EditUserFormData]?: string;
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    role: "user",
    roleIds: [],
    activeKey: true,
    password: "",
    confirmPassword: "",
    phone: "",
    yearOfBirth: "",
    city: "",
    school: "",
    facebook: "",
    avatar: "",
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [backendError, setBackendError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"keep" | "change">("keep");
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState<"verify" | "unverify">(
    "verify"
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // RTK Query hooks
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useGetUserByUsernameQuery(username);

  const { data: availableRoles = [], isLoading: isLoadingRoles } = useGetRolesQuery();

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [setUserKey, { isLoading: isSettingKey }] = useSetUserKeyMutation();

  const [sendVerificationEmail, { isLoading: isSendingEmail }] =
    useSendVerificationEmailMutation();

  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      // Extract role IDs from the roles array
      const userRoleIds = user.roles?.map(r => r.id) || [];
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "user",
        roleIds: userRoleIds,
        activeKey: user.activeKey ?? true,
        password: "",
        confirmPassword: "",
        phone: user.phone || "",
        yearOfBirth: user.yearOfBirth?.toString() || "",
        city: user.city || "",
        school: user.school || "",
        facebook: user.facebook || "",
        avatar: user.avatar || "",
      });
      // Clear validation errors when loading new user data
      setValidationErrors({});
      setBackendError("");
    }
  }, [user]);

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | boolean | number[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData((prev) => {
      const currentRoleIds = prev.roleIds || [];
      const newRoleIds = currentRoleIds.includes(roleId)
        ? currentRoleIds.filter(id => id !== roleId)
        : [...currentRoleIds, roleId];
      
      return {
        ...prev,
        roleIds: newRoleIds,
      };
    });
  };

  // Validation function using Zod schema
  const validateForm = (): boolean => {
    try {
      // Clear previous errors
      setValidationErrors({});
      setBackendError("");

      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        // Convert empty strings to undefined for optional fields
        phone: formData.phone?.trim() || undefined,
        yearOfBirth: formData.yearOfBirth?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        school: formData.school?.trim() || undefined,
        facebook: formData.facebook?.trim() || undefined,
        avatar: formData.avatar?.trim() || undefined,
        // Handle password validation based on mode
        password: passwordMode === "change" ? formData.password : undefined,
        confirmPassword:
          passwordMode === "change" ? formData.confirmPassword : undefined,
        // Include roleIds if present
        roleIds: formData.roleIds && formData.roleIds.length > 0 ? formData.roleIds : undefined,
      };

      editUserSchema.parse(dataToValidate);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof EditUserFormData;
            errors[field] = issue.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Function to generate strong random password
  const generateStrongPassword = () => {
    const length = 16;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$&*<>?";
    
    const allChars = uppercase + lowercase + numbers + special;
    
    // Ensure at least one character from each category
    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
  };

  // Function to handle random password generation
  const handleGenerateRandomPassword = () => {
    const newPassword = generateStrongPassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword,
    }));
    // Clear password validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.password;
      delete newErrors.confirmPassword;
      return newErrors;
    });
    toast.success("Strong password generated successfully");
  };

  // Function to save only avatar after upload
  const handleAvatarSave = async (filePath: string) => {
    try {
      if (!user?.id) {
        throw new Error("User ID not available");
      }

      // Use filePath directly from local upload response
      await updateUser({
        id: user.id,
        data: { avatar: filePath },
      }).unwrap();

      // Refetch user data to get updated information
      await refetchUser();

      toast.success("Avatar updated successfully");
    } catch {
      toast.error("Failed to save avatar");
    }
  };

  const handleSave = async () => {
    try {
      // Clear backend error
      setBackendError("");

      // Validate form using Zod schema (following development-instructions.md)
      if (!validateForm()) {
        toast.error("Vui lòng kiểm tra và sửa các lỗi trong form.");
        return;
      }

      // Prepare update data with proper typing
      const updateData: Record<string, string | number | boolean | number[] | undefined> =
        {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          activeKey: formData.activeKey,
          avatar: formData.avatar || undefined, // filePath is already relative
        };

      // Send roleIds if available, otherwise fall back to single role
      if (formData.roleIds && formData.roleIds.length > 0) {
        updateData.roleIds = formData.roleIds;
      } else if (formData.role) {
        updateData.role = formData.role;
      }

      // Only include password if changing
      if (passwordMode === "change" && formData.password) {
        updateData.password = formData.password;
      }

      // Include optional fields if they have values
      if (formData.phone?.trim()) updateData.phone = formData.phone.trim();
      if (formData.yearOfBirth?.trim())
        updateData.yearOfBirth = parseInt(formData.yearOfBirth);
      if (formData.city?.trim()) updateData.city = formData.city.trim();
      if (formData.school?.trim()) updateData.school = formData.school.trim();
      if (formData.facebook?.trim())
        updateData.facebook = formData.facebook.trim();

      if (!user?.id) {
        throw new Error("User ID not available");
      }

      const prevUsername = user?.username;
      await updateUser({
        id: user.id,
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

      // Refetch user data to get updated information including avatar
      await refetchUser();

      // Nếu username thay đổi, điều hướng sang URL mới
      if (prevUsername && prevUsername !== formData.username) {
        router.replace(`/users/${formData.username}`);
      }
    } catch (error: unknown) {
      // Handle backend validation errors (following development-instructions.md)
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as Record<string, unknown>;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          // Display first backend validation error
          const firstError = errorData.errors[0] as Record<string, unknown>;
          setBackendError(
            String(
              firstError.msg || firstError.message || "Failed to update user"
            )
          );
        } else if (errorData?.message) {
          setBackendError(String(errorData.message));
        } else {
          setBackendError("Failed to update user");
        }
      } else {
        setBackendError("Failed to update user");
      }
      toast.error("Failed to update user. Please check the form for errors.");
    }
  };

  const handleVerifyClick = (action: "verify" | "unverify") => {
    setVerifyAction(action);
    setShowVerifyModal(true);
  };

  const handleVerifyConfirm = async () => {
    if (!user?.id) return;

    try {
      const updateData: Record<string, Date | null> = {
        verifiedAt: verifyAction === "verify" ? new Date() : null,
      };

      await updateUser({
        id: user.id,
        data: updateData,
      }).unwrap();

      toast.success(
        `User ${
          verifyAction === "verify" ? "verified" : "unverified"
        } successfully`
      );

      setShowVerifyModal(false);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            `Failed to ${verifyAction} user`
          : `Failed to ${verifyAction} user`;
      toast.error(String(errorMessage));
    }
  };

  const handleSetKey = async () => {
    if (!user?.id) return;

    try {
      await setUserKey({
        id: user.id,
        // Let backend generate random key
      }).unwrap();

      toast.success("User key set successfully");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to set user key"
          : "Failed to set user key";
      toast.error(String(errorMessage));
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user?.id) return;

    try {
      await sendVerificationEmail(user.id).unwrap();
      toast.success("Verification email sent successfully");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to send verification email"
          : "Failed to send verification email";
      toast.error(String(errorMessage));
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user?.id) return;

    try {
      await deleteUser(user.id).unwrap();
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      // Redirect to users list
      router.push("/users");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error.data as Record<string, unknown>)?.message ||
            "Failed to delete user"
          : "Failed to delete user";
      toast.error(String(errorMessage));
    }
  };

  const handleCancel = () => {
    if (user) {
      const userRoleIds = user.roles?.map(r => r.id) || [];
      
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "user",
        roleIds: userRoleIds,
        activeKey: user.activeKey ?? true,
        password: "",
        confirmPassword: "",
        phone: user.phone || "",
        yearOfBirth: user.yearOfBirth?.toString() || "",
        city: user.city || "",
        school: user.school || "",
        facebook: user.facebook || "",
        avatar: user.avatar || "",
      });
    }
    setIsEditing(false);
    setPasswordMode("keep");
    setValidationErrors({});
    setBackendError("");
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
            variant={user?.verifiedAt ? "outline" : "default"}
            size="sm"
            onClick={() =>
              handleVerifyClick(user?.verifiedAt ? "unverify" : "verify")
            }
            className="flex items-center"
          >
            {user?.verifiedAt ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Unverify
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verify
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
              {/* Display Backend Errors */}
              {backendError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{backendError}</AlertDescription>
                </Alert>
              )}

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
                    className={
                      validationErrors.name ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-destructive">
                      {validationErrors.name}
                    </p>
                  )}
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
                    className={
                      validationErrors.username ? "border-destructive" : ""
                    }
                  />
                  {validationErrors.username && (
                    <p className="text-sm text-destructive">
                      {validationErrors.username}
                    </p>
                  )}
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
                  className={validationErrors.email ? "border-destructive" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Roles</Label>
                  {!isEditing ? (
                    <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-sm">
                            {role.displayName}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-sm">
                          No roles assigned
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 border rounded-md p-3">
                      {isLoadingRoles ? (
                        <p className="text-sm text-muted-foreground">Loading roles...</p>
                      ) : availableRoles.length > 0 ? (
                        availableRoles.map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={formData.roleIds?.includes(role.id) || false}
                              onCheckedChange={() => handleRoleToggle(role.id)}
                            />
                            <Label
                              htmlFor={`role-${role.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {role.displayName}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No roles available</p>
                      )}
                    </div>
                  )}
                  {validationErrors.roleIds && (
                    <p className="text-sm text-destructive">
                      {validationErrors.roleIds}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center h-10">
                    <Badge
                      variant={
                        user.status === "active"
                          ? "default"
                          : user.status === "inactive"
                          ? "destructive"
                          : user.status
                          ? "secondary"
                          : formData.activeKey
                          ? "default"
                          : "destructive"
                      }
                      className={
                        user.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : user.status === "inactive"
                          ? "bg-red-500 hover:bg-red-600"
                          : user.status
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                          : formData.activeKey
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {user.status
                        ? user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)
                        : formData.activeKey
                        ? "Active"
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Key and ActiveKey Section */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>User Key</Label>
                  <div className="flex items-center h-10">
                    <Badge variant="outline" className="text-xs font-mono">
                      {user.key || "No key assigned"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Key Status</Label>
                  <div className="flex items-center h-10">
                    <Badge
                      variant={user.activeKey ? "default" : "secondary"}
                      className={
                        user.activeKey
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }
                    >
                      {user.activeKey ? "Activated" : "Not Activated"}
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
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Set a new password for the user
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateRandomPassword}
                            className="gap-2"
                          >
                            <Shuffle className="h-4 w-4" />
                            Generate Strong Password
                          </Button>
                        </div>
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
                                placeholder="Enter new password"
                                className={
                                  validationErrors.password
                                    ? "border-destructive"
                                    : ""
                                }
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
                            {validationErrors.password && (
                              <p className="text-sm text-destructive">
                                {validationErrors.password}
                              </p>
                            )}
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
                              className={
                                validationErrors.confirmPassword
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                            {validationErrors.confirmPassword && (
                              <p className="text-sm text-destructive">
                                {validationErrors.confirmPassword}
                              </p>
                            )}
                          </div>
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
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
              <CardDescription>User profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <LocalImageUploader
                currentImage={formData.avatar}
                onUploadSuccess={async (response) => {
                  handleInputChange("avatar", response.filePath);
                  await handleAvatarSave(response.filePath);
                }}
                onUploadError={(error) => {
                  toast.error(`Failed to upload avatar: ${error}`);
                }}
                title="User Avatar"
                className="w-full"
                fileName="avatar"
              />
            </CardContent>
          </Card>

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
                onClick={handleSetKey}
                disabled={isSettingKey}
              >
                {isSettingKey ? "Setting Key..." : "Set New Key"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleSendVerificationEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? "Sending..." : "Send Verification Email"}
              </Button>
              <Separator />
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start"
                onClick={handleDeleteClick}
                disabled={isDeletingUser}
              >
                {isDeletingUser ? "Deleting..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verify Confirmation Modal */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyAction === "verify" ? "Verify User" : "Unverify User"}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === "verify"
                ? "Are you sure you want to verify this user? This will set their verification status to verified."
                : "Are you sure you want to unverify this user? This will remove their verification status."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerifyConfirm}
              variant={verifyAction === "verify" ? "default" : "destructive"}
            >
              {verifyAction === "verify" ? "Verify User" : "Unverify User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user account? This action
              cannot be undone and will permanently remove all user data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingUser}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingUser}
            >
              {isDeletingUser ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
