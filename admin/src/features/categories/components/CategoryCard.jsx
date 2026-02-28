import { Pencil } from "lucide-react"

import { cn } from "../../../lib/cn"

import Button from "../../../components/ui/Button"

export function CategoryCardSkeleton({ index }) {
    return (
        <div
            key={`sk_${index}`}
            className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm"
        >
            <div className="h-38 w-full animate-pulse bg-(--surface-2)" />
            <div className="p-4">
                <div className="h-4 w-1/2 animate-pulse rounded bg-(--surface-2)" />
                <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-(--surface-2)" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-(--surface-2)" />
            </div>
        </div>
    )
}

export default function CategoryCard({ category, onEdit }) {
    return (
        <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm">
            <div className="relative h-38 w-full bg-(--surface-2)">
                {category?.thumbnail ? (
                    <img
                        src={category.thumbnail}
                        alt={category?.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : null}

                <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/0 to-black/0" />

                <div className="absolute bottom-3 left-3 right-3">
                    <div className="truncate text-sm font-extrabold text-white">
                        {category?.name}
                    </div>
                    <div className="truncate text-xs font-semibold text-white/80">
                        /{category?.slug}
                    </div>
                </div>

                <div className="absolute right-3 top-3">
                    <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="border-white/25! bg-white/90! text-slate-900! shadow-sm shadow-black/10 backdrop-blur hover:bg-white!"
                        onClick={() => onEdit?.(category)}
                        aria-label="Edit category"
                    >
                        <Pencil size={16} />
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">
                            {category?.name}
                        </div>
                        <div className="truncate text-xs font-semibold text-(--text-muted)">
                            {category?.slug}
                        </div>
                    </div>

                    <div
                        className={cn(
                            "shrink-0 rounded-xl border px-3 py-1 text-xs font-extrabold",
                            category?.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-(--surface-2) text-(--text-muted)"
                        )}
                    >
                        {category?.isActive ? "Active" : "Inactive"}
                    </div>
                </div>

                {category?.description ? (
                    <div className="mt-3 line-clamp-3 text-sm font-semibold text-(--text-muted)">
                        {category.description}
                    </div>
                ) : (
                    <div className="mt-3 text-sm font-semibold text-(--text-muted)">
                        No description
                    </div>
                )}
            </div>
        </div>
    )
}
