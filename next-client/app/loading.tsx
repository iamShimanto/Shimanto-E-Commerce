import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>

        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
