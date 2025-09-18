"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold">
            T
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};
