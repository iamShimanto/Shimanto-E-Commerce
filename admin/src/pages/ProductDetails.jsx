import { useMemo, useState } from "react"
import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    Layers,
    Package,
    Tag,
} from "lucide-react"
import { useNavigate, useParams } from "react-router"

import { useGetSingleProductQuery } from "../api/product/productApi"
import { useGetCategoriesQuery } from "../api/category/categoryApi"
import Button from "../components/ui/Button"
import StatusPill from "../features/products/StatusPill"
import { calcTotalStock, computeFinalPrice, formatMoneyBDT } from "../features/products/productUtils"
import { cn } from "../lib/cn"

function formatDate(value) {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString()
}

export default function ProductDetails() {
    const navigate = useNavigate()
    const { slug } = useParams()

    const {
        data: productResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetSingleProductQuery(slug, { skip: !slug })

    const {
        data: categories = [],
    } = useGetCategoriesQuery()

    const product = useMemo(() => {
        return productResponse?.data ?? productResponse ?? null
    }, [productResponse])

    const gallery = useMemo(() => {
        if (!product) return []
        const all = [product?.thumbnail, ...(Array.isArray(product?.images) ? product.images : [])]
        return Array.from(new Set(all.filter(Boolean)))
    }, [product])

    const [activeImage, setActiveImage] = useState("")
    const displayImage = gallery.includes(activeImage) ? activeImage : (gallery[0] || "")

    const categoryName = useMemo(() => {
        const cat = product?.category
        if (!cat) return "—"
        if (typeof cat === "object") return cat?.name || cat?.slug || "—"
        const found = categories.find((c) => String(c?._id) === String(cat))
        return found?.name || "—"
    }, [categories, product?.category])

    const variants = Array.isArray(product?.variants) ? product.variants : []
    const tags = Array.isArray(product?.tags) ? product.tags : []
    const totalStock = calcTotalStock(variants)
    const finalPrice = computeFinalPrice(product?.price, product?.discountPercentage)

    const errorText =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error?.data === "string" ? error.data : null) ||
        (typeof error === "string" ? error : null) ||
        "Failed to load product"

    if (isLoading) {
        return (
            <div className="space-y-5">
                <div className="h-11 w-44 animate-pulse rounded-2xl bg-(--surface-2)" />
                <div className="grid gap-5 lg:grid-cols-5">
                    <div className="h-96 animate-pulse rounded-3xl bg-(--surface-2) lg:col-span-3" />
                    <div className="h-96 animate-pulse rounded-3xl bg-(--surface-2) lg:col-span-2" />
                </div>
            </div>
        )
    }

    if (isError || !product) {
        return (
            <div className="space-y-5">
                <Button type="button" variant="secondary" onClick={() => navigate("/products")}>
                    <ArrowLeft size={16} /> Back to products
                </Button>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
                    {errorText}
                </div>

                <Button type="button" onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? "Retrying…" : "Retry"}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="secondary" onClick={() => navigate("/products")}>
                    <ArrowLeft size={16} /> Back to products
                </Button>
            </div>

            <section className="grid gap-5 lg:grid-cols-5">
                <div className="space-y-3 lg:col-span-3">
                    <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                        <div className="aspect-16/10 bg-(--surface-2)">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={product?.title || "Product"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="grid h-full w-full place-items-center text-(--text-muted)">
                                    <Package size={26} />
                                </div>
                            )}
                        </div>
                    </div>

                    {gallery.length > 1 ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                            {gallery.map((src) => (
                                <button
                                    key={src}
                                    type="button"
                                    onClick={() => setActiveImage(src)}
                                    className={cn(
                                        "aspect-square overflow-hidden rounded-2xl border bg-(--surface-2)",
                                        src === displayImage ? "border-(--primary) ring-2 ring-(--primary)/25" : "border-(--border)"
                                    )}
                                >
                                    <img src={src} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    ) : null}

                    <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm ring-1 ring-black/5">
                        <div className="text-sm font-extrabold">Description</div>
                        <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-(--text-muted)">
                            {product?.description || "No description"}
                        </p>
                    </div>
                </div>

                <aside className="space-y-4 lg:col-span-2">
                    <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm ring-1 ring-black/5">
                        <div className="text-xl font-extrabold tracking-tight">{product?.title || "Untitled product"}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusPill active={Boolean(product?.isActive)} />
                            {product?.isFeatured ? (
                                <span className="rounded-xl bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
                                    Featured
                                </span>
                            ) : null}
                            <span className="rounded-xl border border-(--border) bg-(--surface-2) px-2.5 py-1 text-[11px] font-extrabold text-(--text-muted)">
                                {categoryName}
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                            <div>
                                <div className="text-[11px] font-extrabold text-(--text-muted)">Price</div>
                                <div className="mt-0.5 text-sm font-extrabold">{formatMoneyBDT(product?.price)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] font-extrabold text-(--text-muted)">Final</div>
                                <div className="mt-0.5 text-sm font-extrabold">
                                    {finalPrice == null ? "—" : formatMoneyBDT(finalPrice)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs font-semibold text-(--text-muted)">
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-(--surface-2) px-3 py-2">
                                <span className="inline-flex items-center gap-1.5"><Layers size={14} /> Variants</span>
                                <span className="font-extrabold text-(--text)">{variants.length}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-(--surface-2) px-3 py-2">
                                <span className="inline-flex items-center gap-1.5"><Package size={14} /> Total stock</span>
                                <span className="font-extrabold text-(--text)">{totalStock}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-(--surface-2) px-3 py-2">
                                <span className="inline-flex items-center gap-1.5"><Tag size={14} /> Slug</span>
                                <span className="truncate pl-2 font-extrabold text-(--text)">{product?.slug || "—"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-(--surface-2) px-3 py-2">
                                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Updated</span>
                                <span className="font-extrabold text-(--text)">{formatDate(product?.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm ring-1 ring-black/5">
                        <div className="mb-2 inline-flex items-center gap-1.5 text-sm font-extrabold">
                            <CircleDollarSign size={16} /> Tags
                        </div>
                        {tags.length ? (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-xl border border-(--border) bg-(--surface-2) px-2.5 py-1 text-[11px] font-extrabold"
                                    >
                                        #{t}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs font-semibold text-(--text-muted)">No tags</div>
                        )}
                    </div>
                </aside>
            </section>

            <section className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm ring-1 ring-black/5">
                <div className="mb-3 text-sm font-extrabold">Variants details</div>
                {variants.length ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-(--border)">
                                    <th className="px-3 py-2 text-left text-xs font-extrabold text-(--text-muted)">SKU</th>
                                    <th className="px-3 py-2 text-left text-xs font-extrabold text-(--text-muted)">Color</th>
                                    <th className="px-3 py-2 text-left text-xs font-extrabold text-(--text-muted)">Size</th>
                                    <th className="px-3 py-2 text-right text-xs font-extrabold text-(--text-muted)">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map((v, idx) => (
                                    <tr key={`${v?.sku || "v"}-${idx}`} className="border-b border-(--border)/60">
                                        <td className="px-3 py-2 text-sm font-semibold">{v?.sku || "—"}</td>
                                        <td className="px-3 py-2 text-sm font-semibold">{v?.color || "—"}</td>
                                        <td className="px-3 py-2 text-sm font-semibold uppercase">{v?.sizes || "—"}</td>
                                        <td className="px-3 py-2 text-right text-sm font-extrabold">{Number(v?.stock) || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-sm font-semibold text-(--text-muted)">No variants available</div>
                )}
            </section>
        </div>
    )
}
