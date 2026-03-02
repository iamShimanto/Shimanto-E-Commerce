import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import Button from "../components/ui/Button"
import { Link } from "react-router"

const data = [
    { name: "Mon", sales: 1200 },
    { name: "Tue", sales: 2100 },
    { name: "Wed", sales: 800 },
    { name: "Thu", sales: 1600 },
    { name: "Fri", sales: 2400 },
    { name: "Sat", sales: 1800 },
    { name: "Sun", sales: 2600 },
]

function StatCard({ label, value, delta }) {
    const deltaColor =
        delta?.startsWith("+") ? "text-emerald-600" : "text-rose-600"

    return (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
            <div className="text-xs font-semibold text-(--text-muted)">
                {label}
            </div>
            <div className="mt-1 flex items-end justify-between gap-2">
                <div className="text-2xl font-extrabold tracking-tight">{value}</div>
                {delta ? (
                    <div className={`text-xs font-extrabold ${deltaColor}`}>{delta}</div>
                ) : null}
            </div>
        </div>
    )
}

export default function DashboardHome() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Overview</div>
                    <div className="text-sm font-semibold text-(--text-muted)">
                        Today’s performance and recent activity
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button size="sm">
                        <Link to={"/products"}>Create Product</Link>
                    </Button>
                    <Button variant="secondary" size="sm">
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Revenue" value="৳ 84,320" delta="+12.4%" />
                <StatCard label="Orders" value="1,248" delta="+4.8%" />
                <StatCard label="Customers" value="9,512" delta="+2.1%" />
                <StatCard label="Refunds" value="18" delta="-0.7%" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-extrabold">Sales</div>
                            <div className="text-xs font-semibold text-(--text-muted)">
                                Last 7 days
                            </div>
                        </div>
                        <div className="text-xs font-extrabold text-(--text-muted)">
                            Updated just now
                        </div>
                    </div>

                    <div className="mt-4 h-65">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} width={28} />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--surface)",
                                        border: `1px solid var(--border)`,
                                        borderRadius: 14,
                                        color: "var(--text)",
                                        fontWeight: 700,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    fill="url(#salesFill)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                    <div className="text-sm font-extrabold">Recent Orders</div>
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                        Latest 5 orders
                    </div>

                    <div className="mt-4 space-y-3">
                        {[
                            { id: "#10021", name: "Ayesha", amount: "৳ 1,220" },
                            { id: "#10020", name: "Rahim", amount: "৳ 860" },
                            { id: "#10019", name: "Nabila", amount: "৳ 2,410" },
                            { id: "#10018", name: "Sakib", amount: "৳ 540" },
                            { id: "#10017", name: "Tania", amount: "৳ 3,090" },
                        ].map((o) => (
                            <div
                                key={o.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-xs font-extrabold">{o.id}</div>
                                    <div className="truncate text-xs font-semibold text-(--text-muted)">
                                        {o.name}
                                    </div>
                                </div>
                                <div className="text-xs font-extrabold">{o.amount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
