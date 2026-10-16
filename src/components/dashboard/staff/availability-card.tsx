"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, CircleCheck } from "lucide-react";
import { useId } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api/client";
import { queryKeys, statsQueries } from "@/lib/query/options";
import type { StaffStats, User } from "@/types";

export function AvailabilityCard() {
  const switchId = useId();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const stats = useQuery(statsQueries.staff());
  const accepting = user?.acceptsAssignments ?? true;

  const toggle = useApiMutation<User, boolean, { previous: User | null | undefined }>({
    mutationFn: async (acceptsAssignments) => (await api.patch<User>("/users/me", { acceptsAssignments })).data,
    onMutate: async (acceptsAssignments) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.session });

      const previous = queryClient.getQueryData<User | null>(queryKeys.session);

      if (previous) {
        queryClient.setQueryData(queryKeys.session, { ...previous, acceptsAssignments });
      }

      queryClient.setQueryData<StaffStats>(queryKeys.myStats, (current) => (current ? { ...current, acceptsAssignments } : current));

      return { previous };
    },
    onError: (_error, _value, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.session, context.previous);
      }
    },
    onSuccess: (updated) => queryClient.setQueryData(queryKeys.session, updated),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.myStats }),
    successMessage: (updated) => (updated.acceptsAssignments ? "You are taking new jobs again" : "New jobs are paused"),
  });

  const data = stats.data;

  return (
    <Card className={accepting ? undefined : "border-amber-500/40"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {accepting ? (
            <CircleCheck className="size-4.5 text-emerald-600" aria-hidden />
          ) : (
            <CalendarOff className="size-4.5 text-amber-600" aria-hidden />
          )}
          Availability
        </CardTitle>
        <CardDescription>Turn this off when you are on leave. Admins and automatic assignment skip you, and your current jobs stay with you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 p-4">
          <label htmlFor={switchId} className="space-y-0.5">
            <span className="block font-medium">{accepting ? "Taking new jobs" : "Not taking new jobs"}</span>
            <span className="block text-sm text-muted-foreground">
              {accepting ? "You can be assigned new reports." : "You will not get new reports until you turn this on."}
            </span>
          </label>
          <Switch id={switchId} checked={accepting} disabled={toggle.isPending} onCheckedChange={(checked) => toggle.mutate(checked)} />
        </div>
        {data && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current workload</span>
              <span className="font-medium tabular-nums">
                {data.activeAssignments} of {data.capacity} active jobs
              </span>
            </div>
            <Progress value={(data.activeAssignments / data.capacity) * 100} aria-label="Workload" />
            <p className="text-xs text-muted-foreground">
              You get new jobs only while you have fewer than {data.capacity} assigned or in progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
