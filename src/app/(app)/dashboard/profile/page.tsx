import type { Metadata } from "next";
import { ProfileSettings } from "@/components/dashboard/profile/profile-settings";

export const metadata: Metadata = { title: "Profile" };

export default function CitizenProfilePage() {
  return <ProfileSettings title="Profile" description="Your contact details and password." />;
}
