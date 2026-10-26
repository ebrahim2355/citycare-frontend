"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { complaintHref } from "@/lib/notifications";
import { queryKeys } from "@/lib/query/options";
import type { AppNotification, Role } from "@/types";

export function useNotificationActions(role: Role) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const markRead = useApiMutation({
    mutationFn: async (id: string) => (await api.patch<AppNotification>(`/notifications/${id}/read`)).data,
    invalidate: [queryKeys.notifications],
    silentError: true,
  });

  const markAllRead = useApiMutation({
    mutationFn: async () => (await api.patch<{ count: number }>("/notifications/read-all")).data,
    invalidate: [queryKeys.notifications],
    successMessage: (result) => (result.count ? "All notifications marked as read" : null),
    onMutate: () => {
      queryClient.setQueryData(queryKeys.unreadCount, 0);
    },
  });

  const open = (notification: AppNotification) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }

    if (notification.complaint) {
      router.push(complaintHref(role, notification.complaint.id));
    }
  };

  return { open, markAllRead };
}
