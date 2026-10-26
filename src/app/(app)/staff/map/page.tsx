import type { Metadata } from "next";
import { ComplaintsMapView } from "@/components/dashboard/complaints-map-view";

export const metadata: Metadata = { title: "Jobs map" };

export default function StaffMapPage() {
  return <ComplaintsMapView role="STAFF" />;
}
