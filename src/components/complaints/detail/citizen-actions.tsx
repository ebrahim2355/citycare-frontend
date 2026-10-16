"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Pencil, RotateCcw, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { SelectField, TextareaField, TextField } from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { EDITABLE_STATUSES, MAX_REOPENS, PRIORITY_META, REMOVABLE_STATUSES, REOPEN_WINDOW_DAYS } from "@/lib/complaint-meta";
import { PRIORITIES } from "@/lib/filters";
import { applyServerErrors } from "@/lib/forms";
import { queryKeys } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import { editComplaintSchema, type EditComplaintValues } from "@/lib/validations";
import type { ComplaintDetail } from "@/types";

const reopenSchema = z.object({
  reason: z.string().trim().min(10, "Tell us in at least 10 characters what is still wrong").max(500, "Keep it under 500 characters"),
});

const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Choose from 1 to 5 stars").max(5),
  comment: z.string().trim().max(500, "Keep it under 500 characters").optional(),
});

const RATING_WORDS = ["", "Very bad", "Bad", "Okay", "Good", "Excellent"];

function useComplaintCache(id: string) {
  const queryClient = useQueryClient();

  return (complaint: ComplaintDetail) => {
    queryClient.setQueryData(queryKeys.complaint(id), complaint);
    queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    queryClient.invalidateQueries({ queryKey: ["complaints", "list"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.recentComplaints });
  };
}

function EditDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const store = useComplaintCache(complaint.id);
  const form = useForm<EditComplaintValues>({
    resolver: zodResolver(editComplaintSchema),
    values: {
      title: complaint.title,
      description: complaint.description,
      priority: complaint.priority,
      area: complaint.area,
      address: complaint.address,
    },
  });
  const save = useApiMutation({
    mutationFn: async (values: EditComplaintValues) => (await api.patch<ComplaintDetail>(`/complaints/${complaint.id}`, values)).data,
    successMessage: "Report updated",
    silentError: true,
    onSuccess: (updated) => {
      store(updated);
      setOpen(false);
    },
    onError: (error) => {
      if (!applyServerErrors(error, form.setError, ["title", "description", "priority", "area", "address"])) {
        form.setError("root", { message: error.message });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit report</DialogTitle>
          <DialogDescription>You can change it until a staff member is assigned.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => save.mutate(values))} className="space-y-6">
          <FieldGroup>
            <TextField control={form.control} name="title" label="Title" />
            <TextareaField control={form.control} name="description" label="Description" rows={5} maxLength={2000} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField control={form.control} name="area" label="Area" />
              <SelectField
                control={form.control}
                name="priority"
                label="Priority"
                options={PRIORITIES.map((priority) => ({ value: priority, label: PRIORITY_META[priority].label }))}
              />
            </div>
            <TextField control={form.control} name="address" label="Address or landmark" />
          </FieldGroup>
          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
              {save.isPending && <Spinner />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelButton({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const store = useComplaintCache(complaint.id);
  const cancel = useApiMutation({
    mutationFn: async () =>
      (await api.post<ComplaintDetail>(`/complaints/${complaint.id}/cancel`, reason.trim() ? { reason: reason.trim() } : {})).data,
    successMessage: (updated) => (updated.paymentStatus === "REFUNDED" ? "Report cancelled and the fee refunded" : "Report cancelled"),
    onSuccess: (updated) => {
      store(updated);
      setOpen(false);
    },
  });
  const tooShort = reason.trim().length > 0 && reason.trim().length < 5;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline">
          <Ban data-icon="inline-start" />
          Cancel report
        </Button>
      }
      title="Cancel this report?"
      description={
        <span className="block space-y-3">
          <span className="block">
            The city team will stop working on it.
            {complaint.paymentStatus === "PAID" ? " The fee you paid is refunded to your card." : ""}
          </span>
          <Textarea
            aria-label="Reason (optional)"
            placeholder="Reason (optional), for example: it was fixed by the building owner"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={300}
          />
          {tooShort && <span className="block text-xs text-destructive">Write at least 5 characters or leave it empty.</span>}
        </span>
      }
      confirmLabel="Cancel report"
      destructive
      pending={cancel.isPending}
      onConfirm={() => !tooShort && cancel.mutate()}
    />
  );
}

function ReopenDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const store = useComplaintCache(complaint.id);
  const form = useForm<z.infer<typeof reopenSchema>>({ resolver: zodResolver(reopenSchema), defaultValues: { reason: "" } });
  const reopen = useApiMutation({
    mutationFn: async (values: z.infer<typeof reopenSchema>) => (await api.post<ComplaintDetail>(`/complaints/${complaint.id}/reopen`, values)).data,
    successMessage: "Report reopened. The team will look at it again.",
    onSuccess: (updated) => {
      store(updated);
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RotateCcw data-icon="inline-start" />
          Not fixed? Reopen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reopen this report</DialogTitle>
          <DialogDescription>
            You can reopen a report within {REOPEN_WINDOW_DAYS} days after it is resolved, {MAX_REOPENS} times at most. It goes back to the same
            staff member when they are available.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => reopen.mutate(values))} className="space-y-6">
          <TextareaField control={form.control} name="reason" label="What is still wrong?" rows={4} maxLength={500} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={reopen.isPending}>
              {reopen.isPending && <Spinner />}
              Reopen report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const store = useComplaintCache(complaint.id);
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, comment: "" },
  });
  const send = useApiMutation({
    mutationFn: async (values: z.infer<typeof feedbackSchema>) =>
      (await api.post<ComplaintDetail>(`/complaints/${complaint.id}/feedback`, { rating: values.rating, comment: values.comment || undefined }))
        .data,
    successMessage: "Thank you for your rating",
    onSuccess: (updated) => {
      store(updated);
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Star data-icon="inline-start" />
          Rate the work
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How did it go?</DialogTitle>
          <DialogDescription>Your rating closes the report and helps the city see which teams do great work.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => send.mutate(values))} className="space-y-6">
          <Controller
            control={form.control}
            name="rating"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <FieldLabel>Rating</FieldLabel>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={field.value === star}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                      onMouseEnter={() => setHover(star)}
                      onClick={() => field.onChange(star)}
                      className="rounded-md p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "size-8",
                          star <= (hover || field.value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">{RATING_WORDS[hover || field.value]}</span>
                </div>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <TextareaField control={form.control} name="comment" label="Comment (optional)" rows={3} maxLength={500} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Later
            </Button>
            <Button type="submit" disabled={send.isPending}>
              {send.isPending && <Spinner />}
              Send rating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveButton({ complaint }: { complaint: ComplaintDetail }) {
  const router = useRouter();
  const remove = useApiMutation({
    mutationFn: () => api.delete(`/complaints/${complaint.id}`),
    successMessage: "Report removed from your list",
    invalidate: [queryKeys.complaints, queryKeys.stats],
    onSuccess: () => router.replace("/dashboard/complaints"),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 data-icon="inline-start" />
          Remove
        </Button>
      }
      title="Remove this report from your list?"
      description="It disappears from your dashboard. The city keeps its own record of finished work."
      confirmLabel="Remove report"
      destructive
      pending={remove.isPending}
      onConfirm={() => remove.mutate()}
    />
  );
}

export function CitizenActions({ complaint }: { complaint: ComplaintDetail }) {
  const editable = EDITABLE_STATUSES.includes(complaint.status);
  const canRate = (complaint.status === "RESOLVED" || complaint.status === "CLOSED") && !complaint.feedback;
  const canReopen = complaint.status === "RESOLVED" && complaint.reopenCount < MAX_REOPENS;
  const removable = REMOVABLE_STATUSES.includes(complaint.status);

  if (!editable && !canRate && !canReopen && !removable) {
    return null;
  }

  return (
    <>
      {canRate && <FeedbackDialog complaint={complaint} />}
      {canReopen && <ReopenDialog complaint={complaint} />}
      {editable && <EditDialog complaint={complaint} />}
      {editable && <CancelButton complaint={complaint} />}
      {removable && <RemoveButton complaint={complaint} />}
    </>
  );
}
