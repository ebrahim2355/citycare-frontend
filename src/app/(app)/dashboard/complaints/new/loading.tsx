import { HeaderSkeleton } from "@/components/shared/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HeaderSkeleton />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[520px] rounded-xl" />
    </div>
  );
}
