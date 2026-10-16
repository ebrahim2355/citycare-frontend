"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Camera, ImageOff, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { PhotoPicker } from "@/components/complaints/photo-picker";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api/client";
import { getErrorText } from "@/lib/api/errors";
import { MAX_IMAGES, OPEN_STATUSES } from "@/lib/complaint-meta";
import { formatDateTime } from "@/lib/format";
import { cloudinaryLoader } from "@/lib/image-loader";
import { queryKeys } from "@/lib/query/options";
import type { Attachment, ComplaintDetail, ComplaintStatus } from "@/types";

const UPLOAD_STATUSES: Record<"CITIZEN" | "STAFF" | "ADMIN", ComplaintStatus[]> = {
  CITIZEN: ["PENDING_PAYMENT", ...OPEN_STATUSES],
  STAFF: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"],
  ADMIN: ["PENDING_PAYMENT", "SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED", "CANCELLED"],
};

export function AttachmentGallery({ complaint }: { complaint: ComplaintDetail }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const { upload, progress, uploading } = useImageUpload();
  const room = MAX_IMAGES - complaint.attachments.length;
  const canUpload = Boolean(user && UPLOAD_STATUSES[user.role].includes(complaint.status) && room > 0);
  const editable = ["PENDING_PAYMENT", ...OPEN_STATUSES].includes(complaint.status);

  const remove = useApiMutation({
    mutationFn: (attachment: Attachment) => api.delete(`/complaints/${complaint.id}/attachments/${attachment.id}`),
    successMessage: "Photo removed",
    invalidate: [queryKeys.complaint(complaint.id)],
  });

  const sendPhotos = async () => {
    const result = await upload(complaint.id, files);

    if (result.uploaded.length) {
      toast.success(`${result.uploaded.length} photo(s) added`);
      setFiles([]);
    }

    if (result.failed) {
      const { title, description } = getErrorText(result.error);

      toast.error(title, { description });
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaint.id) });
  };

  const groups = [
    { title: "From the report", items: complaint.attachments.filter((item) => item.kind === "EVIDENCE") },
    { title: "Proof of the work", items: complaint.attachments.filter((item) => item.kind === "RESOLUTION") },
  ].filter((group) => group.items.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="size-4.5 text-primary" aria-hidden />
          Photos
        </CardTitle>
        <CardDescription>
          {complaint.attachments.length} of {MAX_IMAGES} photos
          {user?.role === "STAFF" ? ". Photos you add count as proof of the work." : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            <ImageOff className="size-6" aria-hidden />
            No photos yet
          </div>
        )}
        {groups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{group.title}</h3>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.items.map((attachment) => {
                const canRemove = Boolean(user && editable && (user.role === "ADMIN" || attachment.uploadedBy?.id === user.id));

                return (
                  <li key={attachment.id} className="group relative overflow-hidden rounded-xl border bg-muted">
                    <button
                      type="button"
                      onClick={() => setViewing(attachment)}
                      className="relative block aspect-[4/3] w-full"
                      aria-label={`Open photo by ${attachment.uploadedBy?.name ?? "a user"}`}
                    >
                      <Image
                        src={attachment.url}
                        alt={`Photo added by ${attachment.uploadedBy?.name ?? "a user"}`}
                        fill
                        loader={cloudinaryLoader}
                        sizes="(min-width: 1024px) 220px, 45vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs">
                      <span className="truncate text-muted-foreground">{attachment.uploadedBy?.name ?? "Removed user"}</span>
                      {canRemove && (
                        <ConfirmDialog
                          trigger={
                            <button type="button" aria-label="Remove photo" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-3.5" />
                            </button>
                          }
                          title="Remove this photo?"
                          description="The photo is deleted from the report and from the image storage."
                          confirmLabel="Remove photo"
                          destructive
                          pending={remove.isPending}
                          onConfirm={() => remove.mutate(attachment)}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {canUpload && (
          <div className="space-y-3 border-t pt-5">
            <PhotoPicker files={files} onChange={setFiles} max={room} disabled={uploading} progress={progress} />
            {files.length > 0 && (
              <Button onClick={sendPhotos} disabled={uploading}>
                {uploading ? <Spinner /> : <Upload data-icon="inline-start" />}
                Upload {files.length} photo{files.length === 1 ? "" : "s"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-3xl p-2 sm:max-w-3xl">
          <DialogTitle className="sr-only">Photo</DialogTitle>
          <DialogDescription className="sr-only">Large view of the photo</DialogDescription>
          {viewing && (
            <figure className="space-y-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={viewing.url}
                  alt={`Photo added by ${viewing.uploadedBy?.name ?? "a user"}`}
                  fill
                  loader={cloudinaryLoader}
                  sizes="(min-width: 768px) 760px, 95vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="px-2 pb-2 text-sm text-muted-foreground">
                {viewing.kind === "RESOLUTION" ? "Proof of the work" : "Photo from the report"} · {viewing.uploadedBy?.name} ·{" "}
                {formatDateTime(viewing.createdAt)}
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
