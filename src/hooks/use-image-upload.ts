"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFiles } from "@/lib/api/client";
import { MAX_IMAGES_PER_UPLOAD } from "@/lib/complaint-meta";
import { queryKeys } from "@/lib/query/options";
import type { Attachment } from "@/types";

interface UploadOutcome {
  uploaded: Attachment[];
  failed: number;
  error: unknown;
}

const toBatches = (files: File[]) => {
  const batches: File[][] = [];

  for (let index = 0; index < files.length; index += MAX_IMAGES_PER_UPLOAD) {
    batches.push(files.slice(index, index + MAX_IMAGES_PER_UPLOAD));
  }

  return batches;
};

export function useImageUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (complaintId: string, files: File[]): Promise<UploadOutcome> => {
    const batches = toBatches(files);
    const uploaded: Attachment[] = [];
    let failed = 0;
    let error: unknown = null;

    setProgress(0);

    for (const [index, batch] of batches.entries()) {
      const form = new FormData();

      batch.forEach((file) => form.append("images", file));

      try {
        const response = await uploadFiles<Attachment[]>(`/complaints/${complaintId}/attachments`, form, (percent) =>
          setProgress(Math.round(((index + percent / 100) / batches.length) * 100))
        );

        uploaded.push(...response.data);
      } catch (uploadError) {
        failed += batch.length;
        error = uploadError;
      }
    }

    setProgress(null);
    await queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaintId) });

    return { uploaded, failed, error };
  };

  return { upload, progress, uploading: progress !== null };
}
