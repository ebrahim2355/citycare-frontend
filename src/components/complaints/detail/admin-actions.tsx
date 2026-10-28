"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, CheckCheck, CircleSlash, Trash2, UserCheck, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { SelectField, TextareaField } from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAssignComplaint, useChangePriority, useChangeStatus } from "@/hooks/use-complaint-actions";
import { api } from "@/lib/api/client";
import { OPEN_STATUSES, PRIORITY_META } from "@/lib/complaint-meta";
import { PRIORITIES } from "@/lib/filters";
import { adminQueries, catalogQueries, queryKeys } from "@/lib/query/options";
import { cn } from "@/lib/utils";
import type { ComplaintDetail, Priority } from "@/types";

const assignSchema = z.object({
  staffId: z.string(),
  note: z
    .string()
    .trim()
    .max(300, "Keep it under 300 characters")
    .refine((value) => value.length === 0 || value.length >= 3, "Write at least 3 characters or leave it empty"),
});

type AssignValues = z.infer<typeof assignSchema>;

function AssignDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const form = useForm<AssignValues>({ resolver: zodResolver(assignSchema), defaultValues: { staffId: "", note: "" } });
  const staffId = useWatch({ control: form.control, name: "staffId" });
  const workload = useQuery({ ...adminQueries.workload({ departmentId: complaint.department.id }), enabled: open });
  const assign = useAssignComplaint();
  const candidates = (workload.data ?? []).filter((staff) => staff.id !== complaint.assignedStaff?.id);

  const submit = (automatic: boolean) =>
    form.handleSubmit((values) =>
      assign.mutate(
        { id: complaint.id, staffId: automatic ? undefined : values.staffId, note: values.note || undefined },
        {
          onSuccess: () => {
            setOpen(false);
            form.reset();
          },
        }
      )
    );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant={complaint.assignedStaff ? "outline" : "default"}>
          <UserCheck data-icon="inline-start" />
          {complaint.assignedStaff ? "Reassign" : "Assign staff"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{complaint.assignedStaff ? "Reassign" : "Assign"} this report</DialogTitle>
          <DialogDescription>
            Staff of {complaint.department.name}. People on leave or at full capacity cannot take new jobs.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {workload.isPending && <Skeleton className="h-32 rounded-xl" />}
          {workload.data && candidates.length === 0 && (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nobody else works in this department. Transfer the report or add a staff member.
            </p>
          )}
          <Controller
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} aria-label="Staff member">
                {candidates.map((staff) => (
                  <label
                    key={staff.id}
                    htmlFor={`staff-${staff.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                      staff.isAvailable ? "cursor-pointer hover:border-primary/50" : "opacity-60",
                      staffId === staff.id && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem id={`staff-${staff.id}`} value={staff.id} disabled={!staff.isAvailable} />
                    <UserAvatar name={staff.name} size={32} />
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{staff.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {staff.activeAssignments}/{staff.capacity} active
                        </span>
                      </span>
                      <Progress value={(staff.activeAssignments / staff.capacity) * 100} className="h-1.5" />
                      {!staff.isAvailable && (
                        <span className="block text-xs text-amber-700 dark:text-amber-300">
                          {staff.status === "BLOCKED" ? "Blocked" : !staff.acceptsAssignments ? "On leave" : "At full capacity"}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
        </div>
        <TextareaField control={form.control} name="note" label="Note for the timeline (optional)" rows={2} maxLength={300} />
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={submit(true)} disabled={assign.isPending}>
            <Wand2 data-icon="inline-start" />
            Auto assign
          </Button>
          <Button onClick={submit(false)} disabled={!staffId || assign.isPending}>
            {assign.isPending && <Spinner />}
            Assign selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const transferSchema = z.object({
  departmentId: z.string().min(1, "Choose the new department"),
  note: z.string().trim().max(300, "Keep it under 300 characters").optional(),
});

function TransferDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const departments = useQuery({ ...catalogQueries.departments(), enabled: open });
  const form = useForm<z.infer<typeof transferSchema>>({ resolver: zodResolver(transferSchema), defaultValues: { departmentId: "", note: "" } });
  const transfer = useApiMutation({
    mutationFn: async (values: z.infer<typeof transferSchema>) =>
      (await api.post<ComplaintDetail>(`/complaints/${complaint.id}/transfer`, { departmentId: values.departmentId, note: values.note || undefined }))
        .data,
    successMessage: (updated) => `Moved to ${updated.department.name}`,
    invalidate: [queryKeys.complaints, queryKeys.stats, queryKeys.users],
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.complaint(complaint.id), updated);
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <ArrowRightLeft data-icon="inline-start" />
          Move to another department
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to another department</DialogTitle>
          <DialogDescription>The report goes back to Submitted and the current staff member is taken off it.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={form.handleSubmit((values) => transfer.mutate(values))} className="space-y-5">
          <SelectField
            control={form.control}
            name="departmentId"
            label="New department"
            placeholder={departments.isPending ? "Loading departments" : "Choose a department"}
            options={(departments.data ?? [])
              .filter((department) => department.id !== complaint.department.id)
              .map((department) => ({ value: department.id, label: department.name }))}
          />
          <TextareaField control={form.control} name="note" label="Why? (optional)" rows={3} maxLength={300} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={transfer.isPending}>
              {transfer.isPending && <Spinner />}
              Move report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const rejectSchema = z.object({
  note: z.string().trim().min(10, "Explain in at least 10 characters why it is rejected").max(1000, "Keep it under 1000 characters"),
});

function RejectDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const change = useChangeStatus();
  const form = useForm<z.infer<typeof rejectSchema>>({ resolver: zodResolver(rejectSchema), defaultValues: { note: "" } });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="destructive">
          <CircleSlash data-icon="inline-start" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this report</DialogTitle>
          <DialogDescription>
            The citizen sees your reason.
            {complaint.paymentStatus === "PAID" ? " The service fee goes back to their card or wallet automatically." : ""}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) =>
            change.mutate({ id: complaint.id, status: "REJECTED", note: values.note }, { onSuccess: () => setOpen(false) })
          )}
          className="space-y-5"
        >
          <TextareaField
            control={form.control}
            name="note"
            label="Reason"
            rows={4}
            maxLength={1000}
            placeholder="For example: This drain is inside a private housing society."
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button type="submit" variant="destructive" disabled={change.isPending}>
              {change.isPending && <Spinner />}
              Reject report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminActions({ complaint }: { complaint: ComplaintDetail }) {
  const router = useRouter();
  const priority = useChangePriority();
  const close = useChangeStatus();
  const remove = useApiMutation({
    mutationFn: () => api.delete(`/complaints/${complaint.id}`),
    successMessage: "Report removed",
    invalidate: [queryKeys.complaints, queryKeys.stats],
    onSuccess: () => router.replace("/admin/complaints"),
  });
  const isOpen = OPEN_STATUSES.includes(complaint.status);
  const canEditPriority = isOpen || complaint.status === "PENDING_PAYMENT";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage</CardTitle>
        <CardDescription>Every action is written to the timeline and the audit log.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {canEditPriority && (
          <div className="space-y-2">
            <Label htmlFor="priority-select">Priority</Label>
            <Select
              value={complaint.priority}
              onValueChange={(value) => value !== complaint.priority && priority.mutate({ id: complaint.id, priority: value as Priority })}
            >
              <SelectTrigger id="priority-select" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {PRIORITY_META[item].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {isOpen && <AssignDialog complaint={complaint} />}
        {isOpen && <TransferDialog complaint={complaint} />}
        {complaint.status === "RESOLVED" && (
          <ConfirmDialog
            trigger={
              <Button className="w-full justify-start">
                <CheckCheck data-icon="inline-start" />
                Close without waiting for a rating
              </Button>
            }
            title="Close this report?"
            description="The citizen can no longer reopen it. Use this when the citizen does not answer."
            confirmLabel="Close report"
            pending={close.isPending}
            onConfirm={() => close.mutate({ id: complaint.id, status: "CLOSED" })}
          />
        )}
        {(isOpen || complaint.status === "PENDING_PAYMENT") && <RejectDialog complaint={complaint} />}
        <ConfirmDialog
          trigger={
            <Button className="w-full justify-start text-destructive hover:text-destructive" variant="ghost">
              <Trash2 data-icon="inline-start" />
              Remove report
            </Button>
          }
          title="Remove this report?"
          description="It is hidden everywhere but kept in the database and the audit log. A paid open request must be rejected first."
          confirmLabel="Remove report"
          destructive
          pending={remove.isPending}
          onConfirm={() => remove.mutate()}
        />
      </CardContent>
    </Card>
  );
}
