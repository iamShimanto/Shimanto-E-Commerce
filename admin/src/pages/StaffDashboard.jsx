import { Boxes, ClipboardList, PackageCheck, ShieldAlert } from "lucide-react"
import { Link } from "react-router"

function InfoCard({ title, value, Icon, tone = "blue" }) {
    const tones = {
        blue: "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
        green: "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
        amber: "border-amber-200/70 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
    }

    return (
        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-xs font-semibold text-(--text-muted)">{title}</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
                </div>
                <div className={`rounded-xl border p-2 ${tones[tone] || tones.blue}`}>
                    <Icon size={18} />
                </div>
            </div>
        </div>
    )
}

export default function staffDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <div className="text-lg font-extrabold tracking-tight">staff Dashboard</div>
                <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                    Limited workspace for order and product operations.
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard title="Pending Orders" value="24" Icon={ClipboardList} tone="amber" />
                <InfoCard title="Products" value="312" Icon={Boxes} tone="blue" />
                <InfoCard title="Ready to Ship" value="18" Icon={PackageCheck} tone="green" />
                <InfoCard title="Restricted Modules" value="3" Icon={ShieldAlert} tone="amber" />
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-sm">
                <div className="text-sm font-extrabold">Quick actions</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        to="/orders"
                        className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm font-extrabold transition hover:opacity-90"
                    >
                        Manage Orders
                    </Link>
                    <Link
                        to="/products"
                        className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm font-extrabold transition hover:opacity-90"
                    >
                        Manage Products
                    </Link>
                    <Link
                        to="/categories"
                        className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 text-sm font-extrabold transition hover:opacity-90"
                    >
                        View Categories
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                Your role has restrictions. Customer management, settings and cart modules are admin-only.
            </div>
        </div>
    )
}
