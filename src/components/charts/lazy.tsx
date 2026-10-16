"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const chartLoading = () => <Skeleton className="h-56 w-full rounded-xl" />;

export const LazyStatusDonut = dynamic(() => import("@/components/charts/status-donut"), { ssr: false, loading: chartLoading });
