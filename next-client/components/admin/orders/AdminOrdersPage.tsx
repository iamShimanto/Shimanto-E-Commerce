"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiSearch,
  FiRefreshCcw,
} from "react-icons/fi";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import {
  EmptyState,
  Panel,
  StatusPill,
} from "@/components/admin/dashboard/DashboardPrimitives";
import {
  formatDateTime,
  formatMoneyBDT,
  toList,
} from "@/components/admin/dashboard/dashboard-utils";
import useDebounce from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { ORDER_STATUS_OPTIONS } from "@/lib/constants/order-status";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  type AdminOrder,
} from "@/services/order.service";
import { cn } from "@/lib/utils/cn";
import { getOrderCustomer, getOrderErrorMessage } from "./order-utils";

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, string>
  >({});

  const debouncedSearch = useDebounce(search.trim(), 300);
  const searchTerm = debouncedSearch.length ? debouncedSearch : undefined;

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAdminOrdersQuery({
      page,
      limit: PAGE_SIZE,
      search: searchTerm,
    });

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();

  const orders = useMemo(
    () => toList(data?.data?.orders),
    [data?.data?.orders],
  );
  const pagination = data?.data?.pagination;
  const totalPages = Math.max(1, Number(pagination?.totalPages) || 1);

  const handleStatusChange = async (order: AdminOrder, nextStatus: string) => {
    const id = String(order?._id ?? order?.id ?? "").trim();
    const currentStatus = String(order?.orderStatus ?? "pending");
    const normalized = String(nextStatus ?? "").trim();

    if (!id || !normalized || normalized === currentStatus) return;

    setOptimisticStatuses((current) => ({
      ...current,
      [id]: normalized,
    }));

    try {
      await updateOrderStatus({ id, status: normalized }).unwrap();
      toast.success("Order updated", "Order status updated successfully");
    } catch (updateError) {
      setOptimisticStatuses((current) => {
        const copy = { ...current };
        delete copy[id];
        return copy;
      });
      toast.error(
        "Update failed",
        getOrderErrorMessage(updateError, "Failed to update order status"),
      );
    }
  };

  const errorText = getOrderErrorMessage(error, "Failed to load orders");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-(--text)">
            Orders
          </div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted)">
            Review orders, change fulfillment status, and jump into details.
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => refetch()}
          disabled={isFetching}
          startIcon={<FiRefreshCcw size={16} />}
        >
          {isFetching ? "Refreshing" : "Refresh"}
        </Button>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          {errorText}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 shadow-sm">
            <FiSearch className="text-(--text-muted)" size={16} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search transaction id, customer name, email, or address"
              className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-(--text-muted)">
                Total orders
              </div>
              <div className="mt-1 text-xs font-bold text-(--text)">
                {isLoading
                  ? "Loading…"
                  : formatCount(pagination?.total ?? orders.length)}
              </div>
            </div>
            <div className="text-xs font-extrabold text-(--text-muted)">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      <Panel
        title="Order list"
        subtitle={
          isLoading
            ? "Loading orders…"
            : `${orders.length} item(s) on this page`
        }
        action={
          <div className="rounded-full bg-(--surface-2) px-3 py-1.5 text-xs font-extrabold text-(--text-muted)">
            {isFetching ? "Syncing" : "Ready"}
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-(--border)">
          <div className="overflow-x-auto">
            <table className="min-w-275 w-full border-separate border-spacing-0">
              <thead className="bg-(--surface-2)">
                <tr>
                  {[
                    "Transaction",
                    "Customer",
                    "Payment",
                    "Order status",
                    "Total",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-(--text-muted)",
                        heading === "Total" && "text-right",
                        heading === "Actions" && "text-right",
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="text-sm font-semibold text-(--text-muted)">
                        Loading orders…
                      </div>
                    </td>
                  </tr>
                ) : orders.length ? (
                  orders.map((order) => {
                    const id = String(order?._id ?? order?.id ?? "").trim();
                    const transactionId = String(order?.transactionId ?? "—");
                    const currentStatus = String(
                      order?.orderStatus ?? "pending",
                    );
                    const statusValue = optimisticStatuses[id] ?? currentStatus;
                    const { name, email } = getOrderCustomer(order);
                    const totalAmount = Number(order?.totalAmount) || 0;
                    const paymentStatus = String(order?.paymentStatus ?? "—");
                    const paymentMethod = String(order?.paymentMethod ?? "—");

                    return (
                      <tr
                        key={id || transactionId}
                        className="border-t border-(--border)"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-extrabold text-(--text)">
                              {transactionId}
                            </div>
                            <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                              Order ID: {id || "—"}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-extrabold text-(--text)">
                              {name}
                            </div>
                            <div className="mt-1 truncate text-xs font-semibold text-(--text-muted)">
                              {email}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="space-y-2">
                            <div className="text-sm font-extrabold uppercase tracking-[0.14em] text-(--text)">
                              {paymentMethod}
                            </div>
                            <StatusPill value={paymentStatus} />
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <Select
                              value={statusValue}
                              onValueChange={(nextStatus) => {
                                void handleStatusChange(order, nextStatus);
                              }}
                              disabled={isUpdatingStatus}
                              size="sm"
                              variant="filled"
                              className="min-w-40"
                              options={ORDER_STATUS_OPTIONS}
                            />
                            <StatusPill value={statusValue} />
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top text-right text-sm font-extrabold text-(--text)">
                          {formatMoneyBDT(totalAmount)}
                        </td>

                        <td className="px-4 py-4 align-top text-sm font-semibold text-(--text-muted)">
                          {formatDateTime(order?.createdAt)}
                        </td>

                        <td className="px-4 py-4 align-top text-right">
                          <Link
                            href={`/admin/orders/${id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface-2) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
                          >
                            Details <FiExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8">
                      <EmptyState>
                        No orders found. Try a different search term.
                      </EmptyState>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-(--border) pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-semibold text-(--text-muted)">
            {pagination?.total
              ? `${pagination.total} total order(s)`
              : "No total count available"}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isFetching}
              startIcon={<FiChevronLeft size={16} />}
            >
              Prev
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages || isFetching}
              endIcon={<FiChevronRight size={16} />}
            >
              Next
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function formatCount(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "0";
  return numberValue.toLocaleString("en-US");
}
