import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  DashboardLowStockProduct,
  DashboardRecentOrder,
  DashboardRecentUser,
  DashboardStatsData,
  DashboardTopCategory,
} from "@/services/stats.service";

import {
  EmptyState,
  ListRow,
  Panel,
  StatCard,
  StatusPill,
} from "./DashboardPrimitives";
import {
  formatCount,
  formatDateTime,
  formatMoneyBDT,
  toList,
} from "./dashboard-utils";

function SalesChartCard({ monthlySales }: { monthlySales: unknown[] }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-(--text)">Sales</div>
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
          <AreaChart
            data={monthlySales}
            margin={{ top: 6, right: 12, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.34}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.25)"
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              minTickGap={18}
            />
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
  );
}

function StatCardsGrid({
  summary,
  lowStockCount,
}: {
  summary: DashboardStatsData["summary"];
  lowStockCount: number;
}) {
  const statCards = [
    {
      label: "Revenue",
      value: formatMoneyBDT(summary.revenue.paidRevenue),
      hint: `${formatCount(summary.revenue.paidOrders)} paid orders`,
      accent: "success" as const,
    },
    {
      label: "Orders",
      value: formatCount(summary.orders.total),
      hint: `${formatCount(summary.orders.statuses.pending)} pending`,
      accent: "info" as const,
    },
    {
      label: "Subscriptions",
      value: formatCount(summary.subscriptions.total),
      hint: "Newsletter signups",
      accent: "success" as const,
    },
    {
      label: "Carts",
      value: formatCount(summary.carts.total),
      hint: `${formatCount(summary.carts.items)} items in carts`,
      accent: "neutral" as const,
    },
    {
      label: "Low Stock",
      value: formatCount(summary.products.lowStock ?? lowStockCount),
      hint: "Products at risk",
      accent: "danger" as const,
    },
  ];

  return (
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
  );
}

