"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api/client";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SupportResult } from "@/types";

interface SupportButtonProps {
  complaintId: string;
  supportCount: number;
  supported?: boolean;
  isMine?: boolean;
  redirect: string;
  className?: string;
}

export function SupportButton({ complaintId, supportCount, supported = false, isMine = false, redirect, className }: SupportButtonProps) {
  const queryClient = useQueryClient();
  const { user, isLoading } = useSession();
  const [result, setResult] = useState<SupportResult | null>(null);
  const state = result ?? { supportCount, supported };

  const toggle = useApiMutation({
    mutationFn: async (support: boolean) => {
      const path = `/complaints/${complaintId}/support`;

      return (support ? await api.post<SupportResult>(path) : await api.delete<SupportResult>(path)).data;
    },
    successMessage: (next) => (next.supported ? "Thanks. You are counted as affected too." : "Your support was withdrawn"),
    onSuccess: (next) => {
      setResult(next);
      queryClient.invalidateQueries({ queryKey: ["public-reports"] });
      queryClient.invalidateQueries({ queryKey: ["tracking"] });
    },
  });

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`}>
          <ThumbsUp data-icon="inline-start" />
          Sign in to support
        </Link>
      </Button>
    );
  }

  if (user.role !== "CITIZEN" || isMine) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{pluralize(state.supportCount, "supporter")}</span>;
  }

  return (
    <Button
      type="button"
      variant={state.supported ? "secondary" : "outline"}
      size="sm"
      className={className}
      aria-pressed={state.supported}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate(!state.supported)}
    >
      {toggle.isPending ? <Spinner /> : <ThumbsUp data-icon="inline-start" className={cn(state.supported && "fill-current")} />}
      {state.supported ? "Supported" : "Me too"}
      <span className="text-muted-foreground tabular-nums">
        {state.supportCount}
        <span className="sr-only"> {state.supportCount === 1 ? "supporter" : "supporters"}</span>
      </span>
    </Button>
  );
}
