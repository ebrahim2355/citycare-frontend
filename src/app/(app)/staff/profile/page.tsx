import type { Metadata } from "next";
import { ProfileSettings } from "@/components/dashboard/profile/profile-settings";
import { AvailabilityCard } from "@/components/dashboard/staff/availability-card";

export const metadata: Metadata = { title: "Profile and availability" };

export default function StaffProfilePage() {
  return (
    <ProfileSettings
      title="Profile and availability"
      description="Your contact details, your password and whether you take new jobs."
      extra={<AvailabilityCard />}
    />
  );
}
