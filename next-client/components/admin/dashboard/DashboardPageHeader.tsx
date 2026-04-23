import { ClipboardList, RefreshCcw } from "lucide-react";

import Button from "@/components/ui/Button";

import { formatDateTime } from "./dashboard-utils";

type DashboardPageHeaderProps = {
  generatedAt?: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onViewOrders: () => void;
};

export default function DashboardPageHeader({
  generatedAt,
  isRefreshing,
  onRefresh,
  onViewOrders,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-lg font-extrabold tracking-tight text-(--text)">
          Overview
        </div>
        <div className="mt-1 text-sm font-semibold text-(--text-muted)">
          Full website summary across products, orders, users, subscriptions and
          revenue.
        </div>
        <div className="mt-1 text-xs font-semibold text-(--text-muted)">
          Updated {generatedAt ? formatDateTime(generatedAt) : "—"}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          startIcon={
            <RefreshCcw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
          }
        >
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewOrders}
          startIcon={<ClipboardList size={16} />}
        >
          View Orders
        </Button>
      </div>
    </div>
  );
}
