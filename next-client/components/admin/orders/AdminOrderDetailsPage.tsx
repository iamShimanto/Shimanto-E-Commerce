"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowLeft, FiRefreshCcw } from "react-icons/fi";

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
import { ORDER_STATUS_OPTIONS } from "@/lib/constants/order-status";
import {
  useGetAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "@/services/order.service";
import { getOrderCustomer, getOrderErrorMessage } from "./order-utils";

type AdminOrderDetailsPageProps = {
  orderId: string;
};

export default function AdminOrderDetailsPage({
  orderId,
}: AdminOrderDetailsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined,
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAdminOrderByIdQuery(orderId, {
      skip: !orderId,
    });

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();

  const order = data?.data ?? null;
  const currentStatus =
    selectedStatus ?? String(order?.orderStatus ?? "pending");

  const items = useMemo(() => toList(order?.items), [order?.items]);
  const { name, email } = getOrderCustomer(order);
  const errorText = getOrderErrorMessage(error, "Failed to load order");

  const handleStatusChange = async (nextStatus: string) => {
    const normalized = String(nextStatus ?? "").trim();
    if (!orderId || !normalized || normalized === currentStatus) return;

    setSelectedStatus(normalized);
    try {
      await updateOrderStatus({ id: orderId, status: normalized }).unwrap();
    } catch (updateError) {
      setSelectedStatus(undefined);
      void updateError;
    }
  };

  if (isError && !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-(--text)">
              Order details
            </div>
            <div className="mt-1 text-sm font-semibold text-(--text-muted)">
              Review the full order record and change its status.
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
          >
            <FiArrowLeft size={16} /> Back to orders
          </Link>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          {errorText}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-(--text)">
            Order details
          </div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted)">
            Review the full order record and change its status.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            startIcon={<FiRefreshCcw size={16} />}
          >
            {isFetching ? "Refreshing" : "Refresh"}
          </Button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
          >
            <FiArrowLeft size={16} /> Back to orders
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 text-sm font-semibold text-(--text-muted) shadow-sm">
          Loading order…
        </div>
      ) : null}

      {order ? (
        <>
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-xs font-semibold text-(--text-muted)">
                Transaction
              </div>
              <div className="mt-2 text-lg font-extrabold text-(--text)">
                {order.transactionId || "—"}
              </div>
              <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                Order ID: {orderId}
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-xs font-semibold text-(--text-muted)">
                Customer
              </div>
              <div className="mt-2 text-sm font-extrabold text-(--text)">
                {name}
              </div>
              <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                {email}
              </div>
            </div>

            <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-xs font-semibold text-(--text-muted)">
                Status
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Select
                  value={currentStatus}
                  onValueChange={(nextStatus) => {
                    void handleStatusChange(nextStatus);
                  }}
                  disabled={isUpdatingStatus}
                  options={ORDER_STATUS_OPTIONS}
                  size="sm"
                  variant="filled"
                  className="min-w-44"
                />
                <StatusPill value={currentStatus} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-6 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-sm font-extrabold text-(--text)">
                Shipping address
              </div>
              <div className="mt-3 space-y-2 text-sm font-semibold text-(--text-muted)">
                <div>
                  <span className="font-extrabold text-(--text)">Name:</span>{" "}
                  {order.shippingAddress?.fullName || "—"}
                </div>
                <div>
                  <span className="font-extrabold text-(--text)">Phone:</span>{" "}
                  {order.shippingAddress?.phone || "—"}
                </div>
                <div>
                  <span className="font-extrabold text-(--text)">Email:</span>{" "}
                  {order.shippingAddress?.email || "—"}
                </div>
                <div>
                  <span className="font-extrabold text-(--text)">Address:</span>{" "}
                  {order.shippingAddress?.address || "—"}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-sm font-extrabold text-(--text)">
                Payment summary
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <SummaryField
                  label="Method"
                  value={String(order.paymentMethod ?? "—")}
                />
                <SummaryField
                  label="Payment status"
                  value={String(order.paymentStatus ?? "—")}
                />
                <SummaryField
                  label="Subtotal"
                  value={formatMoneyBDT(order.subTotal)}
                />
                <SummaryField
                  label="Shipping fee"
                  value={formatMoneyBDT(order.shippingFee)}
                />
                <SummaryField
                  label="Discount"
                  value={formatMoneyBDT(order.discount)}
                />
                <SummaryField
                  label="Total"
                  value={formatMoneyBDT(order.totalAmount)}
                />
              </div>
            </div>
          </div>

          <Panel
            title="Items"
            subtitle={`${items.length} item(s)`}
            action={
              <div className="rounded-full bg-(--surface-2) px-3 py-1.5 text-xs font-extrabold text-(--text-muted)">
                {formatDateTime(order.createdAt)}
              </div>
            }
          >
            {items.length ? (
              <div className="overflow-hidden rounded-2xl border border-(--border)">
                <div className="overflow-x-auto">
                  <table className="min-w-225 w-full border-separate border-spacing-0">
                    <thead className="bg-(--surface-2)">
                      <tr>
                        {["Item", "SKU", "Qty", "Price", "Subtotal"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-(--text-muted)"
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const key = `${item?.sku ?? item?.product ?? index}`;

                        return (
                          <tr key={key} className="border-t border-(--border)">
                            <td className="px-4 py-4 align-top">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-extrabold text-(--text)">
                                  {item?.title || "—"}
                                </div>
                                <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                                  Product reference:{" "}
                                  {String(item?.product ?? "—")}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 align-top text-sm font-semibold text-(--text-muted)">
                              {item?.sku || "—"}
                            </td>
                            <td className="px-4 py-4 align-top text-sm font-extrabold text-(--text)">
                              {Number(item?.quantity) || 0}
                            </td>
                            <td className="px-4 py-4 align-top text-sm font-extrabold text-(--text)">
                              {formatMoneyBDT(item?.price)}
                            </td>
                            <td className="px-4 py-4 align-top text-sm font-extrabold text-(--text)">
                              {formatMoneyBDT(item?.subTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState>No line items found for this order.</EmptyState>
            )}
          </Panel>

          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-xs font-semibold text-(--text-muted)">
                Created
              </div>
              <div className="mt-1 text-sm font-extrabold text-(--text)">
                {formatDateTime(order.createdAt)}
              </div>
            </div>
            <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-xs font-semibold text-(--text-muted)">
                Updated
              </div>
              <div className="mt-1 text-sm font-extrabold text-(--text)">
                {formatDateTime(order.updatedAt)}
              </div>
            </div>
            <div className="lg:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="text-xs font-semibold text-(--text-muted)">
                Currency
              </div>
              <div className="mt-1 text-sm font-extrabold text-(--text)">
                {String(order.currency ?? "BDT")}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-4">
      <div className="text-xs font-semibold text-(--text-muted)">{label}</div>
      <div className="mt-1 text-sm font-extrabold text-(--text)">{value}</div>
    </div>
  );
}
