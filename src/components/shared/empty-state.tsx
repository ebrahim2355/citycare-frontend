import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Empty className={cn("animate-fade-in border bg-card py-12 shadow-card", className)}>
      <EmptyHeader>
        <div className="relative mb-3 flex size-28 items-center justify-center" aria-hidden>
          <span className="absolute inset-0 rounded-full border border-dashed border-border" />
          <span className="absolute inset-4 rounded-full border border-border bg-muted/50" />
          <span className="relative flex size-12 items-center justify-center rounded-xl bg-card text-primary shadow-card ring-1 ring-border">
            <Icon className="size-6" />
          </span>
        </div>
        <EmptyTitle className="text-base font-semibold">{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
