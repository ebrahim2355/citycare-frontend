import type { Metadata } from "next";
import { SystemStatus } from "@/components/dashboard/admin/system-status";
import { ProfileSettings } from "@/components/dashboard/profile/profile-settings";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <ProfileSettings
      title="Settings"
      description="Your admin account and the health of the platform."
      extra={<SystemStatus />}
    />
  );
}
