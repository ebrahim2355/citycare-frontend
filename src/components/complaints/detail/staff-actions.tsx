"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StartWorkButton } from "@/components/dashboard/staff/start-work-button";
import { TextareaField } from "@/components/forms/form-fields";
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
import { Spinner } from "@/components/ui/spinner";
import { useChangeStatus } from "@/hooks/use-complaint-actions";
import type { ComplaintDetail } from "@/types";

const resolveSchema = z.object({
  note: z.string().trim().min(10, "Write at least 10 characters about what you did").max(1000, "Keep it under 1000 characters"),
});

function ResolveDialog({ complaint }: { complaint: ComplaintDetail }) {
  const [open, setOpen] = useState(false);
  const change = useChangeStatus();
  const form = useForm<z.infer<typeof resolveSchema>>({ resolver: zodResolver(resolveSchema), defaultValues: { note: "" } });
  const hasProof = complaint.attachments.some((attachment) => attachment.kind === "RESOLUTION");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <CircleCheck data-icon="inline-start" />
          Mark as resolved
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark this job as resolved</DialogTitle>
          <DialogDescription>
            The citizen sees your note and is asked to rate the work. {hasProof ? "" : "Tip: add a photo of the finished work first."}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) =>
            change.mutate({ id: complaint.id, status: "RESOLVED", note: values.note }, { onSuccess: () => setOpen(false) })
          )}
          className="space-y-6"
        >
          <TextareaField
            control={form.control}
            name="note"
            label="What did you do?"
            rows={4}
            maxLength={1000}
            placeholder="For example: Filled the pothole with asphalt and levelled the road."
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Not yet
            </Button>
            <Button type="submit" disabled={change.isPending}>
              {change.isPending && <Spinner />}
              Mark as resolved
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffActions({ complaint }: { complaint: ComplaintDetail }) {
  if (complaint.status === "ASSIGNED") {
    return <StartWorkButton id={complaint.id} size="lg" />;
  }

  if (complaint.status === "IN_PROGRESS") {
    return <ResolveDialog complaint={complaint} />;
  }

  return null;
}
