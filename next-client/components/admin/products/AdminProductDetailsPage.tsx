"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiArrowLeft, FiEdit, FiRefreshCcw } from "react-icons/fi";

import Button from "@/components/ui/Button";
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
import { useGetCategoriesQuery } from "@/services/category.service";
import { useGetProductBySlugQuery } from "@/services/product.service";
import { AdminProduct } from "@/types/product.types";
import {
  calcTotalStock,
  computeFinalPrice,
  getCategoryId,
  getProductErrorMessage,
} from "./product-utils";
import { cn } from "@/lib/utils/cn";

type AdminProductDetailsPageProps = {
  slug: string;
};

function getGallery(product: AdminProduct | null) {
  const thumbnail = product?.thumbnail ? [product.thumbnail] : [];
  const images = Array.isArray(product?.images) ? product!.images! : [];
  const gallery = [...thumbnail, ...images].filter(Boolean);
  return Array.from(new Set(gallery));
}

export default function AdminProductDetailsPage({
  slug,
}: AdminProductDetailsPageProps) {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetProductBySlugQuery(slug, { skip: !slug });

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const categories = toList(categoriesResponse?.data);

  const product = data?.data ?? null;
  const categoryId = getCategoryId(product);
  const categoryName =
    categories.find((cat) => String(cat?._id) === String(categoryId))?.name ??
    "—";

  const gallery = useMemo(() => getGallery(product), [product]);
  const [activeImage, setActiveImage] = useState("");
  const displayImage = gallery.includes(activeImage)
    ? activeImage
    : gallery[0] || "";

  const variants = useMemo(
    () => toList(product?.variants),
    [product?.variants],
  );
  const tags = useMemo(() => toList(product?.tags), [product?.tags]);

  const price = Number(product?.price) || 0;
  const discount = Number(product?.discountPercentage) || 0;
  const finalPrice = computeFinalPrice(price, discount);
  const stock = calcTotalStock(variants);

  const errorText = getProductErrorMessage(error, "Failed to load product");

  if (isError && !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-(--text)">
              Product details
            </div>
            <div className="mt-1 text-sm font-semibold text-(--text-muted)">
              Review details, variants, images, and pricing.
            </div>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
          >
            <FiArrowLeft size={16} /> Back to products
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
            Product details
          </div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted)">
            Review details, variants, images, and pricing.
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
            href={slug ? `/admin/products/${slug}/edit` : "/admin/products"}
          >
            <Button
              type="button"
              variant="outline"
              startIcon={<FiEdit size={16} />}
            >
              Edit
            </Button>
          </Link>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
          >
            <FiArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 text-sm font-semibold text-(--text-muted) shadow-sm">
          Loading product…
        </div>
      ) : null}

      {product ? (
        <>
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-(--text-muted)">
                    Preview
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-(--text)">
                    {product.title || "Untitled"}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                    Slug: {product.slug || slug}
                  </div>
                </div>
                <StatusPill value={product.isActive ? "active" : "inactive"} />
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-(--border) bg-(--surface-2)">
                <div
                  className="aspect-square w-full"
                  style={
                    displayImage
                      ? {
                          backgroundImage: `url(${displayImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                />
              </div>

              {gallery.length > 1 ? (
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {gallery.slice(0, 6).map((image) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(image)}
                      className={cn(
                        "aspect-square rounded-2xl border bg-(--surface-2) transition",
                        image === displayImage
                          ? "border-(--primary) ring-2 ring-(--primary)/20"
                          : "border-(--border) hover:opacity-90",
                      )}
                      style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      aria-label="Select image"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-7 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryCard label="Category" value={categoryName} />
                <SummaryCard
                  label="Stock"
                  value={`${stock.toLocaleString("en-US")} units`}
                />
                <SummaryCard
                  label="Price"
                  value={`${formatMoneyBDT(finalPrice)}`}
                  hint={discount > 0 ? `${discount}% off` : undefined}
                />
                <SummaryCard
                  label="Created"
                  value={formatDateTime(product.createdAt)}
                />
              </div>

              <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                <div className="text-sm font-extrabold text-(--text)">
                  Description
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm font-semibold text-(--text-muted)">
                  {product.description || "—"}
                </div>
              </div>

              <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                <div className="text-sm font-extrabold text-(--text)">Tags</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.length ? (
                    tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-(--surface-2) px-3 py-1 text-xs font-extrabold text-(--text-muted)"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm font-semibold text-(--text-muted)">
                      No tags
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Panel
            title="Variants"
            subtitle={`${variants.length} variant(s)`}
            action={
              <div className="rounded-full bg-(--surface-2) px-3 py-1.5 text-xs font-extrabold text-(--text-muted)">
                {product.isFeatured ? "Featured" : "Not featured"}
              </div>
            }
          >
            {variants.length ? (
              <div className="overflow-hidden rounded-2xl border border-(--border)">
                <div className="overflow-x-auto">
                  <table className="min-w-225 w-full border-separate border-spacing-0">
                    <thead className="bg-(--surface-2)">
                      <tr>
                        {["SKU", "Color", "Size", "Stock"].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-(--text-muted)"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr
                          key={variant.sku}
                          className="border-t border-(--border)"
                        >
                          <td className="px-4 py-4 text-sm font-extrabold text-(--text)">
                            {variant.sku}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-(--text-muted)">
                            {variant.color}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-(--text-muted)">
                            {String(variant.sizes || "—")}
                          </td>
                          <td className="px-4 py-4 text-sm font-extrabold text-(--text)">
                            {Number(variant.stock || 0).toLocaleString("en-US")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState>No variants found.</EmptyState>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm">
      <div className="text-xs font-semibold text-(--text-muted)">{label}</div>
      <div className="mt-2 text-lg font-extrabold text-(--text)">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs font-semibold text-(--text-muted)">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
