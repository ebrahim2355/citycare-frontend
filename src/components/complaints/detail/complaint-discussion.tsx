"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, MessagesSquare, Send, Trash2 } from "lucide-react";
import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";
import { complaintQueries, queryKeys } from "@/lib/query/options";
import { ROLE_LABEL } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { commentSchema, type CommentValues } from "@/lib/validations";
import type { ComplaintComment, User } from "@/types";

const REMOVE_WINDOW_MS = 15 * 60 * 1000;

const canRemove = (comment: ComplaintComment, user: User | null) => {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN") {
    return true;
  }

  return comment.author?.id === user.id && Date.now() - new Date(comment.createdAt).getTime() < REMOVE_WINDOW_MS;
};

function MessageRow({ comment, user, onRemove, removing }: { comment: ComplaintComment; user: User | null; onRemove: (id: string) => void; removing: boolean }) {
  const isOwn = comment.author?.id === user?.id;

  return (
    <li
      className={cn(
        "flex gap-3 rounded-xl border p-3.5",
        comment.isInternal ? "border-amber-300/70 bg-amber-50/70 dark:border-amber-400/25 dark:bg-amber-400/8" : "bg-card"
      )}
    >
      <UserAvatar name={comment.author?.name ?? "Former user"} src={comment.author?.avatarUrl} size={34} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
          <span className="font-semibold">{isOwn ? "You" : (comment.author?.name ?? "Former user")}</span>
          {comment.author && <span className="text-xs text-muted-foreground">{ROLE_LABEL[comment.author.role]}</span>}
          <span className="text-xs text-muted-foreground" aria-hidden>
            ·
          </span>
          <span className="text-xs text-muted-foreground">
            <RelativeTime value={comment.createdAt} />
          </span>
          {comment.isInternal && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
              <Lock className="size-3" aria-hidden />
              Internal note
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed break-words whitespace-pre-line text-foreground/90">{comment.body}</p>
      </div>
      {canRemove(comment, user) && (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground" aria-label="Remove this message">
              <Trash2 />
            </Button>
          }
          title="Remove this message?"
          description="It disappears for everyone on this report. The removal is kept in the audit log."
          confirmLabel="Remove message"
          destructive
          pending={removing}
          onConfirm={() => onRemove(comment.id)}
        />
      )}
    </li>
  );
}

export function ComplaintDiscussion({ complaintId }: { complaintId: string }) {
  const textareaId = useId();
  const internalId = useId();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const comments = useQuery(complaintQueries.comments(complaintId));
  const isTeam = user?.role === "STAFF" || user?.role === "ADMIN";
  const form = useForm<CommentValues>({ resolver: zodResolver(commentSchema), defaultValues: { body: "", internal: false } });

  const send = useApiMutation({
    mutationFn: async (values: CommentValues) =>
      (await api.post<ComplaintComment>(`/complaints/${complaintId}/comments`, { body: values.body, internal: isTeam ? values.internal : undefined }))
        .data,
    successMessage: (comment) => (comment.isInternal ? "Internal note added" : "Message sent"),
    onSuccess: (comment) => {
      queryClient.setQueryData<ComplaintComment[]>(queryKeys.comments(complaintId), (current = []) => [...current, comment]);
      form.reset({ body: "", internal: form.getValues("internal") });
    },
    onError: (error) => {
      applyServerErrors(error, form.setError, ["body", "internal"]);
    },
  });

  const remove = useApiMutation({
    mutationFn: async (id: string) => (await api.delete<null>(`/complaints/${complaintId}/comments/${id}`)).data,
    successMessage: "Message removed",
    invalidate: [queryKeys.comments(complaintId)],
  });

  const submit = form.handleSubmit((values) => send.mutate(values));
  const internal = useWatch({ control: form.control, name: "internal" });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="size-4.5 text-primary" aria-hidden />
          Messages
        </CardTitle>
        <CardDescription>
          {isTeam
            ? "Talk with the citizen here. Internal notes stay inside the city team."
            : "Ask a question or tell the crew something they should know."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {comments.error && !comments.data ? (
          <ErrorState error={comments.error} onRetry={() => comments.refetch()} retrying={comments.isFetching} className="py-6" />
        ) : !comments.data ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : comments.data.length ? (
          <ol aria-label="Messages" className="space-y-3">
            {comments.data.map((comment) => (
              <MessageRow
                key={comment.id}
                comment={comment}
                user={user}
                removing={remove.isPending && remove.variables === comment.id}
                onRemove={(id) => remove.mutate(id)}
              />
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </p>
        )}
        <form onSubmit={submit} className="space-y-3" noValidate>
          <Controller
            control={form.control}
            name="body"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <label htmlFor={textareaId} className="sr-only">
                  Your message
                </label>
                <Textarea
                  {...field}
                  id={textareaId}
                  rows={3}
                  aria-invalid={fieldState.invalid}
                  placeholder={internal ? "Write a note for the city team only" : "Write a message"}
                  className={cn(internal && "border-amber-300 bg-amber-50/50 dark:border-amber-400/30 dark:bg-amber-400/5")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault();

                      if (!send.isPending) {
                        submit();
                      }
                    }
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {isTeam ? (
              <Controller
                control={form.control}
                name="internal"
                render={({ field }) => (
                  <label htmlFor={internalId} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Switch id={internalId} checked={field.value} onCheckedChange={field.onChange} />
                    <span className="flex items-center gap-1.5">
                      <Lock className="size-3.5 text-muted-foreground" aria-hidden />
                      Internal note
                    </span>
                  </label>
                )}
              />
            ) : (
              <span className="text-xs text-muted-foreground">Ctrl + Enter to send</span>
            )}
            <Button type="submit" disabled={send.isPending}>
              {send.isPending ? <Spinner /> : <Send data-icon="inline-start" />}
              {internal ? "Add note" : "Send"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
