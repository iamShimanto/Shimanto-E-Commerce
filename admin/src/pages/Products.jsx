import { useMemo, useState } from "react"
import {
    BadgePercent,
    ChevronLeft,
    ChevronRight,
    Package,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react"

import { useToast } from "../hooks/useToast"
import { cn } from "../lib/cn"

import { useGetCategoriesQuery } from "../api/category/categoryApi"
import {
    useCreateProductMutation,
    useGetProductsQuery,
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
    const toast = useToast()

    const [query, setQuery] = useState("")
    const [status, setStatus] = useState("all")
    const [category, setCategory] = useState("all")
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
        search: query.trim() ? query.trim() : undefined,
    })

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()

    const products = useMemo(() => productsResult?.items ?? [], [productsResult])

    const totalPages = Math.max(1, Number(productsResult?.pagination?.totalPages) || 1)

    const editingProduct = useMemo(
        () => products.find((p) => String(p?._id) === String(editingId)) || null,
        [products, editingId]
    )
    // initial form value
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
                imageFiles: [],
                imagesPreview: Array.isArray(editingProduct?.images) ? editingProduct.images : [],
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
            imageFiles: [],
            imagesPreview: [],
            variants: [{ id: safeId(), sku: "", color: "", sizes: "m", stock: 1 }],
            updatedAt: new Date().toISOString(),
        }
    }, [modalMode, editingProduct])

    const pageItems = useMemo(() => {
        if (status === "all") return products
        return products.filter((p) => {
            if (status === "active") return Boolean(p?.isActive)
            if (status === "inactive") return !p?.isActive
            return true
        })
    }, [products, status])

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
    // delete product
    const onDelete = (id) => {
        toast.error("Not implemented", "Delete endpoint not available yet")
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

            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-6">
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

                <div className="lg:col-span-3">
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

                <div className="lg:col-span-3">
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

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">Product list</div>
                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${pageItems.length} items`}
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-(--surface-2) px-3 py-2 text-xs font-extrabold text-(--text-muted)">
                        <BadgePercent size={16} /> Discounts supported
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-245 w-full">
                        <thead>
                            <tr className="bg-(--surface-2)">
                                <Th>Product</Th>
                                <Th>Slug</Th>
                                <Th>Category</Th>
                                <Th className="text-right">Price</Th>
                                <Th className="text-right">Stock</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center">
                                        <div className="text-sm font-extrabold">Loading products…</div>
                                    </td>
                                </tr>
                            ) : pageItems.length ? (
                                pageItems.map((p) => {
                                    const totalStock = calcTotalStock(p.variants)
                                    const final = computeFinalPrice(p.price, p.discountPercentage)
                                    return (
                                        <tr
                                            key={p._id || p.slug}
                                            className="border-t border-(--border) hover:bg-(--surface-2)/70"
                                        >
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)">
                                                        {p.thumbnail || p.thumbnailPreview ? (
                                                            <img
                                                                src={p.thumbnail || p.thumbnailPreview}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package size={18} className="text-(--text-muted)" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-extrabold">
                                                            {p.title}
                                                        </div>
                                                        <div className="truncate text-xs font-semibold text-(--text-muted)">
                                                            {p.tags?.length ? p.tags.map((t) => `#${t}`).join(" ") : "No tags"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="text-sm font-extrabold">{p?.slug}</div>
                                            </Td>
                                            <Td>
                                                <div className="text-sm font-extrabold">{categoryName(p.category)}</div>
                                                <div className="text-xs font-semibold text-(--text-muted)">
                                                    {p.discountPercentage ? `${p.discountPercentage}% off` : "No discount"}
                                                </div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{formatMoneyBDT(p.price)}</div>
                                                <div className="text-xs font-semibold text-(--text-muted)">
                                                    Final: {final == null ? "—" : formatMoneyBDT(final)}
                                                </div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{totalStock}</div>
                                                <div className="text-xs font-semibold text-(--text-muted)">
                                                    {p.variants?.length || 0} variants
                                                </div>
                                            </Td>

                                            <Td>
                                                <StatusPill active={p.isActive} />
                                            </Td>

                                            <Td className="text-right">
                                                <div className="inline-flex items-center gap-2">
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
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => onDelete(String(p?._id))}
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </Button>
                                                </div>
                                            </Td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center">
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
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

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

function Th({ children, className }) {
    return (
        <th
            className={cn(
                "whitespace-nowrap px-5 py-3 text-left text-xs font-extrabold text-(--text-muted)",
                className
            )}
        >
            {children}
        </th>
    )
}

function Td({ children, className }) {
    return (
        <td className={cn("px-5 py-4 align-middle", className)}>{children}</td>
    )
}
