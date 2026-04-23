import {
  Boxes,
  ClipboardList,
  PackageCheck,
  ShieldAlert,
  Tag,
} from "lucide-react";

import { InfoCard, Panel, QuickActionCard } from "./DashboardPrimitives";

export default function StaffDashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-extrabold tracking-tight text-(--text)">
          Staff Dashboard
        </div>
        <div className="mt-1 text-sm font-semibold text-(--text-muted)">
          Limited workspace for order and product operations.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          title="Pending Orders"
          value="24"
          Icon={ClipboardList}
          tone="amber"
        />
        <InfoCard title="Products" value="312" Icon={Boxes} tone="blue" />
        <InfoCard
          title="Ready to Ship"
          value="18"
          Icon={PackageCheck}
          tone="green"
        />
        <InfoCard
          title="Restricted Modules"
          value="3"
          Icon={ShieldAlert}
          tone="amber"
        />
      </div>

      <Panel title="Quick actions" subtitle="Common staff tasks">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            href="/admin/orders"
            label="Manage Orders"
            Icon={ClipboardList}
          />
          <QuickActionCard
            href="/admin/products"
            label="Manage Products"
            Icon={Boxes}
          />
          <QuickActionCard
            href="/admin/categories"
            label="View Categories"
            Icon={Tag}
          />
        </div>
      </Panel>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
        Your role has restrictions. Customer management, settings and cart
        modules are admin-only.
      </div>
    </div>
  );
}
