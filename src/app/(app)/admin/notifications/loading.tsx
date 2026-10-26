import { ListPageSkeleton } from "@/components/shared/page-skeleton";

export default function Loading() {
  return <ListPageSkeleton filters={1} rows={8} action />;
}
