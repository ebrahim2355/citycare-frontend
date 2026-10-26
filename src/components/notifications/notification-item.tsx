import { RelativeTime } from "@/components/shared/relative-time";
import { NOTIFICATION_STYLE } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";

interface NotificationItemProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  compact?: boolean;
}

export function NotificationItem({ notification, onOpen, compact = false }: NotificationItemProps) {
  const style = NOTIFICATION_STYLE[notification.type];
  const unread = !notification.readAt;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:bg-muted/70",
        unread && "bg-primary/[0.04]"
      )}
    >
      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", style.tone)}>
        <style.icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-sm leading-snug", unread ? "font-semibold" : "font-medium text-foreground/85")}>{notification.title}</span>
          {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </span>
        <span className={cn("block text-sm text-muted-foreground", compact ? "line-clamp-2" : "line-clamp-3")}>{notification.body}</span>
        <span className="block text-xs text-muted-foreground">
          <RelativeTime value={notification.createdAt} />
        </span>
      </span>
    </button>
  );
}
