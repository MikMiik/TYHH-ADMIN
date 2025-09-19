import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center space-x-2">{action}</div>}
      </div>
      {children && (
        <>
          <Separator />
          {children}
        </>
      )}
    </div>
  );
}

interface PageHeaderActionsProps {
  children: ReactNode;
  className?: string;
}

export function PageHeaderActions({
  children,
  className,
}: PageHeaderActionsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {children}
    </div>
  );
}

interface PageHeaderContentProps {
  children: ReactNode;
  className?: string;
}

export function PageHeaderContent({
  children,
  className,
}: PageHeaderContentProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
