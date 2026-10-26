import type { Metadata } from "next";
import { ComplaintsMapView } from "@/components/dashboard/complaints-map-view";

export const metadata: Metadata = { title: "City map" };

export default function AdminMapPage() {
  return <ComplaintsMapView role="ADMIN" />;
}
