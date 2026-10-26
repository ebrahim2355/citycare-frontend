import { HeaderSkeleton } from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Skeleton className="h-[36rem] rounded-xl" />
        <Skeleton className="h-[36rem] rounded-xl" />
      </div>
    </div>
  );
}
