"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { type DragEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { MAX_IMAGE_MB } from "@/lib/complaint-meta";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface PhotoPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
  disabled?: boolean;
  progress?: number | null;
  hint?: string;
}

export const checkPhoto = (file: File) => {
  if (!ACCEPTED.includes(file.type)) {
    return `${file.name} is not a JPG, PNG or WEBP image`;
  }

  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `${file.name} is larger than ${MAX_IMAGE_MB} MB`;
  }

  return null;
};

export function UploadProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-1.5" role="status" aria-live="polite">
      <div className="flex justify-between text-sm">
        <span>Uploading photos</span>
        <span className="tabular-nums">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}

export function PhotoPicker({ files, onChange, max, disabled, progress, hint }: PhotoPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  const addFiles = (incoming: FileList | File[]) => {
    const accepted: File[] = [];

    Array.from(incoming).forEach((file) => {
      const problem = checkPhoto(file);

      if (problem) {
        toast.error("Photo not added", { description: problem });
      } else if (!files.some((existing) => existing.name === file.name && existing.size === file.size)) {
        accepted.push(file);
      }
    });

    const room = max - files.length;

    if (accepted.length > room) {
      toast.warning(`Only ${max} photos fit`, { description: `${accepted.length - room} photo(s) were left out.` });
    }

    if (accepted.length && room > 0) {
      onChange([...files, ...accepted.slice(0, room)]);
    }
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);

    if (!disabled) {
      addFiles(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {files.length < max && (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
            dragging && "border-primary bg-primary/5",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImagePlus className="size-6" aria-hidden />
          </span>
          <span className="font-medium">Drop photos here or click to choose</span>
          <span className="text-sm text-muted-foreground">
            {hint ?? `JPG, PNG or WEBP up to ${MAX_IMAGE_MB} MB. ${max - files.length} more allowed.`}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            disabled={disabled}
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) {
                addFiles(event.target.files);
              }

              event.target.value = "";
            }}
          />
        </label>
      )}

      {previews.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map(({ file, url }) => (
            <li key={url} className="group relative overflow-hidden rounded-xl border bg-muted">
              <div className="relative aspect-[4/3]">
                <Image src={url} alt={`Preview of ${file.name}`} fill unoptimized className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs">
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-muted-foreground">{formatBytes(file.size)}</span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(files.filter((item) => item !== file))}
                  aria-label={`Remove ${file.name}`}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition hover:bg-destructive hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {progress !== null && progress !== undefined && <UploadProgress progress={progress} />}
    </div>
  );
}
