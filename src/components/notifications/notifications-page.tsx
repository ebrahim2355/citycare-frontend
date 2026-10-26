"use client";

import { useQuery } from "@tanstack/react-query";
import { BellOff, CheckCheck } from "lucide-react";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNotificationActions } from "@/hooks/use-notifications";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { notificationFilterSchema } from "@/lib/filters";
import { notificationQueries } from "@/lib/query/options";
import type { Role } from "@/types";

const DESCRIPTION: Record<Role, string> = {
  CITIZEN: "Every change to your reports, replies from the city team and your payments.",
  STAFF: "New jobs, messages from citizens, ratings and deadlines you need to watch.",
  ADMIN: "New reports, paid requests, reopened work and missed deadlines across the city.",
};

export function NotificationsPage({ role }: { role: Role }) {
  const { filters, setFilters } = useUrlFilters(notificationFilterSchema);
  const list = useQuery(notificationQueries.list(filters));
  const { data: unread = 0 } = useQuery(notificationQueries.unreadCount());
  const { open, markAllRead } = useNotificationActions(role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={DESCRIPTION[role]}
        actions={
          <Button variant="outline" disabled={!unread || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            <CheckCheck data-icon="inline-start" />
            Mark all as read
          </Button>
        }
      />
      <ToggleGroup
        type="single"
        variant="outline"
        value={filters.unread ? "unread" : "all"}
        onValueChange={(value) => value && setFilters({ unread: value === "unread" ? "true" : undefined })}
        aria-label="Show"
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="unread">Unread{unread ? ` (${unread})` : ""}</ToggleGroupItem>
      </ToggleGroup>
      {list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <Card className="py-2">
          <CardContent className="px-2">
            {!list.data ? (
              Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex gap-3 px-3 py-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3.5 w-4/5" />
                  </div>
                </div>
              ))
            ) : list.data.items.length ? (
              <div className="divide-y">
                {list.data.items.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} onOpen={open} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BellOff}
                title={filters.unread ? "No unread notifications" : "No notifications yet"}
                description={filters.unread ? "You have read everything." : "You will see updates here as soon as something happens."}
                className="border-0"
              />
            )}
          </CardContent>
        </Card>
      )}
      {list.data && <PaginationBar meta={list.data.meta} onPageChange={(page) => setFilters({ page })} label="notifications" />}
    </div>
  );
}