function TwoColumnPanels({
  topProducts,
  recentOrders,
  recentUsers,
  topCategories,
  lowStockProducts,
}: {
  topProducts: DashboardStatsData["topProducts"];
  recentOrders: DashboardRecentOrder[];
  recentUsers: DashboardRecentUser[];
  topCategories: DashboardTopCategory[];
  lowStockProducts: DashboardLowStockProduct[];
}) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Top Products"
          subtitle="Best sellers by paid quantity"
          action={
            <span className="text-xs font-extrabold text-(--text-muted)">
              {formatCount(topProducts.length)} items
            </span>
          }
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
                      <div className="mt-1 text-(--text-muted)">
                        {formatMoneyBDT(item.revenue)}
                      </div>
                    </div>
                  }
                />
              ))
            ) : (
              <EmptyState>No sales data yet.</EmptyState>
            )}
          </div>
        </Panel>

        <Panel
          title="Recent Orders"
          subtitle="Latest customer activity"
          action={
            <span className="text-xs font-extrabold text-(--text-muted)">
              {formatCount(recentOrders.length)} orders
            </span>
          }
        >
          <div className="space-y-3">
            {recentOrders.length ? (
              recentOrders.map((order: DashboardRecentOrder) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--surface-2) px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-(--text)">
                      {order.customer?.name || "Unnamed customer"}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-(--text-muted)">
                      <span>{order.transactionId || order.id}</span>
                      <span>•</span>
                      <span>{formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill value={order.orderStatus} />
                    <StatusPill value={order.paymentStatus} />
                    <div className="text-sm font-extrabold text-(--text)">
                      {formatMoneyBDT(order.totalAmount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState>No recent orders found.</EmptyState>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recent Users"
          subtitle="New signups and verified accounts"
          action={
            <span className="text-xs font-extrabold text-(--text-muted)">
              {formatCount(recentUsers.length)} users
            </span>
          }
        >
          <div className="space-y-3">
            {recentUsers.length ? (
              recentUsers.map((user: DashboardRecentUser) => (
                <ListRow
                  key={user._id}
                  title={user.fullName || user.email || "Unknown user"}
                  subtitle={user.email}
                  meta={user.role || "user"}
                  accent={user.isVerified ? "success" : "warning"}
                  right={
                    <div>
                      <div>{user.isVerified ? "Verified" : "Unverified"}</div>
                      <div className="mt-1 text-(--text-muted)">
                        {formatDateTime(user.createdAt)}
                      </div>
                    </div>
                  }
                />
              ))
            ) : (
              <EmptyState>No recent users found.</EmptyState>
            )}
          </div>
        </Panel>

        <Panel
          title="Top Categories"
          subtitle="Sales concentration by category"
          action={
            <span className="text-xs font-extrabold text-(--text-muted)">
              {formatCount(topCategories.length)} categories
            </span>
          }
        >
          <div className="space-y-3">
            {topCategories.length ? (
              topCategories.map((category: DashboardTopCategory, index) => (
                <ListRow
                  key={category.categoryId || `${category.name}-${index}`}
                  title={category.name || "Unnamed category"}
                  subtitle={category.slug || "No slug"}
                  meta={`#${index + 1}`}
                  right={
                    <div>
                      <div>{formatCount(category.soldQuantity)} sold</div>
                      <div className="mt-1 text-(--text-muted)">
                        {formatMoneyBDT(category.revenue)}
                      </div>
                    </div>
                  }
                />
              ))
            ) : (
              <EmptyState>No category sales data yet.</EmptyState>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Inventory Warnings"
          subtitle="Products with low stock"
          action={
            <span className="text-xs font-extrabold text-(--text-muted)">
              {formatCount(lowStockProducts.length)} alerts
            </span>
          }
        >
          <div className="space-y-3">
            {lowStockProducts.length ? (
              lowStockProducts.map((product: DashboardLowStockProduct) => (
                <ListRow
                  key={product._id}
                  title={product.title}
                  subtitle={product.slug}
                  meta={product.isActive ? "Active" : "Inactive"}
                  accent={product.totalStock <= 3 ? "danger" : "warning"}
                  right={
                    <div>
                      <div>{formatCount(product.totalStock)} left</div>
                      <div className="mt-1 text-(--text-muted)">
                        {product.isFeatured ? "Featured" : "Standard"}
                      </div>
                    </div>
                  }
                />
              ))
            ) : (
              <EmptyState>No low-stock products right now.</EmptyState>
            )}
          </div>
        </Panel>

        <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
          <div className="text-sm font-extrabold tracking-tight text-(--text)">
            Monthly Summary
          </div>
          <div className="mt-1 text-xs font-semibold text-(--text-muted)">
            Sales and operational mix at a glance.
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ListRow
              title="Recent Orders"
              subtitle="Last 10"
              meta={formatCount(recentOrders.length)}
            />
            <ListRow
              title="Recent Users"
              subtitle="Last 10"
              meta={formatCount(recentUsers.length)}
            />
            <ListRow
              title="Top Categories"
              subtitle="By revenue"
              meta={formatCount(topCategories.length)}
            />
            <ListRow
              title="Low Stock"
              subtitle="Alerts"
              meta={formatCount(lowStockProducts.length)}
              accent="danger"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardView({
  data,
}: {
  data: DashboardStatsData;
}) {
  const summary = data.summary;
  const monthlySales = toList(data.charts?.monthlySales);
  const topProducts = toList(data.topProducts);
  const topCategories = toList(data.topCategories);
  const recentOrders = toList(data.recentOrders);
  const recentUsers = toList(data.recentUsers);
  const lowStockProducts = toList(data.lowStockProducts);

  return (
    <div className="space-y-6">
      <StatCardsGrid
        summary={summary}
        lowStockCount={lowStockProducts.length}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SalesChartCard monthlySales={monthlySales} />
        <Panel
          title="Top Products"
          subtitle="Best sellers by paid quantity"
          action={
            <span className="text-xs font-extrabold text-(--text-muted)">
              {formatCount(topProducts.length)} items
            </span>
          }
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
                      <div className="mt-1 text-(--text-muted)">
                        {formatMoneyBDT(item.revenue)}
                      </div>
                    </div>
                  }
                />
              ))
            ) : (
              <EmptyState>No sales data yet.</EmptyState>
            )}
          </div>
        </Panel>
      </div>

      <TwoColumnPanels
        topProducts={topProducts}
        recentOrders={recentOrders}
        recentUsers={recentUsers}
        topCategories={topCategories}
        lowStockProducts={lowStockProducts}
      />
    </div>
  );
}
