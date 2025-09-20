"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Nếu đang loading, không làm gì
    if (isLoading) return;

    // Nếu chưa authenticate, redirect về login với current URL
    if (!isAuthenticated || !user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // Kiểm tra quyền admin (nếu cần)
    if (user.role !== "admin") {
      // Có thể redirect về trang unauthorized hoặc login
      const loginUrl = `/login?redirect=${encodeURIComponent(
        pathname
      )}&error=unauthorized`;
      router.push(loginUrl);
      return;
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  // Hiển thị loading nếu đang check auth hoặc chưa authenticate
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Kiểm tra role admin
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access this admin panel.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
