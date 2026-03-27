export const ProductGridSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
            <div
                key={i}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
                <div className="aspect-4/5 animate-pulse bg-gray-100 dark:bg-zinc-900" />
                <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
                    <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
                </div>
            </div>
        ))}
    </div>
);
