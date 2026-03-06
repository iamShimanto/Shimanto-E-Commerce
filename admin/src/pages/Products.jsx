import { useEffect, useMemo, useState } from "react"
import {
    BadgePercent,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Layers,
    Package,
    Pencil,
    Plus,
    Search,
    Star,
} from "lucide-react"
import { useNavigate } from "react-router"

import { useToast } from "../hooks/useToast"

import { useGetCategoriesQuery } from "../api/category/categoryApi"
import {
    useCreateProductMutation,
    useGetProductsQuery,
    useToggleFeaturedMutation,
    useUpdateProductMutation,
} from "../api/product/productApi"

import Button from "../components/ui/Button"
import Select from "../components/ui/Select"

import ProductFormModal from "../features/products/ProductFormModal"
import StatusPill from "../features/products/StatusPill"
import {
    calcTotalStock,
    computeFinalPrice,
    formatMoneyBDT,
    safeId,
} from "../features/products/productUtils"

export default function Products() {
    const navigate = useNavigate()
    const toast = useToast()

    const [query, setQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [status, setStatus] = useState("all")
    const [category, setCategory] = useState("all")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [page, setPage] = useState(1)
    const pageSize = 8

    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState("create")
    const [editingId, setEditingId] = useState(null)

    const {
        data: categories = [],
    } = useGetCategoriesQuery()

    const {
        data: productsResult,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetProductsQuery({
        page,
        limit: pageSize,
        category: category !== "all" ? category : undefined,
        search: debouncedQuery.trim() ? debouncedQuery.trim() : undefined,
        isActive:
            status === "active"
                ? "true"
                : status === "inactive"
                    ? "false"
                    : "all",
    })

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 500)

        return () => clearTimeout(timer)
    }, [query])

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
    const [toggleFeatured, { isLoading: isTogglingFeatured }] = useToggleFeaturedMutation()

    const products = useMemo(() => productsResult?.items ?? [], [productsResult])

    const totalPages = Math.max(1, Number(productsResult?.pagination?.totalPages) || 1)

    const editingProduct = useMemo(
        () => products.find((p) => String(p?._id) === String(editingId)) || null,
        [products, editingId]
    )
    // initial form valuefor
    const initialFormValue = useMemo(() => {
        if (modalMode === "edit" && editingProduct) {
            return {
                id: String(editingProduct?._id || safeId()),
                slug: editingProduct?.slug,
                title: editingProduct?.title ?? "",
                description: editingProduct?.description ?? "",
                category: String(editingProduct?.category?._id ?? editingProduct?.category ?? ""),
                price: String(editingProduct?.price ?? ""),
                discountPercentage: String(editingProduct?.discountPercentage ?? 0),
                tags: Array.isArray(editingProduct?.tags) ? editingProduct.tags : [],
                isActive: Boolean(editingProduct?.isActive ?? true),
                thumbnailFile: null,
                thumbnailPreview: editingProduct?.thumbnail ?? "",
                existingImages: Array.isArray(editingProduct?.images) ? editingProduct.images : [],
                destroyImages: [],
                imageFiles: [],
                newImagesPreview: [],
                variants: Array.isArray(editingProduct?.variants)
                    ? editingProduct.variants.map((v) => ({
                        id: safeId(),
                        sku: v?.sku ?? "",
                        color: v?.color ?? "",
                        sizes: v?.sizes ?? "m",
                        stock: v?.stock ?? 1,
                    }))
                    : [{ id: safeId(), sku: "", color: "", sizes: "m", stock: 1 }],
                updatedAt: editingProduct?.updatedAt ?? new Date().toISOString(),
            }
        }
        return {
            id: safeId(),
            slug: "",
            title: "",
            description: "",
            category: "",
            price: "",
            discountPercentage: "0",
            tags: [],
            isActive: true,
            thumbnailFile: null,
            thumbnailPreview: "",
            existingImages: [],
            destroyImages: [],
            imageFiles: [],
            newImagesPreview: [],
            variants: [{ id: safeId(), sku: "", color: "", sizes: "m", stock: 1 }],
            updatedAt: new Date().toISOString(),
        }
    }, [modalMode, editingProduct])

    const pageItems = useMemo(() => products, [products])

    const openCreate = () => {
        setModalMode("create")
        setEditingId(null)
        setModalOpen(true)
    }

    const openEdit = (id) => {
        setModalMode("edit")
        setEditingId(id)
        setModalOpen(true)
    }

    const openDetails = (slug) => {
        if (!slug) return
        navigate(`/products/${slug}`)
    }

    const onToggleFeatured = async (slug) => {
        if (!slug) return
        try {
            await toggleFeatured(slug).unwrap()
            toast.success("Updated", "Product featured status updated")
        } catch (err) {
            const msg =
                err?.data?.message ||
                (typeof err?.error === "string" ? err.error : null) ||
                "Request failed"
            toast.error("Error", msg)
        }
    }

    // create and update product
    const onSubmit = async (value) => {
        const payload = {
            title: value.title,
            description: value.description,
            category: value.category,
            price: Number(value.price),
            discountPercentage: Number(value.discountPercentage || 0),
            tags: value.tags || [],
            isActive: Boolean(value.isActive),
            variants: (value.variants || []).map((v) => ({
                sku: String(v.sku || "").trim(),
                color: String(v.color || "").trim(),
                sizes: v.sizes,
                stock: Number(v.stock),
            })),
            thumbnailFile: value.thumbnailFile,
            imageFiles: value.imageFiles || [],
            destroyImages: Array.isArray(value.destroyImages) ? value.destroyImages : [],
        }

        try {
            if (modalMode === "edit" && value.slug) {
                await updateProduct({ slug: value.slug, data: payload }).unwrap()
                toast.success("Updated", "Product updated successfully")
            } else {
                await createProduct(payload).unwrap()
                toast.success("Created", "Product created successfully")
            }
            setModalOpen(false)
        } catch (err) {
            const msg =
                err?.data?.message ||
                (typeof err?.error === "string" ? err.error : null) ||
                "Request failed"
            toast.error("Error", msg)
        }
    }
    // category
    const categoryName = (cat) => {
        if (!cat) return "—"
        if (typeof cat === "object") return cat?.name || cat?.slug || "—"
        const found = categories.find((c) => String(c?._id) === String(cat))
        return found?.name || "—"
    }

    const errorText =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error?.data === "string" ? error.data : null) ||
        (typeof error === "string" ? error : null) ||
        "Failed to load products"

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Products</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        Manage products.
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        {isFetching ? "Refreshing…" : "Refresh"}
                    </Button>
                    <Button type="button" onClick={openCreate}>
                        <Plus size={18} /> Create product
                    </Button>
                </div>
            </div>

            {isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    {errorText}
                </div>
            ) : null}

            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2 shadow-sm">
                        <Search size={16} className="text-(--text-muted)" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setPage(1)
                            }}
                            placeholder="Search by title, description, tags..."
                            className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                        />
                    </div>
                </div>

                <div className="shrink-0">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setFiltersOpen(true)}
                        className="rounded-2xl"
                    >
                        <Filter size={16} /> Filters <ChevronLeft size={16} />
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">Product List</div>
                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${pageItems.length} items`}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="px-5 py-10 text-center">
                        <div className="text-sm font-extrabold">Loading products…</div>
                    </div>
                ) : pageItems.length ? (
                    <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {pageItems.map((p) => {
                            const totalStock = calcTotalStock(p.variants)
                            const final = computeFinalPrice(p.price, p.discountPercentage)

                            return (
                                <article
                                    key={p._id || p.slug}
                                    className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2) shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="relative aspect-16/10 overflow-hidden border-b border-(--border) bg-(--surface)">
                                        <button
                                            type="button"
                                            onClick={() => openDetails(p?.slug)}
                                            className="h-full w-full cursor-pointer"
                                        >
                                            {p.thumbnail || p.thumbnailPreview ? (
                                                <img
                                                    src={p.thumbnail || p.thumbnailPreview}
                                                    alt={p?.title || "Product"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center text-(--text-muted)">
                                                    <Package size={22} />
                                                </div>
                                            )}
                                        </button>

                                        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-xl bg-black/60 px-2.5 py-1 text-[11px] font-extrabold text-white backdrop-blur-sm">
                                            <Layers size={12} /> {p.variants?.length || 0} variants
                                        </div>

                                        {p?.isFeatured ? (
                                            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                                                <Star size={12} className="fill-current" /> Featured
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="space-y-2.5 p-3.5">
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => openDetails(p?.slug)}
                                                className="truncate text-left text-sm font-extrabold hover:underline cursor-pointer"
                                            >
                                                {p.title}
                                            </button>
                                            <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                                                {categoryName(p.category)}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <StatusPill active={p.isActive} />
                                            <div className="rounded-xl border border-(--border) bg-(--surface) px-2.5 py-1 text-[11px] font-extrabold text-(--text-muted)">
                                                Stock {totalStock}
                                            </div>
                                            {p.discountPercentage ? (
                                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                                                    {p.discountPercentage}% OFF
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-(--border) bg-(--surface) p-3">
                                            <div>
                                                <div className="text-[11px] font-extrabold text-(--text-muted)">Price</div>
                                                <div className="mt-0.5 text-sm font-extrabold">{formatMoneyBDT(p.price)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[11px] font-extrabold text-(--text-muted)">Final</div>
                                                <div className="mt-0.5 text-sm font-extrabold">
                                                    {final == null ? "—" : formatMoneyBDT(final)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="truncate text-[11px] font-semibold text-(--text-muted)">
                                            {p.tags?.length ? p.tags.map((t) => `#${t}`).join(" ") : p?.slug || "—"}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => openDetails(p?.slug)}
                                            className="inline-flex items-center gap-1 text-xs font-extrabold text-(--primary) hover:underline cursor-pointer"
                                        >
                                            <Eye size={14} /> View details
                                        </button>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => openEdit(String(p?._id))}
                                            >
                                                <Pencil size={16} /> Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={p?.isFeatured ? "secondary" : "primary"}
                                                size="sm"
                                                onClick={() => onToggleFeatured(p?.slug)}
                                                disabled={isTogglingFeatured}
                                            >
                                                <Star size={16} className={p?.isFeatured ? "fill-current" : ""} />
                                                {p?.isFeatured ? "Featured" : "Feature"}
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                ) : (
                    <div className="px-5 py-10 text-center">
                        <div className="mx-auto max-w-md">
                            <div className="text-sm font-extrabold">No products found</div>
                            <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                                Try changing filters or create a new product.
                            </div>
                            <div className="mt-4">
                                <Button type="button" onClick={openCreate}>
                                    <Plus size={18} /> Create product
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-(--border) px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-semibold text-(--text-muted)">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                        >
                            <ChevronLeft size={16} /> Prev
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className={`fixed inset-0 z-40 transition ${filtersOpen ? "pointer-events-auto" : "pointer-events-none"}`}
                aria-hidden={!filtersOpen}
            >
                <div
                    className={`absolute inset-0 bg-black/35 transition-opacity ${filtersOpen ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setFiltersOpen(false)}
                />

                <aside
                    className={`absolute right-0 top-0 h-full w-full max-w-sm border-l border-(--border) bg-(--surface) p-5 shadow-2xl transition-transform duration-300 ${filtersOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-extrabold">Filters</div>
                            <div className="text-xs font-semibold text-(--text-muted)">
                                Quick refine your products
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setFiltersOpen(false)}
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <div className="mb-2 text-xs font-extrabold text-(--text-muted)">Status</div>
                            <Select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value)
                                    setPage(1)
                                }}
                            >
                                <option value="all">All status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Select>
                        </div>

                        <div>
                            <div className="mb-2 text-xs font-extrabold text-(--text-muted)">Category</div>
                            <Select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value)
                                    setPage(1)
                                }}
                            >
                                <option value="all">All categories</option>
                                {categories
                                    .filter((c) => c?._id && c?.name)
                                    .map((c) => (
                                        <option key={c._id} value={c.slug}>
                                            {c.name}
                                        </option>
                                    ))}
                            </Select>
                        </div>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setStatus("all")
                                setCategory("all")
                                setPage(1)
                            }}
                        >
                            Reset
                        </Button>
                        <Button type="button" onClick={() => setFiltersOpen(false)}>
                            Apply
                        </Button>
                    </div>
                </aside>
            </div>

            <ProductFormModal
                key={`${modalMode}:${modalOpen ? "open" : "closed"}:${editingId || "new"}`}
                open={modalOpen}
                mode={modalMode}
                initialValue={initialFormValue}
                onClose={() => setModalOpen(false)}
                onSubmit={onSubmit}
                categories={categories}
                submitting={isCreating || isUpdating}
            />
        </div>
    )
}
