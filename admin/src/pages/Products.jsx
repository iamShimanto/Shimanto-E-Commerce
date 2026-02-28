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

import Button from "../components/ui/Button"
import Select from "../components/ui/Select"

import ProductFormModal from "../features/products/ProductFormModal"
import StatusPill from "../features/products/StatusPill"
import { CATEGORY_OPTIONS } from "../features/products/productConstants"
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

    const [products, setProducts] = useState(() => {
        const now = new Date().toISOString()
        return [
            {
                id: safeId(),
                title: "Premium Hoodie",
                description: "Soft fleece hoodie with premium stitching.",
                category: "cat_clothing",
                price: 1990,
                discountPercentage: 10,
                tags: ["winter", "new"],
                isActive: true,
                thumbnailPreview: "",
                imagesPreview: [],
                variants: [
                    { id: safeId(), sku: "HD-001-BLK-M", color: "Black", sizes: "m", stock: 12 },
                    { id: safeId(), sku: "HD-001-GRY-L", color: "Gray", sizes: "l", stock: 8 },
                ],
                updatedAt: now,
            },
            {
                id: safeId(),
                title: "Running Sneakers",
                description: "Lightweight shoes designed for comfort.",
                category: "cat_shoes",
                price: 3490,
                discountPercentage: 0,
                tags: ["sport"],
                isActive: false,
                thumbnailPreview: "",
                imagesPreview: [],
                variants: [
                    { id: safeId(), sku: "SN-101-WHT-XL", color: "White", sizes: "xl", stock: 6 },
                ],
                updatedAt: now,
            },
        ]
    })

    const editingProduct = useMemo(
        () => products.find((p) => p.id === editingId) || null,
        [products, editingId]
    )

    const initialFormValue = useMemo(() => {
        if (modalMode === "edit" && editingProduct) {
            return {
                ...editingProduct,
                thumbnailFile: null,
                imageFiles: [],
            }
        }
        return {
            id: safeId(),
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

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return products
            .filter((p) => {
                if (status === "active" && !p.isActive) return false
                if (status === "inactive" && p.isActive) return false
                if (category !== "all" && p.category !== category) return false
                if (!q) return true
                const hay = `${p.title} ${p.description} ${(p.tags || []).join(" ")}`.toLowerCase()
                return hay.includes(q)
            })
            .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    }, [products, query, status, category])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, page, pageSize])

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

    const onSubmit = (value) => {
        setProducts((prev) => {
            const now = new Date().toISOString()
            if (modalMode === "edit") {
                return prev.map((p) => (p.id === value.id ? { ...value, updatedAt: now } : p))
            }
            return [{ ...value, updatedAt: now }, ...prev]
        })
    }

    const onDelete = (id) => {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        toast.success("Deleted", "Removed locally (no API)")
    }

    const categoryName = (id) => CATEGORY_OPTIONS.find((c) => c.id === id)?.name || "—"

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Products</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        Design-only catalog manager (no API fetch)
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={openCreate}>
                        <Plus size={18} /> Create product
                    </Button>
                </div>
            </div>

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
                        {CATEGORY_OPTIONS.map((c) => (
                            <option key={c.id} value={c.id}>
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
                            {filtered.length} items
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
                                <Th>Category</Th>
                                <Th className="text-right">Price</Th>
                                <Th className="text-right">Stock</Th>
                                <Th>Status</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.length ? (
                                pageItems.map((p) => {
                                    const totalStock = calcTotalStock(p.variants)
                                    const final = computeFinalPrice(p.price, p.discountPercentage)
                                    return (
                                        <tr
                                            key={p.id}
                                            className="border-t border-(--border) hover:bg-(--surface-2)/70"
                                        >
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)">
                                                        {p.thumbnailPreview ? (
                                                            <img
                                                                src={p.thumbnailPreview}
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
                                                        onClick={() => openEdit(p.id)}
                                                    >
                                                        <Pencil size={16} /> Edit
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => onDelete(p.id)}
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
