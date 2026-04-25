"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiEdit,
  FiExternalLink,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import {
  EmptyState,
  Panel,
  StatusPill,
} from "@/components/admin/dashboard/DashboardPrimitives";
import {
  formatCount,
  formatDateTime,
  formatMoneyBDT,
  toList,
} from "@/components/admin/dashboard/dashboard-utils";
import useDebounce from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";
import { useGetProfileQuery } from "@/services/auth.service";
import { useGetCategoriesQuery } from "@/services/category.service";
import {
  useGetAdminProductsQuery,
  useToggleProductFeaturedMutation,
} from "@/services/product.service";
import { type AdminProduct } from "@/types/product.types";
import {
  calcTotalStock,
  computeFinalPrice,
  getCategoryLabel,
  getProductErrorMessage,
  PRODUCT_PRICE_SORT_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from "./product-utils";

const PAGE_SIZE = 8;

function normalizeStatus(status: string) {
  if (status === "active") return "true" as const;
  if (status === "inactive") return "false" as const;
  return "all" as const;
}

function normalizeSort(sortValue: string) {
  if (sortValue === "asc" || sortValue === "desc") return sortValue;
  return undefined;
}

function getProductKey(product: AdminProduct, index: number) {
  return String(product.slug ?? product._id ?? product.id ?? index);
}

export default function AdminProductsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<(typeof PRODUCT_STATUS_OPTIONS)[number]["value"]>("all");
  const [category, setCategory] = useState("all");
  const [sortPrice, setSortPrice] =
    useState<(typeof PRODUCT_PRICE_SORT_OPTIONS)[number]["value"]>("default");
  const [page, setPage] = useState(1);
  const [optimisticFeatured, setOptimisticFeatured] = useState<
    Record<string, boolean>
  >({});

  const debouncedSearch = useDebounce(search.trim(), 350);
  const searchTerm = debouncedSearch.length ? debouncedSearch : undefined;

  const { data: profileData } = useGetProfileQuery();
  const role = String(profileData?.data?.role ?? "").toLowerCase();
  const canToggleFeatured = role === "admin";

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const categories = toList(categoriesResponse?.data);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAdminProductsQuery({
      page,
      limit: PAGE_SIZE,
      category: category !== "all" ? category : undefined,
      search: searchTerm,
      isActive: normalizeStatus(status),
      sortPrice: normalizeSort(sortPrice),
    });

  const [toggleFeatured, { isLoading: isTogglingFeatured }] =
    useToggleProductFeaturedMutation();

  const products = useMemo(() => toList(data?.products), [data?.products]);
  const pagination = data?.pagination;
  const totalPages = Math.max(1, Number(pagination?.totalPages) || 1);

  const errorText = getProductErrorMessage(error, "Failed to load products");

  const onToggleFeatured = async (product: AdminProduct) => {
    if (!canToggleFeatured) return;

    const slug = String(product?.slug ?? "").trim();
    if (!slug) return;

    const currentFeatured = Boolean(product?.isFeatured);
    setOptimisticFeatured((current) => ({
      ...current,
      [slug]: !currentFeatured,
    }));

    try {
      await toggleFeatured(slug).unwrap();
      toast.success(
        "Updated",
        `Product is now ${currentFeatured ? "not featured" : "featured"}.`,
      );
    } catch (toggleError) {
      setOptimisticFeatured((current) => {
        const copy = { ...current };
        delete copy[slug];
        return copy;
      });
      toast.error(
        "Update failed",
        getProductErrorMessage(toggleError, "Failed to toggle featured"),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-(--text)">
            Products
          </div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted)">
            Create products, update pricing, and manage featured items.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/create">
            <Button
              type="button"
              variant="default"
              startIcon={<FiPlus size={16} />}
            >
              Create
            </Button>
          </Link>

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
      </div>

      {isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          {errorText}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-2 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 shadow-sm">
            <FiSearch className="text-(--text-muted)" size={16} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by title"
              className="w-full bg-transparent text-sm font-semibold text-(--text) outline-none placeholder:text-(--text-muted)"
            />
            {search.trim().length ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--surface-2) text-(--text-muted) transition hover:opacity-90"
                aria-label="Clear search"
              >
                <FiX size={16} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as typeof status);
                setPage(1);
              }}
              options={PRODUCT_STATUS_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              size="sm"
              variant="filled"
              className="min-w-44"
            />

            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
              size="sm"
              variant="filled"
              options={[
                { label: "All categories", value: "all" },
                ...categories.map((cat) => ({
                  label: cat.name,
                  value: cat.slug,
                })),
              ]}
            />

            <Select
              value={sortPrice}
              onValueChange={(value) => {
                setSortPrice(value as typeof sortPrice);
                setPage(1);
              }}
              options={PRODUCT_PRICE_SORT_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              size="sm"
              variant="filled"
            />
          </div>
        </div>
      </div>

      <Panel
        title="Product list"
        subtitle={
          isLoading
            ? "Loading products…"
            : `${products.length} item(s) on this page`
        }
        action={
          <div className="rounded-full bg-(--surface-2) px-3 py-1.5 text-xs font-extrabold text-(--text-muted)">
            {isFetching ? "Syncing" : "Ready"}
          </div>
        }
      >
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold text-(--text-muted)">
              Total
            </div>
            <div className="mt-1 text-sm font-extrabold text-(--text)">
              {isLoading
                ? "Loading…"
                : formatCount(pagination?.total ?? products.length)}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold text-(--text-muted)">
              Page
            </div>
            <div className="mt-1 text-sm font-extrabold text-(--text)">
              {page} / {totalPages}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-(--border) bg-(--surface-2) px-4 py-3 shadow-sm">
            <div className="text-xs font-semibold text-(--text-muted)">
              Featured toggle
            </div>
            <div className="mt-1 text-sm font-extrabold text-(--text)">
              {canToggleFeatured ? "Enabled" : "Admin only"}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-(--border)">
          <div className="overflow-x-auto">
            <table className="min-w-275 w-full border-separate border-spacing-0">
              <thead className="bg-(--surface-2)">
                <tr>
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Stock",
                    "Status",
                    "Featured",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-(--text-muted)",
                        heading === "Price" && "text-right",
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
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <div className="text-sm font-semibold text-(--text-muted)">
                        Loading products…
                      </div>
                    </td>
                  </tr>
                ) : products.length ? (
                  products.map((product, index) => {
                    const slug = String(product?.slug ?? "");
                    const title = String(product?.title ?? "Untitled");
                    const thumbnail = String(product?.thumbnail ?? "");
                    const categoryLabel = getCategoryLabel(product);
                    const price = Number(product?.price) || 0;
                    const discount = Number(product?.discountPercentage) || 0;
                    const finalPrice = computeFinalPrice(price, discount);
                    const stock = calcTotalStock(product?.variants);
                    const statusValue = product?.isActive
                      ? "active"
                      : "inactive";
                    const featured =
                      typeof optimisticFeatured[slug] === "boolean"
                        ? optimisticFeatured[slug]
                        : Boolean(product?.isFeatured);

                    return (
                      <tr
                        key={getProductKey(product, index)}
                        className="border-t border-(--border)"
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="h-11 w-11 shrink-0 rounded-2xl border border-(--border) bg-(--surface-2)"
                              style={
                                thumbnail
                                  ? {
                                      backgroundImage: `url(${thumbnail})`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }
                                  : undefined
                              }
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-extrabold text-(--text)">
                                {title}
                              </div>
                              <div className="mt-1 truncate text-xs font-semibold text-(--text-muted)">
                                Slug: {slug || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-bold text-(--text)">
                            {categoryLabel}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right align-top">
                          <div className="space-y-1">
                            <div className="text-sm font-extrabold text-(--text)">
                              {formatMoneyBDT(finalPrice)}
                            </div>
                            <div className="text-xs font-semibold text-(--text-muted)">
                              {discount > 0
                                ? `${formatMoneyBDT(price)} · ${discount}% off`
                                : formatMoneyBDT(price)}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-extrabold text-(--text)">
                            {formatCount(stock)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                            {Array.isArray(product?.variants)
                              ? `${product.variants.length} variant(s)`
                              : "0 variants"}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <StatusPill value={statusValue} />
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                                featured
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200"
                                  : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80",
                              )}
                            >
                              {featured ? "featured" : "—"}
                            </span>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                !canToggleFeatured ||
                                isTogglingFeatured ||
                                !slug
                              }
                              onClick={() => {
                                void onToggleFeatured(product);
                              }}
                              aria-label="Toggle featured"
                              title={
                                canToggleFeatured
                                  ? "Toggle featured"
                                  : "Admin only"
                              }
                            >
                              <FiStar size={16} />
                            </Button>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="text-xs font-semibold text-(--text-muted)">
                            {formatDateTime(product?.createdAt)}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={
                                slug
                                  ? `/admin/products/${slug}`
                                  : "/admin/products"
                              }
                              className={cn(
                                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition hover:opacity-90",
                                !slug && "pointer-events-none opacity-60",
                              )}
                              aria-label="View product"
                              title="View"
                            >
                              <FiExternalLink size={16} />
                            </Link>

                            <Link
                              href={
                                slug
                                  ? `/admin/products/${slug}/edit`
                                  : "/admin/products"
                              }
                              className={cn(
                                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) transition hover:opacity-90",
                                !slug && "pointer-events-none opacity-60",
                              )}
                              aria-label="Edit product"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10">
                      <EmptyState>
                        No products found for the current filters.
                      </EmptyState>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xs font-semibold text-(--text-muted)">
            Showing page {page} of {totalPages}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      </Panel>
    </div>
  );
}
