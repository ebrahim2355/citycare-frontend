"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getErrorText } from "@/lib/api/errors";
import { buildQuery, parseResponse } from "@/lib/api/http";
import type { QueryParams } from "@/types";

interface ExportButtonProps {
  path: string;
  params?: QueryParams;
  label?: string;
}

const fileNameOf = (response: Response) => /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? "citycare-export.csv";

export function ExportButton({ path, params, label = "Export CSV" }: ExportButtonProps) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);

    try {
      const response = await fetch(`/api/backend${path}${buildQuery(params)}`, { credentials: "same-origin" });

      if (!response.ok || !(response.headers.get("content-type") ?? "").startsWith("text/csv")) {
        await parseResponse(response);
      }

      const name = fileNameOf(response);
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");

      link.href = url;
      link.download = name;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Your file is ready", { description: name });
    } catch (error) {
      const { title, description } = getErrorText(error);

      toast.error(title, { description });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={download} disabled={busy}>
      {busy ? <Spinner /> : <Download data-icon="inline-start" />}
      {busy ? "Preparing file" : label}
    </Button>
  );
}
