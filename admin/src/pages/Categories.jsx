import { useMemo, useState } from "react"
import { Plus, RefreshCcw, Search } from "lucide-react"
import { cn } from "../lib/cn"
import Button from "../components/ui/Button"
import CategoryCard, { CategoryCardSkeleton } from "../features/categories/components/CategoryCard"
import CategoryCreateModal from "../features/categories/components/CategoryCreateModal"
import CategoryEditModal from "../features/categories/components/CategoryEditModal"
import { safeText } from "../features/categories/categoryUtils"
import { useGetCategoriesQuery } from "../api/category/categoryApi"

export default function Categories() {
    const [query, setQuery] = useState("")
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const {
        data: categories = [],
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetCategoriesQuery()

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return categories

        return categories.filter((c) => {
            const hay = `${safeText(c?.name)} ${safeText(c?.slug)} ${safeText(c?.description)}`
                .toLowerCase()
                .trim()
            return hay.includes(q)
        })
    }, [categories, query])

    const openEdit = (category) => {
        setEditing(category)
        setEditOpen(true)
    }

    const errorText =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error?.data === "string" ? error.data : null) ||
        (typeof error === "string" ? error : null) ||
        "Failed to load categories"

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Categories</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        Create categories and manage product grouping.
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCcw size={16} />
                        {isFetching ? "Refreshing…" : "Refresh"}
                    </Button>
                    <Button type="button" onClick={() => setCreateOpen(true)}>
                        <Plus size={18} /> Create category
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-6">
                    <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2 shadow-sm">
                        <Search size={16} className="text-(--text-muted)" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, slug, description…"
                            className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                        />
                    </div>
                </div>
                <div className="lg:col-span-6">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 shadow-sm">
                        <div className="text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${filtered.length} categories`}
                        </div>
                        <div
                            className={cn(
                                "text-xs font-extrabold",
                                isFetching ? "text-(--primary)" : "text-(--text-muted)"
                            )}
                        >
                            {isFetching ? "Syncing" : "Up to date"}
                        </div>
                    </div>
                </div>
            </div>

            {isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    {errorText}
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, idx) => (
                        <CategoryCardSkeleton key={idx} index={idx} />
                    ))
                    : filtered.map((c) => (
                        <CategoryCard key={c._id} category={c} onEdit={openEdit} />
                    ))}
            </div>

            <CategoryCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />

            <CategoryEditModal
                key={`${editOpen ? "open" : "closed"}:${editing?.slug || ""}`}
                open={editOpen}
                category={editing}
                onClose={() => {
                    setEditOpen(false)
                    setEditing(null)
                }}
            />
        </div>
    )
}
