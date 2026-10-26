"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const mapLoading = (height: string) =>
  function MapLoading() {
    return <Skeleton className={`${height} w-full rounded-xl`} />;
  };

export const LazyLocationPicker = dynamic(() => import("@/components/map/location-picker"), {
  ssr: false,
  loading: mapLoading("h-72"),
});

export const LazyLocationPreview = dynamic(() => import("@/components/map/location-preview"), {
  ssr: false,
  loading: mapLoading("h-56"),
});

export const LazyReportMap = dynamic(() => import("@/components/map/report-map"), {
  ssr: false,
  loading: mapLoading("h-[28rem]"),
});
