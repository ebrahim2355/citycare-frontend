import { RoleGuard } from "@/components/dashboard/role-guard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <RoleGuard role="ADMIN" />
      {children}
    </>
  );
}
