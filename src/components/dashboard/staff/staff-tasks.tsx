"use client";

import { ComplaintBrowser } from "@/components/complaints/complaint-browser";
import { StartWorkButton } from "@/components/dashboard/staff/start-work-button";
import { PageHeader } from "@/components/shared/page-header";

export function StaffTasks() {
  return (
    <div className="space-y-6">
      <PageHeader title="My tasks" description="Everything assigned to you. Use the filters to find late or urgent jobs." />
      <ComplaintBrowser
        variant="staff"
        basePath="/staff/tasks"
        rowActions={(complaint) => (complaint.status === "ASSIGNED" ? <StartWorkButton id={complaint.id} /> : null)}
      />
    </div>
  );
}
