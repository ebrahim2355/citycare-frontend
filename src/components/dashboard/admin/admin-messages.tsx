"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, FilterX, Inbox, Mail, MailCheck, Reply, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TextareaField } from "@/components/forms/form-fields";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RelativeTime } from "@/components/shared/relative-time";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { api } from "@/lib/api/client";
import { countActiveFilters, messageFilterSchema } from "@/lib/filters";
import { formatDateTime } from "@/lib/format";
import { adminQueries, queryKeys } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { CONTACT_TOPICS } from "@/lib/validations";
import type { ContactMessage, ContactStatus, Paginated, ReplyResult } from "@/types";

const STATUS_STYLE: Record<ContactStatus, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-primary/12 text-primary" },
  REPLIED: { label: "Replied", className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  CLOSED: { label: "Closed", className: "bg-zinc-500/12 text-zinc-700 dark:text-zinc-300" },
};

const topicLabel = (topic: string) => CONTACT_TOPICS.find((item) => item.value === topic)?.label ?? topic;

const replySchema = z.object({
  reply: z.string().trim().min(10, "Write at least 10 characters").max(2000, "Keep it under 2000 characters"),
});

function ReplyDialog({ message }: { message: ContactMessage }) {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { reply: `Hello ${message.name.split(" ")[0]},\n\n` },
  });
  const send = useApiMutation({
    mutationFn: async (values: z.infer<typeof replySchema>) => (await api.post<ReplyResult>(`/admin/messages/${message.id}/reply`, values)).data,
    successMessage: (result) => (result.emailSent ? `Reply emailed to ${message.email}` : "Reply saved, but the email could not be sent"),
    invalidate: [queryKeys.messages, queryKeys.stats],
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Reply data-icon="inline-start" />
          {message.reply ? "Reply again" : "Reply"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to {message.name}</DialogTitle>
          <DialogDescription>The reply is emailed to {message.email} with the subject “Re: {message.subject}”.</DialogDescription>
        </DialogHeader>
        <blockquote className="max-h-32 overflow-y-auto rounded-lg border-l-4 bg-muted/60 px-3 py-2 text-sm whitespace-pre-line text-muted-foreground">
          {message.message}
        </blockquote>
        <form noValidate onSubmit={form.handleSubmit((values) => send.mutate(values))} className="space-y-5">
          <TextareaField control={form.control} name="reply" label="Your reply" rows={6} maxLength={2000} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={send.isPending}>
              {send.isPending ? <Spinner /> : <Mail data-icon="inline-start" />}
              Send reply
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function useMessageStatus() {
  const queryClient = useQueryClient();

  return useApiMutation<ContactMessage, { message: ContactMessage; status: "NEW" | "CLOSED" }, { snapshot: [readonly unknown[], unknown][] }>({
    mutationFn: async ({ message, status }) => (await api.patch<ContactMessage>(`/admin/messages/${message.id}/status`, { status })).data,
    onMutate: async ({ message, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages });

      const snapshot = queryClient.getQueriesData({ queryKey: queryKeys.messages });

      snapshot.forEach(([key, data]) => {
        const page = data as Paginated<ContactMessage> | undefined;

        if (page?.items) {
          queryClient.setQueryData(key, { ...page, items: page.items.map((item) => (item.id === message.id ? { ...item, status } : item)) });
        }
      });

      return { snapshot };
    },
    onError: (_error, _input, context) => context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
    successMessage: (message) => (message.status === "CLOSED" ? "Message closed" : "Message moved back to new"),
  });
}

function MessageCard({ message }: { message: ContactMessage }) {
  const [expanded, setExpanded] = useState(false);
  const status = useMessageStatus();
  const style = STATUS_STYLE[message.status];

  return (
    <Card className={cn("gap-4 p-5", message.status === "NEW" && "border-primary/40")}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", style.className)}>{style.label}</span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{topicLabel(message.topic)}</span>
          </div>
          <h2 className="font-semibold">{message.subject}</h2>
          <p className="text-sm text-muted-foreground">
            {message.name} · <span className="break-all">{message.email}</span> · <RelativeTime value={message.createdAt} />
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <ReplyDialog message={message} />
          {message.status === "CLOSED" ? (
            <Button size="sm" variant="outline" onClick={() => status.mutate({ message, status: "NEW" })} disabled={status.isPending}>
              <RotateCcw data-icon="inline-start" />
              Reopen
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => status.mutate({ message, status: "CLOSED" })} disabled={status.isPending}>
              <Archive data-icon="inline-start" />
              Close
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <p className={cn("text-sm whitespace-pre-line", !expanded && "line-clamp-3")}>{message.message}</p>
        {message.message.length > 200 && (
          <button type="button" onClick={() => setExpanded((value) => !value)} className="text-xs font-medium text-primary hover:underline">
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      {message.reply && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MailCheck className="size-3.5" aria-hidden />
            Replied by {message.repliedBy?.name ?? "an admin"} on {formatDateTime(message.repliedAt)}
          </p>
          <p className="whitespace-pre-line">{message.reply}</p>
        </div>
      )}
    </Card>
  );
}

export function AdminMessages() {
  const { filters, setFilters, clearFilters } = useUrlFilters(messageFilterSchema);
  const messages = useQuery(adminQueries.messages(filters));
  const active = countActiveFilters(filters);

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Questions and feedback from the contact form. Replies go to the sender by email." />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={filters.searchTerm}
          onSearch={(searchTerm) => setFilters({ searchTerm })}
          placeholder="Search name, email or text"
          label="Search messages"
          className="lg:w-72"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <FilterSelect
            value={filters.status}
            onChange={(status) => setFilters({ status })}
            placeholder="Any status"
            label="Filter by status"
            options={[
              { value: "NEW", label: "New" },
              { value: "REPLIED", label: "Replied" },
              { value: "CLOSED", label: "Closed" },
            ]}
          />
          <FilterSelect
            value={filters.topic}
            onChange={(topic) => setFilters({ topic })}
            placeholder="All topics"
            label="Filter by topic"
            options={CONTACT_TOPICS.map((topic) => ({ value: topic.value, label: topic.label }))}
          />
        </div>
        {active > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="lg:ml-auto">
            <FilterX data-icon="inline-start" />
            Clear ({active})
          </Button>
        )}
      </div>
      {messages.error && !messages.data && <ErrorState error={messages.error} onRetry={() => messages.refetch()} retrying={messages.isFetching} />}
      {messages.isPending && Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-40 rounded-xl" />)}
      {messages.data?.items.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={active ? "No messages match" : "The inbox is empty"}
          description={active ? "Try other filters." : "Messages from the public contact page show up here."}
          action={
            active ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
      <div className={cn("space-y-4", messages.isPlaceholderData && "opacity-60")}>
        {messages.data?.items.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>
      {messages.data && <PaginationBar meta={messages.data.meta} onPageChange={(page) => setFilters({ page })} label="messages" />}
    </div>
  );
}
