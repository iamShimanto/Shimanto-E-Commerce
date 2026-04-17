import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search, ShoppingCart } from "lucide-react"

import { useTotalCartsQuery } from "../api/cart/cartApi"
import { cn } from "../lib/cn"
import { formatMoneyBDT } from "../features/products/productUtils"
import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"
import { formatDateTime } from "../lib/formatDateTime"

function getThumb(product) {
    const t = product?.thumbnail
    if (!t) return ""
    if (Array.isArray(t)) return String(t[0] || "")
    return String(t)
}

function cartTotals(cart) {
    const items = Array.isArray(cart?.items) ? cart.items : []
    const uniqueItems = items.length
    const totalItems =
        Number(cart?.totalItems) ||
        items.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0)
    const totalAmount = items.reduce((sum, i) => sum + (Number(i?.subTotal) || 0), 0)
    return { uniqueItems, totalItems, totalAmount }
}

export default function Cart() {
    const [query, setQuery] = useState("")
    const [page, setPage] = useState(1)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedCart, setSelectedCart] = useState(null)
    const pageSize = 10

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useTotalCartsQuery({
        page,
        limit: pageSize,
        search: query.trim(),
    })

    const carts = useMemo(() => data?.data ?? [], [data])
    const pagination = data?.pagination
    const totalPages = Math.max(1, Number(pagination?.totalPages) || 1)

    const errorText =
        error?.data?.message ||
        (typeof error?.error === "string" ? error.error : null) ||
        "Failed to load carts"

    const openDetails = (cart) => {
        if (!cart) return
        setSelectedCart(cart)
        setDetailsOpen(true)
    }

    const closeDetails = () => {
        setDetailsOpen(false)
        setSelectedCart(null)
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Carts</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        View all user carts and their items.
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
                </div>
            </div>

            {isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    {errorText}
                </div>
            ) : null}

            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-6">
                    <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2 shadow-sm ring-1 ring-black/5">
                        <Search size={16} className="text-(--text-muted)" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setPage(1)
                            }}
                            placeholder="Search customer name or email…"
                            className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">Cart list</div>
                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${carts.length} item(s)`}
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-(--surface-2) px-3 py-2 text-xs font-extrabold text-(--text-muted)">
                        <ShoppingCart size={16} /> Page {page} / {totalPages}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-245 w-full">
                        <thead>
                            <tr className="bg-(--surface-2)">
                                <Th>Customer</Th>
                                <Th>Email</Th>
                                <Th className="text-right">Unique items</Th>
                                <Th className="text-right">Total qty</Th>
                                <Th className="text-right">Total amount</Th>
                                <Th>Updated</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center">
                                        <div className="text-sm font-extrabold">Loading carts…</div>
                                    </td>
                                </tr>
                            ) : carts.length ? (
                                carts.map((c) => {
                                    const id = c?._id ? String(c._id) : ""
                                    const userName = c?.user?.fullName?.trim() || "Unnamed"
                                    const userEmail = c?.user?.email || "—"
                                    const { uniqueItems, totalItems, totalAmount } = cartTotals(c)

                                    return (
                                        <tr
                                            key={id || userEmail}
                                            className="border-t border-(--border) transition-colors hover:bg-(--surface-2)"
                                        >
                                            <Td>
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-extrabold">{userName}</div>
                                                    <div className="truncate text-xs font-semibold text-(--text-muted)">
                                                        Cart ID: {id || "—"}
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="text-sm font-extrabold">{userEmail}</div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{uniqueItems}</div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{totalItems}</div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{formatMoneyBDT(totalAmount)}</div>
                                            </Td>

                                            <Td>
                                                <div className="text-sm font-extrabold">{formatDateTime(c?.updatedAt)}</div>
                                            </Td>

                                            <Td className="text-right">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openDetails(c)}
                                                >
                                                    Details
                                                </Button>
                                            </Td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center">
                                        <div className="mx-auto max-w-md">
                                            <div className="text-sm font-extrabold">No carts found</div>
                                            <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                                                Try changing search.
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
                            disabled={page <= 1 || isFetching}
                        >
                            <ChevronLeft size={16} /> Prev
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isFetching}
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading || isFetching ? (
                <div className="text-xs font-semibold text-(--text-muted)">Fetching carts…</div>
            ) : null}

            <Modal
                open={detailsOpen}
                onClose={closeDetails}
                title="Cart details"
                description={selectedCart?._id ? `Cart ID: ${String(selectedCart._id)}` : ""}
            >
                {selectedCart ? (
                    <CartDetails cart={selectedCart} onClose={closeDetails} />
                ) : (
                    <div className="text-sm font-semibold text-(--text-muted)">No cart selected</div>
                )}
            </Modal>
        </div>
    )
}

function CartDetails({ cart, onClose }) {
    const userName = cart?.user?.fullName?.trim() || "Unnamed"
    const userEmail = cart?.user?.email || "—"
    const { uniqueItems, totalItems, totalAmount } = cartTotals(cart)
    const items = Array.isArray(cart?.items) ? cart.items : []

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem label="Customer" value={userName} />
                <DetailItem label="Email" value={userEmail} />
                <DetailItem label="Unique items" value={String(uniqueItems)} />
                <DetailItem label="Total qty" value={String(totalItems)} />
                <DetailItem label="Created" value={formatDateTime(cart?.createdAt)} />
                <DetailItem label="Updated" value={formatDateTime(cart?.updatedAt)} />
                <DetailItem
                    label="Total amount"
                    value={formatMoneyBDT(totalAmount)}
                    className="sm:col-span-2"
                />
            </div>

            <div className="rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">Items</div>
                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                            {items.length ? `${items.length} line(s)` : "No items"}
                        </div>
                    </div>
                </div>

                {items.length ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-(--surface-2)">
                                    <Th>Product</Th>
                                    <Th>SKU</Th>
                                    <Th className="text-right">Qty</Th>
                                    <Th className="text-right">Sub total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((it, idx) => {
                                    const p = it?.product
                                    const title = p?.title || "Unknown product"
                                    const slug = p?.slug
                                    const thumb = getThumb(p)
                                    const sku = it?.sku ? String(it.sku) : "—"
                                    const qty = Number(it?.quantity) || 0
                                    const sub = Number(it?.subTotal) || 0

                                    return (
                                        <tr key={`${sku}-${idx}`} className="border-t border-(--border)">
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2)">
                                                        {thumb ? (
                                                            <img
                                                                src={thumb}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="text-[11px] font-extrabold text-(--text-muted)">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-extrabold">{title}</div>
                                                        <div className="truncate text-xs font-semibold text-(--text-muted)">
                                                            {slug ? `Slug: ${slug}` : "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="text-sm font-extrabold">{sku}</div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{qty}</div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{formatMoneyBDT(sub)}</div>
                                            </Td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-5 py-6 text-sm font-semibold text-(--text-muted)">
                        This cart is empty.
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    )
}

function DetailItem({ label, value, className, valueClassName }) {
    return (
        <div className={cn("rounded-2xl border border-(--border) bg-(--surface-2) p-3", className)}>
            <div className="text-xs font-extrabold uppercase tracking-wide text-(--text-muted)">
                {label}
            </div>
            <div className={cn("mt-1 text-sm font-extrabold text-(--text)", valueClassName)}>
                {value}
            </div>
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
    return <td className={cn("px-5 py-4 align-middle", className)}>{children}</td>
}
