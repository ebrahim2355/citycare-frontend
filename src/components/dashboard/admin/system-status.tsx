"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, BookOpen, Database, ExternalLink, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { clientFetcher } from "@/lib/api/client";
import { getErrorText } from "@/lib/api/errors";
import { formatHours } from "@/lib/format";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Health {
  database: string;
  redis: string;
  uptime: number;
}

function Row({ icon: Icon, label, value, ok }: { icon: typeof Database; label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </span>
      <span className="flex items-center gap-2 font-medium">
        <span className={cn("size-2 rounded-full", ok ? "bg-emerald-500" : "bg-amber-500")} aria-hidden />
        {value}
      </span>
    </div>
  );
}

export function SystemStatus() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => clientFetcher.get<Health>("/health"),
    refetchInterval: 30000,
    retry: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4.5 text-primary" aria-hidden />
          System status
        </CardTitle>
        <CardDescription>Checked every 30 seconds through the API health endpoint.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {health.isPending && <Skeleton className="h-20 rounded-lg" />}
        {health.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{getErrorText(health.error).title}</p>
        )}
        {health.data && (
          <div className="space-y-3">
            <Row icon={Server} label="API" value="Running" ok />
            <Row icon={Database} label="Database" value={health.data.database === "up" ? "Connected" : "Down"} ok={health.data.database === "up"} />
            <Row
              icon={Activity}
              label="Cache and rate limit"
              value={health.data.redis === "up" ? "Redis connected" : health.data.redis === "disabled" ? "Memory only" : "Redis down"}
              ok={health.data.redis === "up"}
            />
            <p className="text-xs text-muted-foreground">Current API instance up for {formatHours(health.data.uptime / 3600)}.</p>
          </div>
        )}
        <Button asChild variant="outline" className="w-full">
          <a href={SITE.apiDocsUrl} target="_blank" rel="noreferrer">
            <BookOpen data-icon="inline-start" />
            Open the API docs
            <ExternalLink data-icon="inline-end" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
