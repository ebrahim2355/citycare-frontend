import { Suspense } from "react";
import { requireUser } from "@/lib/server/session";
import type { Role } from "@/types";

async function Check({ role }: { role: Role }) {
  await requireUser([role]);

  return null;
}

export function RoleGuard({ role }: { role: Role }) {
  return (
    <Suspense fallback={null}>
      <Check role={role} />
    </Suspense>
  );
}
