import { ListPageSkeleton } from "@/components/shared/page-skeleton";

export default function Loading() {
  return <ListPageSkeleton filters={0} rows={6} action />;
}
