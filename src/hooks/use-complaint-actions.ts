"use client";

import { type QueryClient, type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { STATUS_META } from "@/lib/complaint-meta";
import { queryKeys } from "@/lib/query/options";
import type { ComplaintDetail, ComplaintListItem, ComplaintStatus, Paginated, Priority } from "@/types";

type ComplaintPatch = Partial<Pick<ComplaintListItem, "status" | "priority">>;
type Snapshot = [QueryKey, unknown][];

const isPage = (value: unknown): value is Paginated<ComplaintListItem> =>
  Boolean(value && typeof value === "object" && Array.isArray((value as Paginated<ComplaintListItem>).items));

const isDetail = (value: unknown, id: string): value is ComplaintDetail =>
  Boolean(value && typeof value === "object" && (value as ComplaintDetail).id === id && "updates" in (value as object));

export const patchComplaintCaches = async (queryClient: QueryClient, id: string, patch: ComplaintPatch): Promise<Snapshot> => {
  await queryClient.cancelQueries({ queryKey: queryKeys.complaints });

  const snapshot = queryClient.getQueriesData({ queryKey: queryKeys.complaints });

  snapshot.forEach(([key, data]) => {
    if (isPage(data)) {
      queryClient.setQueryData(key, {
        ...data,
        items: data.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      });
    } else if (isDetail(data, id)) {
      queryClient.setQueryData(key, { ...data, ...patch });
    }
  });

  return snapshot;
};

export const restoreCaches = (queryClient: QueryClient, snapshot: Snapshot | undefined) => {
  snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
};

const settle = (queryClient: QueryClient, id: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.complaints }),
    queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    queryClient.invalidateQueries({ queryKey: queryKeys.complaint(id) }),
  ]);

interface StatusInput {
  id: string;
  status: Extract<ComplaintStatus, "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CLOSED">;
  note?: string;
}

export function useChangeStatus() {
  const queryClient = useQueryClient();

  return useApiMutation<ComplaintDetail, StatusInput, Snapshot>({
    mutationFn: async ({ id, status, note }) =>
      (await api.patch<ComplaintDetail>(`/complaints/${id}/status`, note ? { status, note } : { status })).data,
    onMutate: ({ id, status }) => patchComplaintCaches(queryClient, id, { status }),
    onError: (_error, _input, snapshot) => restoreCaches(queryClient, snapshot),
    onSuccess: (complaint) => queryClient.setQueryData(queryKeys.complaint(complaint.id), complaint),
    onSettled: (_data, _error, input) => settle(queryClient, input.id),
    successMessage: (complaint) =>
      complaint.paymentStatus === "REFUNDED" && complaint.status === "REJECTED"
        ? "Rejected. The fee was refunded to the citizen."
        : `Marked as ${STATUS_META[complaint.status].label.toLowerCase()}`,
  });
}

export function useChangePriority() {
  const queryClient = useQueryClient();

  return useApiMutation<ComplaintDetail, { id: string; priority: Priority }, Snapshot>({
    mutationFn: async ({ id, priority }) => (await api.patch<ComplaintDetail>(`/complaints/${id}`, { priority })).data,
    onMutate: ({ id, priority }) => patchComplaintCaches(queryClient, id, { priority }),
    onError: (_error, _input, snapshot) => restoreCaches(queryClient, snapshot),
    onSuccess: (complaint) => queryClient.setQueryData(queryKeys.complaint(complaint.id), complaint),
    onSettled: (_data, _error, input) => settle(queryClient, input.id),
    successMessage: "Priority updated",
  });
}

export function useAssignComplaint() {
  const queryClient = useQueryClient();

  return useApiMutation<ComplaintDetail, { id: string; staffId?: string; note?: string }>({
    mutationFn: async ({ id, staffId, note }) =>
      (await api.post<ComplaintDetail>(`/complaints/${id}/assign`, { ...(staffId ? { staffId } : {}), ...(note ? { note } : {}) })).data,
    onSuccess: (complaint) => queryClient.setQueryData(queryKeys.complaint(complaint.id), complaint),
    onSettled: async (_data, _error, input) => {
      await settle(queryClient, input.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    successMessage: (complaint) => `Assigned to ${complaint.assignedStaff?.name ?? "a staff member"}`,
  });
}
