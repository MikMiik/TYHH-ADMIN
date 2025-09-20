import AuthGuard from "@/components/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard redirectIfAuthenticated={true}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Brand/Info */}
          <div className="hidden lg:flex flex-col justify-center space-y-6 px-8 relative">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  T
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    TYHH Admin
                  </h1>
                  <p className="text-muted-foreground">Management Dashboard</p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    Powerful Admin Interface
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Comprehensive dashboard for managing your platform with
                    advanced analytics, user management, and real-time
                    monitoring capabilities.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="text-2xl font-bold text-primary">150+</div>
                    <div className="text-xs text-muted-foreground">
                      Active Users
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border">
                    <div className="text-2xl font-bold text-primary">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
