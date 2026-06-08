import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-md border-card-border bg-card">
      <Skeleton className="h-5 w-1/3 bg-muted" />
      <Skeleton className="h-8 w-8 rounded-md bg-muted" />
    </div>
  );
}