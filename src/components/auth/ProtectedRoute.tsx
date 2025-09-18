"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/redux";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackUrl?: string;
}

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Optionally checks for required roles
 */
export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  fallbackUrl = "/auth/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    // If authenticated but doesn't have required roles
    if (isAuthenticated && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => user.role === role);

      if (!hasRequiredRole) {
        // Redirect to unauthorized page or back to dashboard
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, fallbackUrl]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, don't render children (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but doesn't have required roles, don't render children
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      return null;
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};
