import { useMemo, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Search,
    UserRound,
} from "lucide-react"

import { useGetUsersQuery, useProfileQuery, useUpdateRoleMutation } from "../api/auth/authApi"
import { useToast } from "../hooks/useToast"
import { cn } from "../lib/cn"

import Button from "../components/ui/Button"
import Select from "../components/ui/Select"

function formatDate(value) {
    const d = value ? new Date(value) : null
    if (!d || Number.isNaN(d.getTime())) return "—"
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
}

function initials(nameOrEmail) {
    const s = String(nameOrEmail || "").trim()
    if (!s) return "U"
    const parts = s.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return s.slice(0, 2).toUpperCase()
}

export default function Customers() {
    const toast = useToast()

    const [query, setQuery] = useState("")
    const [role, setRole] = useState("all")
    const [verified, setVerified] = useState("all")
    const [hasAvatar, setHasAvatar] = useState("all")
    const [page, setPage] = useState(1)
    const pageSize = 10

    const { data: profile } = useProfileQuery()
    const isAdmin = String(profile?.role || "").toLowerCase() === "admin"

    const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation()
    const [draftRoles, setDraftRoles] = useState({})

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetUsersQuery({
        page,
        limit: pageSize,
        search: query.trim() ? query.trim() : undefined,
        role: role !== "all" ? role : undefined,
        isVerified: verified === "all" ? undefined : verified === "true",
        hasAvatar: hasAvatar === "all" ? undefined : hasAvatar === "true",
        sortBy: "createdAt",
        sortOrder: "desc",
    })

    const users = useMemo(() => data?.items ?? [], [data])
    const pagination = data?.pagination
    const totalPages = Math.max(1, Number(pagination?.totalPages) || 1)

    const errorText =
        error?.data?.message ||
        (typeof error?.error === "string" ? error.error : null) ||
        "Failed to load customers"

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Customers</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        User accounts, roles and verification status.
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
                            placeholder="Search name, email, phone…"
                            className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
                        />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Select
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="all">All roles</option>
                        <option value="user">User</option>
                        <option value="stuff">Stuff</option>
                        <option value="admin">Admin</option>
                    </Select>
                </div>

                <div className="lg:col-span-2">
                    <Select
                        value={verified}
                        onChange={(e) => {
                            setVerified(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="all">All</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                    </Select>
                </div>

                <div className="lg:col-span-2">
                    <Select
                        value={hasAvatar}
                        onChange={(e) => {
                            setHasAvatar(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="all">Avatar</option>
                        <option value="true">Has avatar</option>
                        <option value="false">No avatar</option>
                    </Select>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold">Customer list</div>
                        <div className="mt-0.5 text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${users.length} item(s)`}
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-(--surface-2) px-3 py-2 text-xs font-extrabold text-(--text-muted)">
                        <UserRound size={16} /> Page {page} / {totalPages}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-245 w-full">
                        <thead>
                            <tr className="bg-(--surface-2)">
                                <Th>Customer</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Role</Th>
                                <Th>Verified</Th>
                                <Th>Joined</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center">
                                        <div className="text-sm font-extrabold">Loading customers…</div>
                                    </td>
                                </tr>
                            ) : users.length ? (
                                users.map((u) => {
                                    const name = u?.fullName || ""
                                    const email = u?.email || "—"
                                    const avatar = u?.avatar || ""
                                    const phone = u?.phone ? String(u.phone) : "—"
                                    const roleText = u?.role || "user"
                                    const isVerified = Boolean(u?.isVerified)
                                    const id = u?._id ? String(u._id) : ""
                                    const draft = id && typeof draftRoles[id] === "string" ? draftRoles[id] : roleText
                                    const dirty = isAdmin && id && draft !== roleText

                                    return (
                                        <tr
                                            key={id || email}
                                            className="border-t border-(--border) transition-colors hover:bg-(--surface-2)"
                                        >
                                            <Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-(--border) bg-(--surface-2) ring-1 ring-black/5">
                                                        {avatar ? (
                                                            <img
                                                                src={avatar}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="text-xs font-extrabold text-(--text-muted)">
                                                                {initials(name || email)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-extrabold">
                                                            {name?.trim() ? name : "Unnamed"}
                                                        </div>
                                                        <div className="truncate text-xs font-semibold text-(--text-muted)">
                                                            ID: {u?._id ? String(u._id) : "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-(--text-muted)" />
                                                    <span className="text-sm font-extrabold">{email}</span>
                                                </div>
                                            </Td>

                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-(--text-muted)" />
                                                    <span className="text-sm font-extrabold">{phone}</span>
                                                </div>
                                            </Td>

                                            <Td>
                                                {isAdmin && id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={draft}
                                                            onChange={(e) => {
                                                                const next = e.target.value
                                                                setDraftRoles((p) => ({ ...p, [id]: next }))
                                                            }}
                                                            className="w-36 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2 text-xs font-extrabold text-(--text) shadow-sm shadow-black/5 outline-none focus:ring-[3px] focus:ring-(--focus-ring)"
                                                            disabled={isUpdatingRole}
                                                        >
                                                            <option value="user">user</option>
                                                            <option value="stuff">stuff</option>
                                                            <option value="admin">admin</option>
                                                        </select>

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={dirty ? "primary" : "secondary"}
                                                            disabled={!dirty || isUpdatingRole}
                                                            onClick={async () => {
                                                                try {
                                                                    await updateRole({ id, role: draft }).unwrap()
                                                                    toast.success("Updated", "User role updated")
                                                                } catch (err) {
                                                                    const msg =
                                                                        err?.data?.message ||
                                                                        (typeof err?.error === "string" ? err.error : null) ||
                                                                        "Update failed"
                                                                    toast.error("Error", msg)
                                                                }
                                                            }}
                                                        >
                                                            {isUpdatingRole ? "Saving…" : "Update"}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Pill variant={roleText === "admin" ? "purple" : roleText === "stuff" ? "blue" : "neutral"}>
                                                        {roleText}
                                                    </Pill>
                                                )}
                                            </Td>

                                            <Td>
                                                <Pill variant={isVerified ? "green" : "amber"}>
                                                    {isVerified ? "Verified" : "Pending"}
                                                </Pill>
                                            </Td>

                                            <Td>
                                                <div className="text-sm font-extrabold">
                                                    {formatDate(u?.createdAt)}
                                                </div>
                                            </Td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center">
                                        <div className="mx-auto max-w-md">
                                            <div className="text-sm font-extrabold">No customers found</div>
                                            <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                                                Try changing filters or search.
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
                <div className="text-xs font-semibold text-(--text-muted)">
                    Fetching customers…
                </div>
            ) : null}
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

function Pill({ children, variant = "neutral" }) {
    const styles = {
        neutral: "border-(--border) bg-(--surface-2) text-(--text)",
        green: "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
        amber: "border-amber-200/70 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
        blue: "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
        purple: "border-violet-200/70 bg-violet-50 text-violet-800 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold",
                styles[variant] || styles.neutral
            )}
        >
            {children}
        </span>
    )
}
