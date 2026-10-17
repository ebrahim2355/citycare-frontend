import { ListPageSkeleton } from "@/components/shared/page-skeleton";

export default function Loading() {
  return <ListPageSkeleton stats={4} filters={1} />;
}
