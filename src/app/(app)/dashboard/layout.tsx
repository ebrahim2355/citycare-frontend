import { RoleGuard } from "@/components/dashboard/role-guard";

export default function CitizenLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <RoleGuard role="CITIZEN" />
      {children}
    </>
  );
}
