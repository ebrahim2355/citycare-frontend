"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChangeStatus } from "@/hooks/use-complaint-actions";

export function StartWorkButton({ id, size = "sm" }: { id: string; size?: "sm" | "default" | "lg" }) {
  const change = useChangeStatus();

  return (
    <Button
      size={size}
      onClick={(event) => {
        event.preventDefault();
        change.mutate({ id, status: "IN_PROGRESS" });
      }}
      disabled={change.isPending}
    >
      <Play data-icon="inline-start" />
      Start work
    </Button>
  );
}
