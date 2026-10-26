"use client";

import { Eye, Gauge, MoreHorizontal, Wand2 } from "lucide-react";
import Link from "next/link";
import { ComplaintBrowser } from "@/components/complaints/complaint-browser";
import { ExportButton } from "@/components/shared/export-button";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssignComplaint, useChangePriority } from "@/hooks/use-complaint-actions";
import { OPEN_STATUSES, PRIORITY_META } from "@/lib/complaint-meta";
import { PRIORITIES } from "@/lib/filters";
import type { ComplaintListItem, Priority } from "@/types";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { complaintFilterSchema } from "@/lib/filters";

function RowActions({ complaint }: { complaint: ComplaintListItem }) {
  const assign = useAssignComplaint();
  const priority = useChangePriority();
  const canAssign = complaint.status === "SUBMITTED" && !complaint.assignedStaff;
  const canChangePriority = complaint.status === "PENDING_PAYMENT" || OPEN_STATUSES.includes(complaint.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${complaint.trackingCode}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-mono text-xs">{complaint.trackingCode}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/complaints/${complaint.id}`}>
            <Eye /> Open details
          </Link>
        </DropdownMenuItem>
        {canAssign && (
          <DropdownMenuItem disabled={assign.isPending} onSelect={() => assign.mutate({ id: complaint.id })}>
            <Wand2 /> Auto assign
          </DropdownMenuItem>
        )}
        {canChangePriority && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Gauge /> Priority
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={complaint.priority}
                  onValueChange={(value) => value !== complaint.priority && priority.mutate({ id: complaint.id, priority: value as Priority })}
                >
                  {PRIORITIES.map((item) => (
                    <DropdownMenuRadioItem key={item} value={item}>
                      {PRIORITY_META[item].label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ExportComplaints() {
  const { filters } = useUrlFilters(complaintFilterSchema);

  return <ExportButton path="/admin/exports/complaints" params={filters} />;
}

export function AdminComplaints() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints and requests"
        description="Every report in the city. Filter, sort and act on them. The filters stay in the link, so you can share a view."
        actions={<ExportComplaints />}
      />
      <ComplaintBrowser variant="admin" basePath="/admin/complaints" rowActions={(complaint) => <RowActions complaint={complaint} />} />
    </div>
  );
}
