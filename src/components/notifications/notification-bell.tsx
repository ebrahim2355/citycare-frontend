"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationActions } from "@/hooks/use-notifications";
import { badgeCount, complaintHref, notificationsHref } from "@/lib/notifications";
import { notificationQueries, queryKeys } from "@/lib/query/options";
import type { Role } from "@/types";

function useArrivalToast(unread: number | undefined, role: Role) {
  const previous = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (unread === undefined) {
      return;
    }

    const before = previous.current;

    previous.current = unread;

    if (before === null || unread <= before) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.complaints });
    queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    queryClient
      .fetchQuery({ ...notificationQueries.latest(), staleTime: 0 })
      .then(({ items }) => {
        const newest = items.find((item) => !item.readAt);
        const complaint = newest?.complaint;

        if (newest) {
          toast(newest.title, {
            description: newest.body,
            action: complaint ? { label: "Open", onClick: () => router.push(complaintHref(role, complaint.id)) } : undefined,
          });
        }
      })
      .catch(() => undefined);
  }, [unread, queryClient, router, role]);
}

export function NotificationBell({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const { data: unread } = useQuery(notificationQueries.unreadCount());
  const latest = useQuery({ ...notificationQueries.latest(), enabled: open });
  const { open: openNotification, markAllRead } = useNotificationActions(role);

  useArrivalToast(unread, role);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={unread ? `Notifications, ${badgeCount(unread)} unread` : "Notifications"}>
          {unread ? <BellRing /> : <Bell />}
          {Boolean(unread) && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-background">
              {badgeCount(unread ?? 0)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-[22rem] max-w-[calc(100vw-2rem)] gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <p className="font-semibold">Notifications</p>
          <Button variant="ghost" size="sm" disabled={!unread || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            <CheckCheck data-icon="inline-start" />
            Mark all read
          </Button>
        </div>
        <div className="max-h-[26rem] overflow-y-auto p-1.5">
          {latest.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex gap-3 px-3 py-2.5">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/5" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          ) : latest.data?.items.length ? (
            latest.data.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
                onOpen={(item) => {
                  setOpen(false);
                  openNotification(item);
                }}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bell className="size-5" aria-hidden />
              </span>
              <p className="text-sm font-medium">You are all caught up</p>
              <p className="text-xs text-muted-foreground">Updates about your reports and jobs show up here.</p>
            </div>
          )}
        </div>
        <div className="border-t p-1.5">
          <Button asChild variant="ghost" className="w-full">
            <Link href={notificationsHref(role)} onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
