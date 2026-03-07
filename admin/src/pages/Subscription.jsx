import { useEffect, useMemo, useState } from "react"
import { Mail, Plus, RefreshCcw, Search, Trash2 } from "lucide-react"

import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { useToast } from "../hooks/useToast"
import {
    useCreateSubscriptionMutation,
    useDeleteSubscriptionMutation,
    useGetSubscriptionsQuery,
} from "../api/subscription/subscriptionApi"

const toErrorMessage = (error, fallback = "Request failed") =>
    error?.data?.message ||
    error?.data?.error ||
    (typeof error?.data === "string" ? error.data : null) ||
    (typeof error?.error === "string" ? error.error : null) ||
    fallback

const formatDate = (value) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString()
}

export default function Subscription() {
    const toast = useToast()

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [email, setEmail] = useState("")
    const [page, setPage] = useState(1)
    const [deleteEmail, setDeleteEmail] = useState(null)
    const pageSize = 20

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
    } = useGetSubscriptionsQuery({
        page,
        limit: pageSize,
        search: debouncedSearch,
    })

    const [createSubscription, { isLoading: isCreating }] =
        useCreateSubscriptionMutation()
    const [deleteSubscription, { isLoading: isDeleting }] =
        useDeleteSubscriptionMutation()

    const items = useMemo(() => (Array.isArray(data?.items) ? data.items : []), [data])
    const pagination = data?.pagination
    const totalPages = Math.max(1, Number(pagination?.totalPages) || 1)

    const onCreate = async () => {
        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail) {
            toast.error("Email required", "Please enter an email")
            return
        }

        try {
            await createSubscription(cleanEmail).unwrap()
            toast.success("Subscribed", cleanEmail)
            setEmail("")
            setPage(1)
        } catch (err) {
            toast.error("Create failed", toErrorMessage(err, "Failed to subscribe"))
        }
    }

    const onDelete = (targetEmail) => {
        if (!targetEmail) return

        setDeleteEmail(targetEmail)
    }

    const onConfirmDelete = async () => {
        if (!deleteEmail) return

        try {
            await deleteSubscription(deleteEmail).unwrap()
            toast.success("Deleted", deleteEmail)
            setDeleteEmail(null)
        } catch (err) {
            toast.error("Delete failed", toErrorMessage(err, "Failed to delete subscription"))
        }
    }

    const errorText = toErrorMessage(error, "Failed to load subscriptions")

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Subscription</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        Manage newsletter subscriber emails.
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

            <div className="grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2 shadow-sm">
                        <Search size={16} className="text-(--text-muted)" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by email..."
                            className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                        />
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="flex gap-2 rounded-2xl border border-(--border) bg-(--surface) p-2 shadow-sm">
                        <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                            <Mail size={16} className="text-(--text-muted)" />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="new subscriber email"
                                className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                            />
                        </div>

                        <Button type="button" size="sm" onClick={onCreate} disabled={isCreating}>
                            <Plus size={14} />
                            {isCreating ? "Adding..." : "Add"}
                        </Button>
                    </div>
                </div>
            </div>

            {isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    {errorText}
                </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="text-sm font-extrabold">Subscribers</div>
                    <div className="text-xs font-semibold text-(--text-muted)">
                        {isLoading ? "Loading…" : `${pagination?.total ?? items.length} total`}
                    </div>
                </div>

                {isLoading ? (
                    <div className="px-5 py-10 text-center text-sm font-semibold text-(--text-muted)">
                        Loading subscriptions...
                    </div>
                ) : !items.length ? (
                    <div className="px-5 py-10 text-center text-sm font-semibold text-(--text-muted)">
                        No subscriptions found.
                    </div>
                ) : (
                    <div className="divide-y divide-(--border)">
                        {items.map((item) => (
                            <div
                                key={item?._id || item?.email}
                                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-extrabold">{item?.email || "—"}</div>
                                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                                        Added: {formatDate(item?.createdAt)}
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    variant="danger"
                                    onClick={() => onDelete(item?.email)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 size={14} /> Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 shadow-sm">
                <div className="text-xs font-semibold text-(--text-muted)">
                    Page {page} of {totalPages}
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || isFetching}
                    >
                        Prev
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || isFetching}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(deleteEmail)}
                title="Delete subscription"
                message={`Are you sure you want to delete subscription (${deleteEmail || ""})?`}
                confirmText="Delete"
                cancelText="Cancel"
                onCancel={() => setDeleteEmail(null)}
                onConfirm={onConfirmDelete}
                loading={isDeleting}
            />
        </div>
    )
}
