"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/schemas/auth";
import { useResetPasswordMutation } from "@/lib/features/api/authApi";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [resetPassword, { isLoading: isResetting, error: resetError }] =
    useResetPasswordMutation();

  // Verify token on mount - EXACTLY like TYHH MUI
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsVerifying(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ADMIN_URL}/auth/verify-reset-token?token=${token}`,
          {
            credentials: "include",
          }
        );
        const res = await response.json();

        if (res.success) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error(error);
        setIsTokenValid(null);
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleGoBack = () => {
    router.push("/login");
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      await resetPassword({ data, token }).unwrap();
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to reset password:", err);
    }
  };

  // Loading state while verifying token - EXACTLY like TYHH MUI
  if (isTokenValid === null || isVerifying) {
    return (
      <div className="w-full">
        <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait while we verify your reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state - EXACTLY like TYHH MUI
  if (isTokenValid === false) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>

        <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Please request a new password reset link or contact support if
                you continue to have issues.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              onClick={() => router.push("/forgot-password")}
              className="w-full h-11"
              variant="default"
            >
              Request new link
            </Button>
            <Button
              onClick={handleGoBack}
              className="w-full h-11"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>

        <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Password reset successful!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your password has been updated. You can now sign in with your new
              password.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              onClick={handleGoBack}
              className="w-full h-11"
              variant="default"
            >
              Sign in now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="w-full">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Button>
      </div>

      <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Reset your password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your new password below.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {resetError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {"data" in resetError &&
                    resetError.data &&
                    typeof resetError.data === "object" &&
                    "message" in resetError.data
                      ? String(resetError.data.message)
                      : "Failed to reset password. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          disabled={isResetting}
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
                          disabled={isResetting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          disabled={isResetting}
                          className="h-11 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground transition-colors"
                          disabled={isResetting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Reset password
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full">
          <Card className="w-full border-0 shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95">
            <CardHeader className="space-y-1 text-center pb-8">
              <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
