import { useEffect, useMemo, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    Search,
} from "lucide-react"

import { useGetOrdersQuery, useUpdateOrderStatusMutation } from "../api/order/orderApi"
import { useToast } from "../hooks/useToast"
import { cn } from "../lib/cn"
import { formatMoneyBDT } from "../features/products/productUtils"

import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"
import Select from "../components/ui/Select"
import { formatDateTime } from "../lib/formatDateTime"

const toErrorMessage = (error, fallback = "Request failed") =>
    error?.data?.message ||
    error?.data?.error ||
    (typeof error?.data === "string" ? error.data : null) ||
    (typeof error?.error === "string" ? error.error : null) ||
    fallback

function pickCustomer(order) {
    const userName = order?.user?.fullName?.trim()
    const userEmail = order?.user?.email?.trim()
    const shipName = order?.shippingAddress?.fullName?.trim()
    const shipEmail = order?.shippingAddress?.email?.trim()

    return {
        name: userName || shipName || "Unnamed",
        email: userEmail || shipEmail || "—",
    }
}

function StatusPill({ value, variant = "neutral" }) {
    const base =
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset"
    const styles = {
        neutral: "bg-(--surface-2) text-(--text-muted) ring-(--border)",
        ok: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
        warn: "bg-amber-50 text-amber-700 ring-amber-200/70",
        bad: "bg-rose-50 text-rose-700 ring-rose-200/70",
        info: "bg-sky-50 text-sky-700 ring-sky-200/70",
    }

    return <span className={cn(base, styles[variant] || styles.neutral)}>{value || "—"}</span>
}

function paymentVariant(status) {
    const s = String(status || "").toLowerCase()
    if (s === "paid") return "ok"
    if (s === "pending") return "warn"
    if (s === "failed" || s === "refunded") return "bad"
    return "neutral"
}

function orderVariant(status) {
    const s = String(status || "").toLowerCase()
    if (s === "delivered") return "ok"
    if (s === "shipped" || s === "processing" || s === "confirmed") return "info"
    if (s === "cancelled") return "bad"
    if (s === "pending") return "warn"
    return "neutral"
}

