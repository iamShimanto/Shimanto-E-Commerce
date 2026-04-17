import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { RefreshCcw } from "lucide-react"
import { useGetDashboardStatsQuery } from "../api/stats/statsApi"
import Button from "../components/ui/Button"
import { Link } from "react-router"
import { formatMoneyBDT } from "../features/products/productUtils"
import { StatusPill } from "../components/dashboard/StatusPill"
import { StatCard } from "../components/dashboard/StatCard"
import { Panel } from "../components/dashboard/Panel"
import { ListRow } from "../components/dashboard/ListRow"
import { formatDateTime } from "../lib/formatDateTime"

function formatCount(value) {
    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) return "0"
    return numberValue.toLocaleString("en-US")
}

function toList(value) {
    return Array.isArray(value) ? value : []
}


export default function DashboardHome() {
    // api
    const { data, isLoading, isFetching, isError, error, refetch } = useGetDashboardStatsQuery()
    // summaries
    const summary = data?.summary ?? {}
    const revenueSummary = summary.revenue ?? {}
    const orderSummary = summary.orders ?? {}
    const productSummary = summary.products ?? {}
    const categorySummary = summary.categories ?? {}
    const userSummary = summary.users ?? {}
    const subscriptionSummary = summary.subscriptions ?? {}
    const cartSummary = summary.carts ?? {}
    // lists
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
