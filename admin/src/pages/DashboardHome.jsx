import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { RefreshCcw } from "lucide-react"

import { useGetDashboardStatsQuery } from "../api/stats/statsApi"
import Button from "../components/ui/Button"
import { Link } from "react-router"
import { cn } from "../lib/cn"
import { formatMoneyBDT } from "../features/products/productUtils"

function formatCount(value) {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return "0"
    return numberValue.toLocaleString("en-US")
}

function formatDateTime(value) {
    const date = value ? new Date(value) : null
    if (!date || Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function toList(value) {
    return Array.isArray(value) ? value : []
}

function statusTone(value) {
    const normalized = String(value || "").toLowerCase()
    if (normalized === "paid" || normalized === "delivered" || normalized === "active") return "ok"
    if (normalized === "pending" || normalized === "processing" || normalized === "confirmed") return "warn"
    if (normalized === "failed" || normalized === "cancelled" || normalized === "refunded") return "bad"
    return "neutral"
}

function StatusPill({ value }) {
    const tone = statusTone(value)
    const styles = {
        neutral: "bg-(--surface-2) text-(--text-muted) ring-(--border)",
        ok: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
        warn: "bg-amber-50 text-amber-700 ring-amber-200/70",
        bad: "bg-rose-50 text-rose-700 ring-rose-200/70",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ring-inset",
                styles[tone] || styles.neutral,
            )}
        >
            {value || "—"}
        </span>
    )
}

function StatCard({ label, value, hint, accent = "neutral" }) {
    const accents = {
        neutral: "from-slate-500/10 via-transparent to-transparent",
        success: "from-emerald-500/15 via-transparent to-transparent",
        warning: "from-amber-500/15 via-transparent to-transparent",
        danger: "from-rose-500/15 via-transparent to-transparent",
        info: "from-sky-500/15 via-transparent to-transparent",
    }

    return (
        <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
            <div className={cn("pointer-events-none absolute inset-0 bg-linear-to-br", accents[accent] || accents.neutral)} />
            <div className="relative">
                <div className="text-xs font-semibold text-(--text-muted)">{label}</div>
                <div className="mt-1 flex items-end justify-between gap-2">
                    <div className="text-2xl font-extrabold tracking-tight">{value}</div>
                </div>
                {hint ? (
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">{hint}</div>
                ) : null}
            </div>
        </div>
    )
}

function Panel({ title, subtitle, children, action }) {
    return (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-extrabold">{title}</div>
                    {subtitle ? (
                        <div className="mt-1 text-xs font-semibold text-(--text-muted)">{subtitle}</div>
                    ) : null}
                </div>
                {action ? <div>{action}</div> : null}
            </div>
            <div className="mt-4">{children}</div>
        </div>
    )
}

function ListRow({ title, subtitle, meta, right, accent = "neutral" }) {
    const accentStyles = {
        neutral: "bg-(--surface-2) text-(--text-muted)",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
        info: "bg-sky-50 text-sky-700",
    }

    return (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-3">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-extrabold">{title}</div>
                    {meta ? (
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                                accentStyles[accent] || accentStyles.neutral,
                            )}
                        >
                            {meta}
                        </span>
                    ) : null}
                </div>
                {subtitle ? (
                    <div className="mt-1 truncate text-xs font-semibold text-(--text-muted)">{subtitle}</div>
                ) : null}
            </div>
            {right ? <div className="shrink-0 text-right text-xs font-extrabold">{right}</div> : null}
        </div>
    )
}

