"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAssignComplaint } from "@/hooks/use-complaint-actions";

export function AutoAssignButton({ id, size = "sm" }: { id: string; size?: "sm" | "default" }) {
  const assign = useAssignComplaint();

  return (
    <Button size={size} variant="secondary" onClick={() => assign.mutate({ id })} disabled={assign.isPending}>
      {assign.isPending ? <Spinner /> : <Wand2 data-icon="inline-start" />}
      Auto assign
    </Button>
  );
}