function Th({ children, className }) {
    return (
        <th
            className={cn(
                "px-5 py-3 text-left text-xs font-extrabold text-(--text-muted)",
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

export default function Orders() {
    const toast = useToast()

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [page, setPage] = useState(1)
    const pageSize = 10

    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)

    const [optimisticStatuses, setOptimisticStatuses] = useState({})

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
        }, 350)

        return () => clearTimeout(timer)
    }, [search])

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetOrdersQuery({
        page,
        limit: pageSize,
        search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
    })

    const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
        useUpdateOrderStatusMutation()

    const orders = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data])
    const pagination = data?.pagination
    const totalPages = Math.max(1, Number(pagination?.totalPages) || 1)

    const errorText = toErrorMessage(error, "Failed to load orders")

    const openDetails = (order) => {
        if (!order) return
        setSelectedOrder(order)
        setDetailsOpen(true)
    }

    const closeDetails = () => {
        setDetailsOpen(false)
        setSelectedOrder(null)
    }

    const onChangeStatus = async (order, next) => {
        const id = order?._id ? String(order._id) : ""
        if (!id) return
        const prev = String(order?.orderStatus || "pending")
        const nextStatus = String(next || "").trim()
        if (!nextStatus || nextStatus === prev) return

        setOptimisticStatuses((p) => ({ ...p, [id]: nextStatus }))
        try {
            await updateOrderStatus({ id, status: nextStatus }).unwrap()
            toast.success("Updated", "Order status updated")
        } catch (err) {
            toast.error("Update failed", toErrorMessage(err, "Failed to update order status"))
            setOptimisticStatuses((p) => {
                const copy = { ...p }
                delete copy[id]
                return copy
            })
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Orders</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        View and manage customer orders, payments and fulfillment.
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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search transaction id, email, full name…"
                            className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                        />
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 shadow-sm">
                        <div className="text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${pagination?.total ?? orders.length} total`}
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

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">Order list</div>
                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${orders.length} item(s)`}
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-(--surface-2) px-3 py-2 text-xs font-extrabold text-(--text-muted)">
                        Page {page} / {totalPages}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-245 w-full">
                        <thead>
                            <tr className="bg-(--surface-2)">
                                <Th>Transaction</Th>
                                <Th>Customer</Th>
                                <Th className="text-right">Total</Th>
                                <Th>Payment</Th>
                                <Th>Status</Th>
                                <Th>Created</Th>
                                <Th className="text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center">
                                        <div className="text-sm font-extrabold">Loading orders…</div>
                                    </td>
                                </tr>
                            ) : orders.length ? (
                                orders.map((o) => {
                                    const id = o?._id ? String(o._id) : ""
                                    const { name, email } = pickCustomer(o)
                                    const transactionId = o?.transactionId || "—"
                                    const total = Number(o?.totalAmount) || 0
                                    const paymentMethod = String(o?.paymentMethod || "—")
                                    const paymentStatus = String(o?.paymentStatus || "—")
                                    const orderStatusServer = String(o?.orderStatus || "pending")
                                    const orderStatus =
                                        typeof optimisticStatuses[id] === "string"
                                            ? optimisticStatuses[id]
                                            : orderStatusServer

                                    return (
                                        <tr
                                            key={id || transactionId}
                                            className="border-t border-(--border) transition-colors hover:bg-(--surface-2)"
                                        >
                                            <Td>
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-extrabold">
                                                        {transactionId}
                                                    </div>
                                                    <div className="truncate text-xs font-semibold text-(--text-muted)">
                                                        Order ID: {id || "—"}
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-extrabold">{name}</div>
                                                    <div className="truncate text-xs font-semibold text-(--text-muted)">
                                                        {email}
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td className="text-right">
                                                <div className="text-sm font-extrabold">{formatMoneyBDT(total)}</div>
                                            </Td>

                                            <Td>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs font-extrabold">
                                                        {paymentMethod.toUpperCase()}
                                                    </div>
                                                    <StatusPill
                                                        value={paymentStatus}
                                                        variant={paymentVariant(paymentStatus)}
                                                    />
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={orderStatus}
                                                        onChange={(e) => onChangeStatus(o, e.target.value)}
                                                        disabled={isUpdatingStatus}
                                                        className="w-40"
                                                    >
                                                        <option value="pending">pending</option>
                                                        <option value="confirmed">confirmed</option>
                                                        <option value="processing">processing</option>
                                                        <option value="shipped">shipped</option>
                                                        <option value="delivered">delivered</option>
                                                        <option value="cancelled">cancelled</option>
                                                    </Select>
                                                    <StatusPill value={orderStatus} variant={orderVariant(orderStatus)} />
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="text-sm font-extrabold">
                                                    {formatDateTime(o?.createdAt)}
                                                </div>
                                            </Td>

                                            <Td className="text-right">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openDetails(o)}
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
                                            <div className="text-sm font-extrabold">No orders found</div>
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
                <div className="text-xs font-semibold text-(--text-muted)">Fetching orders…</div>
            ) : null}

            <Modal
                open={detailsOpen}
                title="Order details"
                description={selectedOrder?.transactionId ? `Transaction: ${selectedOrder.transactionId}` : ""}
                onClose={closeDetails}
            >
                {!selectedOrder ? (
                    <div className="py-6 text-center text-sm font-semibold text-(--text-muted)">
                        No order selected.
                    </div>
                ) : (
                    <OrderDetails order={selectedOrder} />
                )}
            </Modal>
        </div>
    )
}

function OrderDetails({ order }) {
    const { name, email } = pickCustomer(order)
    const address = order?.shippingAddress?.address || "—"
    const phone = order?.shippingAddress?.phone || "—"
    const items = Array.isArray(order?.items) ? order.items : []

    return (
        <div className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-6 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-sm font-extrabold">Customer</div>
                    <div className="mt-2 text-sm font-semibold text-(--text)">{name}</div>
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">{email}</div>
                </div>

                <div className="lg:col-span-6 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-sm font-extrabold">Shipping</div>
                    <div className="mt-2 text-sm font-semibold text-(--text)">{address}</div>
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">Phone: {phone}</div>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-xs font-semibold text-(--text-muted)">Payment method</div>
                    <div className="mt-1 text-sm font-extrabold">{String(order?.paymentMethod || "—")}</div>
                </div>
                <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-xs font-semibold text-(--text-muted)">Payment status</div>
                    <div className="mt-1 text-sm font-extrabold">{String(order?.paymentStatus || "—")}</div>
                </div>
                <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-xs font-semibold text-(--text-muted)">Order status</div>
                    <div className="mt-1 text-sm font-extrabold">{String(order?.orderStatus || "—")}</div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="text-sm font-extrabold">Items</div>
                    <div className="text-xs font-semibold text-(--text-muted)">{items.length} item(s)</div>
                </div>
                {items.length ? (
                    <div className="divide-y divide-(--border)">
                        {items.map((it, idx) => {
                            const title = it?.title || "—"
                            const qty = Number(it?.quantity) || 0
                            const price = Number(it?.price) || 0
                            const subTotal = Number(it?.subTotal) || qty * price
                            const sku = it?.sku ? String(it.sku) : "—"
                            return (
                                <div
                                    key={String(it?.product || it?._id || sku) + idx}
                                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-extrabold">{title}</div>
                                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                                            SKU: {sku}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                                        <span className="rounded-2xl bg-(--surface-2) px-3 py-2 text-(--text-muted)">
                                            Qty: {qty}
                                        </span>
                                        <span className="rounded-2xl bg-(--surface-2) px-3 py-2 text-(--text-muted)">
                                            Price: {formatMoneyBDT(price)}
                                        </span>
                                        <span className="rounded-2xl bg-(--surface-2) px-3 py-2 text-(--text-muted)">
                                            Subtotal: {formatMoneyBDT(subTotal)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="px-5 py-10 text-center text-sm font-semibold text-(--text-muted)">
                        No items.
                    </div>
                )}
            </div>

            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-xs font-semibold text-(--text-muted)">Subtotal</div>
                    <div className="mt-1 text-sm font-extrabold">
                        {formatMoneyBDT(Number(order?.subTotal) || 0)}
                    </div>
                </div>
                <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-xs font-semibold text-(--text-muted)">Shipping fee</div>
                    <div className="mt-1 text-sm font-extrabold">
                        {formatMoneyBDT(Number(order?.shippingFee) || 0)}
                    </div>
                </div>
                <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface-2) p-4">
                    <div className="text-xs font-semibold text-(--text-muted)">Total</div>
                    <div className="mt-1 text-sm font-extrabold">
                        {formatMoneyBDT(Number(order?.totalAmount) || 0)}
                    </div>
                </div>
            </div>
        </div>
    )
}