export default function DashboardHome() {
    const { data, isLoading, isFetching, isError, error, refetch } = useGetDashboardStatsQuery()

    const summary = data?.summary ?? {}
    const revenueSummary = summary.revenue ?? {}
    const orderSummary = summary.orders ?? {}
    const productSummary = summary.products ?? {}
    const categorySummary = summary.categories ?? {}
    const userSummary = summary.users ?? {}
    const subscriptionSummary = summary.subscriptions ?? {}
    const cartSummary = summary.carts ?? {}

    const monthlySales = toList(data?.charts?.monthlySales)
    const topProducts = toList(data?.topProducts)
    const topCategories = toList(data?.topCategories)
    const recentOrders = toList(data?.recentOrders)
    const recentUsers = toList(data?.recentUsers)
    const lowStockProducts = toList(data?.lowStockProducts)

    const statCards = [
        {
            label: "Revenue",
            value: formatMoneyBDT(revenueSummary.paidRevenue),
            hint: `${formatCount(revenueSummary.paidOrders)} paid orders`,
            accent: "success",
        },
        {
            label: "Orders",
            value: formatCount(orderSummary.total),
            hint: `${formatCount(orderSummary.statuses?.pending)} pending`,
            accent: "info",
        },
        {
            label: "Customers",
            value: formatCount(userSummary.roles?.user ?? userSummary.total),
            hint: `${formatCount(userSummary.verified)} verified accounts`,
            accent: "neutral",
        },
        {
            label: "Products",
            value: formatCount(productSummary.total),
            hint: `${formatCount(productSummary.featured)} featured items`,
            accent: "warning",
        },
        {
            label: "Categories",
            value: formatCount(categorySummary.total),
            hint: `${formatCount(categorySummary.active)} active categories`,
            accent: "info",
        },
        {
            label: "Subscriptions",
            value: formatCount(subscriptionSummary.total),
            hint: "Newsletter signups",
            accent: "success",
        },
        {
            label: "Carts",
            value: formatCount(cartSummary.total),
            hint: `${formatCount(cartSummary.items)} items in carts`,
            accent: "neutral",
        },
        {
            label: "Low Stock",
            value: formatCount(productSummary.lowStock ?? lowStockProducts.length),
            hint: "Products at risk",
            accent: "danger",
        },
    ]

    const errorText =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error?.data === "string" ? error.data : null) ||
        (typeof error?.error === "string" ? error.error : null) ||
        "Failed to load dashboard stats"

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Overview</div>
                    <div className="text-sm font-semibold text-(--text-muted)">
                        Full website summary across products, orders, users, subscriptions and revenue.
                    </div>
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                        Updated {data?.generatedAt ? formatDateTime(data.generatedAt) : "—"}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => refetch()} disabled={isFetching || isLoading}>
                        <RefreshCcw size={16} className={isFetching || isLoading ? "animate-spin" : ""} />
                        {isFetching || isLoading ? "Refreshing…" : "Refresh"}
                    </Button>
                    <Button variant="secondary" size="sm">
                        <Link to="/orders">View Orders</Link>
                    </Button>
                </div>
            </div>

            {isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    {errorText}
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        hint={card.hint}
                        accent={card.accent}
                    />
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-extrabold">Sales</div>
                            <div className="text-xs font-semibold text-(--text-muted)">
                                Monthly paid revenue over the last 12 months
                            </div>
                        </div>
                        <div className="text-xs font-extrabold text-(--text-muted)">
                            {formatCount(monthlySales.length)} months
                        </div>
                    </div>

                    <div className="mt-4 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlySales} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.34} />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                                <XAxis dataKey="period" tickLine={false} axisLine={false} minTickGap={18} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={42}
                                    tickFormatter={(value) => formatMoneyBDT(value).replace("৳ ", "")}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === "revenue" ? formatMoneyBDT(value) : formatCount(value),
                                        name === "revenue" ? "Revenue" : "Orders",
                                    ]}
                                    contentStyle={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 14,
                                        color: "var(--text)",
                                        fontWeight: 700,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    fill="url(#salesFill)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <Panel
                    title="Top Products"
                    subtitle="Best sellers by paid quantity"
                    action={<span className="text-xs font-extrabold text-(--text-muted)">{formatCount(topProducts.length)} items</span>}
                >
                    <div className="space-y-3">
                        {topProducts.length ? (
                            topProducts.map((item, index) => (
                                <ListRow
                                    key={item.productId || `${item.title}-${index}`}
                                    title={item.title || "Unnamed product"}
                                    subtitle={item.categoryName || item.slug || "No category"}
                                    meta={`#${index + 1}`}
                                    right={
                                        <div>
                                            <div>{formatCount(item.soldQuantity)} sold</div>
                                            <div className="mt-1 text-(--text-muted)">{formatMoneyBDT(item.revenue)}</div>
                                        </div>
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-(--border) px-3 py-6 text-center text-sm font-semibold text-(--text-muted)">
                                No sales data yet.
                            </div>
                        )}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel
                    title="Recent Orders"
                    subtitle="Latest customer activity"
                    action={<span className="text-xs font-extrabold text-(--text-muted)">{formatCount(recentOrders.length)} orders</span>}
                >
                    <div className="space-y-3">
                        {recentOrders.length ? (
                            recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-extrabold">{order.customer?.name || "Unnamed customer"}</div>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-(--text-muted)">
                                            <span>{order.transactionId || order.id}</span>
                                            <span>•</span>
                                            <span>{formatDateTime(order.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusPill value={order.orderStatus} />
                                        <StatusPill value={order.paymentStatus} />
                                        <div className="text-sm font-extrabold">{formatMoneyBDT(order.totalAmount)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-(--border) px-3 py-6 text-center text-sm font-semibold text-(--text-muted)">
                                No recent orders found.
                            </div>
                        )}
                    </div>
                </Panel>

                <Panel
                    title="Recent Users"
                    subtitle="New signups and verified accounts"
                    action={<span className="text-xs font-extrabold text-(--text-muted)">{formatCount(recentUsers.length)} users</span>}
                >
                    <div className="space-y-3">
                        {recentUsers.length ? (
                            recentUsers.map((user) => (
                                <ListRow
                                    key={user._id}
                                    title={user.fullName || user.email}
                                    subtitle={user.email}
                                    meta={user.role}
                                    accent={user.isVerified ? "success" : "warning"}
                                    right={
                                        <div>
                                            <div>{user.isVerified ? "Verified" : "Unverified"}</div>
                                            <div className="mt-1 text-(--text-muted)">{formatDateTime(user.createdAt)}</div>
                                        </div>
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-(--border) px-3 py-6 text-center text-sm font-semibold text-(--text-muted)">
                                No recent users found.
                            </div>
                        )}
                    </div>
                </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel
                    title="Top Categories"
                    subtitle="Sales concentration by category"
                    action={<span className="text-xs font-extrabold text-(--text-muted)">{formatCount(topCategories.length)} categories</span>}
                >
                    <div className="space-y-3">
                        {topCategories.length ? (
                            topCategories.map((category, index) => (
                                <ListRow
                                    key={category.categoryId || `${category.name}-${index}`}
                                    title={category.name || "Unnamed category"}
                                    subtitle={category.slug || "No slug"}
                                    meta={`#${index + 1}`}
                                    right={
                                        <div>
                                            <div>{formatCount(category.soldQuantity)} sold</div>
                                            <div className="mt-1 text-(--text-muted)">{formatMoneyBDT(category.revenue)}</div>
                                        </div>
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-(--border) px-3 py-6 text-center text-sm font-semibold text-(--text-muted)">
                                No category sales data yet.
                            </div>
                        )}
                    </div>
                </Panel>

                <Panel
                    title="Inventory Warnings"
                    subtitle="Products with low stock"
                    action={<span className="text-xs font-extrabold text-(--text-muted)">{formatCount(lowStockProducts.length)} alerts</span>}
                >
                    <div className="space-y-3">
                        {lowStockProducts.length ? (
                            lowStockProducts.map((product) => (
                                <ListRow
                                    key={product._id}
                                    title={product.title}
                                    subtitle={product.slug}
                                    meta={product.isActive ? "Active" : "Inactive"}
                                    accent={product.totalStock <= 3 ? "danger" : "warning"}
                                    right={
                                        <div>
                                            <div>{formatCount(product.totalStock)} left</div>
                                            <div className="mt-1 text-(--text-muted)">{product.isFeatured ? "Featured" : "Standard"}</div>
                                        </div>
                                    }
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-(--border) px-3 py-6 text-center text-sm font-semibold text-(--text-muted)">
                                No low-stock products right now.
                            </div>
                        )}
                    </div>
                </Panel>
            </div>
        </div>
    )
}
