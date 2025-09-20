"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";

interface AuthGuardProps {
  children: ReactNode;
  redirectIfAuthenticated?: boolean;
}

export default function AuthGuard({
  children,
  redirectIfAuthenticated = false,
}: AuthGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Nếu đang loading, không làm gì
    if (isLoading) return;

    // Nếu đã authenticated và cần redirect (dành cho login page)
    if (redirectIfAuthenticated && isAuthenticated && user) {
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    router,
    redirectIfAuthenticated,
    searchParams,
  ]);

  // Nếu đang loading, hiển thị loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
