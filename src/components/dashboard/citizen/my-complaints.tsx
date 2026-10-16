"use client";

import { FilePlus2 } from "lucide-react";
import Link from "next/link";
import { ComplaintBrowser } from "@/components/complaints/complaint-browser";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export function MyComplaints() {
  const newReport = (
    <Button asChild>
      <Link href="/dashboard/complaints/new">
        <FilePlus2 data-icon="inline-start" />
        New report
      </Link>
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My reports"
        description="Every problem and service request you sent, with its status and deadline."
        actions={newReport}
      />
      <ComplaintBrowser variant="citizen" basePath="/dashboard/complaints" emptyAction={newReport} />
    </div>
  );
}
