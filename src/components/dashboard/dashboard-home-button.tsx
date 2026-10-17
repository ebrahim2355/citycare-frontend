"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { ROLE_HOME } from "@/lib/roles";

export function DashboardHomeButton() {
  const { user } = useSession();

  return (
    <Button asChild>
      <Link href={user ? ROLE_HOME[user.role] : "/"}>
        <LayoutDashboard data-icon="inline-start" />
        Back to my dashboard
      </Link>
    </Button>
  );
}
