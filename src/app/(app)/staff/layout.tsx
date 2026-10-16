import { RoleGuard } from "@/components/dashboard/role-guard";

export default function StaffLayout({ children }: LayoutProps<"/staff">) {
  return (
    <>
      <RoleGuard role="STAFF" />
      {children}
    </>
  );
}
