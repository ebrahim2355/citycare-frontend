"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, FilterX, MoreHorizontal, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { useState } from "react";
import { ChangeRoleDialog, CreateUserDialog } from "@/components/dashboard/admin/user-dialogs";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession } from "@/hooks/use-session";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { api } from "@/lib/api/client";
import { countActiveFilters, userFilterSchema } from "@/lib/filters";
import { formatDate } from "@/lib/format";
import { adminQueries, catalogQueries, queryKeys } from "@/lib/query/options";
import { ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { Paginated, User } from "@/types";

const ROLE_TONE = {
  CITIZEN: "border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-200",
  STAFF: "border-violet-300/80 bg-violet-50 text-violet-800 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-200",
  ADMIN: "border-teal-300/80 bg-teal-50 text-teal-800 dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-200",
};

function useStatusToggle() {
  const queryClient = useQueryClient();

  return useApiMutation<User, { user: User; reason?: string }, { snapshot: [readonly unknown[], unknown][] }>({
    mutationFn: async ({ user, reason }) =>
      (
        await api.patch<User>(`/admin/users/${user.id}/status`, {
          status: user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE",
          ...(reason ? { reason } : {}),
        })
      ).data,
    onMutate: async ({ user }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });

      const snapshot = queryClient.getQueriesData({ queryKey: ["users", "list"] });
      const nextStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

      snapshot.forEach(([key, data]) => {
        const page = data as Paginated<User> | undefined;

        if (page?.items) {
          queryClient.setQueryData(key, { ...page, items: page.items.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)) });
        }
      });

      return { snapshot };
    },
    onError: (_error, _input, context) => context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
    successMessage: (user) => (user.status === "BLOCKED" ? `${user.name} is blocked and signed out` : `${user.name} can sign in again`),
  });
}

function UserActions({ user }: { user: User }) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");
  const toggle = useStatusToggle();
  const remove = useApiMutation({
    mutationFn: () => api.delete(`/admin/users/${user.id}`),
    successMessage: `${user.name} was removed`,
    invalidate: [queryKeys.users, queryKeys.stats],
    onSuccess: () => setDeleteOpen(false),
  });
  const blocked = user.status === "BLOCKED";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => setRoleOpen(true)}>
            <UserCog /> Change role
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => (blocked ? toggle.mutate({ user }) : setBlockOpen(true))}>
            {blocked ? <ShieldCheck /> : <Ban />} {blocked ? "Unblock" : "Block"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 /> Remove account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangeRoleDialog user={user} open={roleOpen} onOpenChange={setRoleOpen} />
      <ConfirmDialog
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title={`Block ${user.name}?`}
        description={
          <span className="block space-y-3">
            <span className="block">They are signed out on every device and cannot sign in until you unblock them.</span>
            <Textarea
              aria-label="Reason (optional)"
              placeholder="Reason (optional), kept in the audit log"
              value={reason}
              maxLength={300}
              onChange={(event) => setReason(event.target.value)}
            />
          </span>
        }
        confirmLabel="Block account"
        destructive
        pending={toggle.isPending}
        onConfirm={() => {
          toggle.mutate({ user, reason: reason.trim() || undefined });
          setBlockOpen(false);
          setReason("");
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Remove ${user.name}?`}
        description="The account is closed and hidden. Their reports stay in the city records. Accounts with open reports or active jobs cannot be removed."
        confirmLabel="Remove account"
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </>
  );
}

export function AdminUsers() {
  const { user: me } = useSession();
  const { filters, setFilters, clearFilters } = useUrlFilters(userFilterSchema);
  const list = useQuery(adminQueries.users(filters));
  const departments = useQuery(catalogQueries.departments());
  const active = countActiveFilters(filters);

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      className: "min-w-60",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} src={user.avatarUrl} size={36} />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {user.name}
              {user.id === me?.id && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => (
        <span className={cn("inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium", ROLE_TONE[user.role])}>{ROLE_LABEL[user.role]}</span>
      ),
    },
    { key: "department", header: "Department", cell: (user) => user.department?.name ?? <span className="text-muted-foreground">—</span> },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
            user.status === "ACTIVE" ? "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-red-300/80 bg-red-50 text-red-800 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200"
          )}
        >
          <span className={cn("size-1.5 rounded-full", user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500")} />
          {user.status === "ACTIVE" ? "Active" : "Blocked"}
        </span>
      ),
    },
    { key: "joined", header: "Joined", cell: (user) => <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12",
      cell: (user) => (user.id === me?.id ? null : <UserActions user={user} />),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Citizens, field staff and admins. Block abusive accounts and manage staff roles." actions={<CreateUserDialog />} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={filters.searchTerm}
          onSearch={(searchTerm) => setFilters({ searchTerm })}
          placeholder="Search name, email or phone"
          label="Search users"
          className="lg:w-72"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <FilterSelect
            value={filters.role}
            onChange={(role) => setFilters({ role })}
            placeholder="All roles"
            label="Filter by role"
            options={[
              { value: "CITIZEN", label: "Citizens" },
              { value: "STAFF", label: "Field staff" },
              { value: "ADMIN", label: "Admins" },
            ]}
          />
          <FilterSelect
            value={filters.status}
            onChange={(status) => setFilters({ status })}
            placeholder="Any status"
            label="Filter by status"
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "BLOCKED", label: "Blocked" },
            ]}
          />
          <FilterSelect
            value={filters.departmentId}
            onChange={(departmentId) => setFilters({ departmentId })}
            placeholder="All departments"
            label="Filter by department"
            options={(departments.data ?? []).map((department) => ({ value: department.id, label: department.name }))}
          />
          <FilterSelect
            value={filters.sortBy ? `${filters.sortBy}:${filters.sortOrder ?? "desc"}` : undefined}
            onChange={(value) => {
              const [sortBy, sortOrder] = (value ?? ":").split(":");

              setFilters({ sortBy: sortBy || undefined, sortOrder: sortOrder || undefined });
            }}
            placeholder="Newest first"
            label="Sort users"
            options={[
              { value: "name:asc", label: "Name A to Z" },
              { value: "createdAt:asc", label: "Oldest first" },
              { value: "email:asc", label: "Email A to Z" },
            ]}
          />
        </div>
        {active > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="lg:ml-auto">
            <FilterX data-icon="inline-start" />
            Clear ({active})
          </Button>
        )}
      </div>
      {list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={list.data?.items}
            getRowKey={(user) => user.id}
            loading={list.isPending}
            fetching={list.isPlaceholderData}
            caption="Users"
            renderMobile={(user) => (
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={user.name} src={user.avatarUrl} size={40} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {user.id !== me?.id && <UserActions user={user} />}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn("inline-flex h-6 items-center rounded-md border px-2 font-medium", ROLE_TONE[user.role])}>{ROLE_LABEL[user.role]}</span>
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-md border px-2 font-medium",
                      user.status === "ACTIVE" ? "border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-red-300/80 bg-red-50 text-red-800 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-200"
                    )}
                  >
                    {user.status === "ACTIVE" ? "Active" : "Blocked"}
                  </span>
                  {user.department && <span className="text-muted-foreground">{user.department.name}</span>}
                </div>
              </div>
            )}
            empty={
              <EmptyState
                icon={Users}
                title="No users match"
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
          {list.data && <PaginationBar meta={list.data.meta} onPageChange={(page) => setFilters({ page })} label="users" />}
        </>
      )}
    </div>
  );
}
