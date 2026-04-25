"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiPlus,
  FiRefreshCcw,
  FiSave,
  FiTrash,
  FiX,
} from "react-icons/fi";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { Panel } from "@/components/admin/dashboard/DashboardPrimitives";
import { toList } from "@/components/admin/dashboard/dashboard-utils";
import { useToast } from "@/hooks/useToast";
import { useGetCategoriesQuery } from "@/services/category.service";
import {
  buildProductFormData,
  useCreateProductMutation,
  useGetProductBySlugQuery,
  useUpdateProductMutation
} from "@/services/product.service";
import { AdminProduct, ProductVariant } from "@/types/product.types";
import {
  getCategoryId,
  getProductErrorMessage,
  PRODUCT_SIZE_OPTIONS,
} from "./product-utils";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";

type Mode = "create" | "edit";

type AdminProductUpsertPageProps =
  | { mode: "create" }
  | { mode: "edit"; slug: string };

function emptyVariant(): ProductVariant {
  return {
    sku: "",
    color: "",
    sizes: "m",
    stock: 1,
  };
}

function uniqueSkus(variants: ProductVariant[]) {
  const skus = variants.map((v) => String(v.sku || "").trim()).filter(Boolean);
  return new Set(skus).size === skus.length;
}

export default function AdminProductUpsertPage(
  props: AdminProductUpsertPageProps,
) {
  const mode: Mode = props.mode;

  const slug = props.mode === "edit" ? props.slug : "";
  const { data, isFetching, isError, error, refetch } =
    useGetProductBySlugQuery(slug, {
      skip: mode !== "edit" || !slug,
    });

  const product = data?.data ?? null;
  const errorText = getProductErrorMessage(error, "Failed to load product");

  if (mode === "create") {
    return <AdminProductUpsertForm mode="create" />;
  }

  if (isError && !product) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-(--text)">
              Edit product
            </div>
            <div className="mt-1 text-sm font-semibold text-(--text-muted)">
              Update product details and inventory.
            </div>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
          >
            <FiArrowLeft size={16} /> Back
          </Link>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
          {errorText}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-3xl border border-(--border) bg-(--surface) p-6 text-sm font-semibold text-(--text-muted) shadow-sm">
        Loading product…
      </div>
    );
  }

  return (
    <AdminProductUpsertForm
      key={`${slug}:${String(product.updatedAt ?? "")}`}
      mode="edit"
      slug={slug}
      product={product}
      isFetchingProduct={isFetching}
      onRefresh={refetch}
    />
  );
}

function AdminProductUpsertForm({
  mode,
  slug,
  product,
  isFetchingProduct,
  onRefresh,
}: {
  mode: Mode;
  slug?: string;
  product?: AdminProduct | null;
  isFetchingProduct?: boolean;
  onRefresh?: () => unknown;
}) {
  const router = useRouter();
  const toast = useToast();

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const categories = toList(categoriesResponse?.data);

  const initialCategoryId =
    mode === "edit" && product ? getCategoryId(product) : "";
  const initialTagsText =
    mode === "edit" && product && Array.isArray(product.tags)
      ? product.tags.join(", ")
      : "";
  const initialVariants: ProductVariant[] =
    mode === "edit" &&
    product &&
    Array.isArray(product.variants) &&
    product.variants.length
      ? product.variants.map((v) => ({
          sku: String(v.sku ?? ""),
          color: String(v.color ?? ""),
          sizes: String(v.sizes ?? "m"),
          stock: Number(v.stock ?? 1),
        }))
      : [emptyVariant()];

  const [title, setTitle] = useState(() =>
    mode === "edit" ? String(product?.title ?? "") : "",
  );
  const [description, setDescription] = useState(() =>
    mode === "edit" ? String(product?.description ?? "") : "",
  );
  const [categoryId, setCategoryId] = useState(() => initialCategoryId);
  const [price, setPrice] = useState<string>(() =>
    mode === "edit" && product?.price != null ? String(product.price) : "",
  );
  const [discountPercentage, setDiscountPercentage] = useState<string>(() =>
    mode === "edit" && product?.discountPercentage != null
      ? String(product.discountPercentage)
      : "",
  );
  const [isActive, setIsActive] = useState(() =>
    mode === "edit" ? Boolean(product?.isActive) : true,
  );
  const [tagsText, setTagsText] = useState(() => initialTagsText);
  const [variants, setVariants] = useState<ProductVariant[]>(
    () => initialVariants,
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [destroyImages, setDestroyImages] = useState<string[]>(() => []);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isBusy = isCreating || isUpdating;

  const existingThumbnail = String(product?.thumbnail ?? "");
  const existingImages = useMemo(
    () => (Array.isArray(product?.images) ? product.images : []),
    [product],
  );

  const keptExistingImages = useMemo(() => {
    if (mode !== "edit") return [] as string[];
    if (!existingImages.length) return [] as string[];
    if (!destroyImages.length) return existingImages;
    return existingImages.filter((img) => !destroyImages.includes(img));
  }, [destroyImages, existingImages, mode]);

  const thumbnailPreviewUrl = useMemo(() => {
    if (!thumbnailFile) return "";
    return URL.createObjectURL(thumbnailFile);
  }, [thumbnailFile]);

  const newImagePreviewUrls = useMemo(
    () =>
      imagesFiles.map((file) => ({
        key: `${file.name}:${file.size}:${file.lastModified}`,
        url: URL.createObjectURL(file),
      })),
    [imagesFiles],
  );

  useEffect(() => {
    return () => {
      for (const preview of newImagePreviewUrls) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [newImagePreviewUrls]);

  const tagList = useMemo(() => {
    const raw = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return Array.from(new Set(raw));
  }, [tagsText]);

  const onSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    const numericPrice = Number(price);
    const numericDiscount =
      discountPercentage.trim().length > 0
        ? Number(discountPercentage)
        : undefined;

    if (!trimmedTitle) {
      toast.error("Validation", "Title is required");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Validation", "Description is required");
      return;
    }

    if (!categoryId) {
      toast.error("Validation", "Category is required");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      toast.error("Validation", "Price must be a positive number");
      return;
    }

    if (
      typeof numericDiscount !== "undefined" &&
      (!Number.isFinite(numericDiscount) ||
        numericDiscount < 0 ||
        numericDiscount > 100)
    ) {
      toast.error("Validation", "Discount must be between 0 and 100");
      return;
    }

    const normalizedVariants = variants
      .map((variant) => ({
        sku: String(variant.sku || "").trim(),
        color: String(variant.color || "").trim(),
        sizes: String(variant.sizes || "").trim(),
        stock: Number(variant.stock),
      }))
      .filter((variant) => variant.sku || variant.color || variant.sizes);

    if (!normalizedVariants.length) {
      toast.error("Validation", "At least 1 variant is required");
      return;
    }

    for (const variant of normalizedVariants) {
      if (!variant.sku) {
        toast.error("Validation", "Variant SKU is required");
        return;
      }
      if (!variant.color) {
        toast.error("Validation", "Variant color is required");
        return;
      }
      if (!variant.sizes) {
        toast.error("Validation", "Variant size is required");
        return;
      }
      if (!Number.isFinite(variant.stock) || variant.stock < 1) {
        toast.error("Validation", "Variant stock must be at least 1");
        return;
      }
    }

    if (!uniqueSkus(normalizedVariants)) {
      toast.error("Validation", "SKU must be unique across variants");
      return;
    }

    if (mode === "create" && !thumbnailFile) {
      toast.error("Validation", "Thumbnail is required");
      return;
    }

    if (imagesFiles.length > 6) {
      toast.error("Validation", "Maximum 6 images are allowed");
      return;
    }

    if (mode === "edit") {
      const keptExistingCount = keptExistingImages.length;
      const totalAfterUpdate = keptExistingCount + imagesFiles.length;

      if (totalAfterUpdate > 6) {
        toast.error(
          "Validation",
          "After update, total images must be 6 or less",
        );
        return;
      }

      if (totalAfterUpdate < 1) {
        toast.error("Validation", "At least 1 image must remain");
        return;
      }
    }

    const formData = buildProductFormData({
      title: trimmedTitle,
      description: trimmedDescription,
      category: categoryId,
      price: numericPrice,
      discountPercentage: numericDiscount,
      variants: normalizedVariants,
      tags: tagList,
      isActive,
      thumbnail: thumbnailFile,
      images: imagesFiles,
      destroyImages: mode === "edit" ? destroyImages : undefined,
    });

    try {
      if (mode === "create") {
        const result = await createProduct(formData).unwrap();
        const nextSlug = String(result?.data?.slug ?? "").trim();
        toast.success("Created", "Product created successfully");
        router.push(
          nextSlug ? `/admin/products/${nextSlug}` : "/admin/products",
        );
      } else {
        const safeSlug = String(slug ?? "").trim();
        if (!safeSlug) return;
        const result = await updateProduct({
          slug: safeSlug,
          body: formData,
        }).unwrap();
        const nextSlug = String(result?.data?.slug ?? safeSlug).trim();
        toast.success("Updated", "Product updated successfully");
        router.push(`/admin/products/${nextSlug}`);
      }
    } catch (submitError) {
      toast.error(
        "Save failed",
        getProductErrorMessage(submitError, "Failed to save product"),
      );
    }
  };

  const cancelHref =
    mode === "edit" ? `/admin/products/${slug}` : "/admin/products";

  const onToggleDestroyExistingImage = (imageUrl: string) => {
    if (mode !== "edit") return;
    const safeUrl = String(imageUrl || "");
    if (!safeUrl) return;

    const isMarked = destroyImages.includes(safeUrl);
    if (isMarked) {
      const nextMarked = destroyImages.filter((url) => url !== safeUrl);
      const nextKeptExistingCount = existingImages.filter(
        (img) => !nextMarked.includes(img),
      ).length;
      const totalAfterUpdate = nextKeptExistingCount + imagesFiles.length;

      if (totalAfterUpdate > 6) {
        toast.error(
          "Validation",
          "After update, total images must be 6 or less",
        );
        return;
      }

      setDestroyImages(nextMarked);
      return;
    }

    const nextMarked = Array.from(new Set([...destroyImages, safeUrl]));
    const nextKeptExistingCount = existingImages.filter(
      (img) => !nextMarked.includes(img),
    ).length;
    const totalAfterUpdate = nextKeptExistingCount + imagesFiles.length;

    if (totalAfterUpdate < 1) {
      toast.error("Validation", "At least 1 image must remain");
      return;
    }

    if (totalAfterUpdate > 6) {
      toast.error("Validation", "After update, total images must be 6 or less");
      return;
    }

    setDestroyImages(nextMarked);
  };

  const isSameFile = (a: File, b: File) =>
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-(--text)">
            {mode === "create" ? "Create product" : "Edit product"}
          </div>
          <div className="mt-1 text-sm font-semibold text-(--text-muted)">
            {mode === "create"
              ? "Add a new product to your catalog."
              : "Update product details and inventory."}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onRefresh?.()}
              disabled={Boolean(isFetchingProduct)}
              startIcon={<FiRefreshCcw size={16} />}
            >
              {isFetchingProduct ? "Refreshing" : "Refresh"}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="default"
            onClick={() => void onSubmit()}
            disabled={isBusy}
            startIcon={<FiSave size={16} />}
            loading={isBusy}
            loadingLabel={mode === "create" ? "Creating…" : "Saving…"}
          >
            {mode === "create" ? "Create" : "Save"}
          </Button>

          <Link
            href={cancelHref}
            className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-bold text-(--text) transition hover:opacity-90"
          >
            <FiArrowLeft size={16} /> Cancel
          </Link>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          <Panel title="Basics" subtitle="Core product information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Product title"
                required
              />

              <Select
                label="Category"
                value={categoryId}
                onValueChange={(value) => setCategoryId(value)}
                required
                options={categories
                  .map((cat) => ({
                    label: cat.name,
                    value: String(cat._id ?? ""),
                  }))
                  .filter((option) => option.value)}
                placeholder={
                  categories.length ? "Select category" : "No categories"
                }
                size="md"
                variant="default"
              />

              <Input
                label="Price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. 1999"
                inputMode="decimal"
                required
              />

              <Input
                label="Discount (%)"
                value={discountPercentage}
                onChange={(event) => setDiscountPercentage(event.target.value)}
                placeholder="e.g. 10"
                inputMode="numeric"
              />

              <Select
                label="Status"
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                size="md"
                variant="default"
              />

              <Input
                label="Tags (comma separated)"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="e.g. summer, premium"
              />
            </div>

            <div className="mt-3">
              <Textarea
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write a short description"
                required
                rows={6}
              />
            </div>
          </Panel>

          <Panel title="Variants" subtitle="SKU, color, size, and stock">
            <div className="space-y-3">
              {variants.map((variant, index) => {
                const canRemove = variants.length > 1;

                return (
                  <div
                    key={`${variant.sku}-${index}`}
                    className="rounded-2xl border border-(--border) bg-(--surface-2) p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
                      <div className="sm:col-span-3">
                        <Input
                          label={index === 0 ? "SKU" : undefined}
                          value={variant.sku}
                          onChange={(event) => {
                            const next = [...variants];
                            next[index] = {
                              ...next[index],
                              sku: event.target.value,
                            };
                            setVariants(next);
                          }}
                          placeholder="e.g. SKU-001"
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Input
                          label={index === 0 ? "Color" : undefined}
                          value={variant.color}
                          onChange={(event) => {
                            const next = [...variants];
                            next[index] = {
                              ...next[index],
                              color: event.target.value,
                            };
                            setVariants(next);
                          }}
                          placeholder="e.g. Black"
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Select
                          label={index === 0 ? "Size" : undefined}
                          value={String(variant.sizes ?? "m")}
                          onValueChange={(value) => {
                            const next = [...variants];
                            next[index] = { ...next[index], sizes: value };
                            setVariants(next);
                          }}
                          options={PRODUCT_SIZE_OPTIONS.map((option) => ({
                            label: option.label,
                            value: option.value,
                          }))}
                          size="sm"
                          variant="filled"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label={index === 0 ? "Stock" : undefined}
                          value={String(variant.stock ?? "")}
                          onChange={(event) => {
                            const next = [...variants];
                            next[index] = {
                              ...next[index],
                              stock: Number(event.target.value),
                            };
                            setVariants(next);
                          }}
                          placeholder="e.g. 10"
                          inputMode="numeric"
                          size="sm"
                        />
                      </div>

                      <div className="sm:col-span-1 sm:flex sm:justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={!canRemove}
                          onClick={() => {
                            if (!canRemove) return;
                            setVariants((current) =>
                              current.filter((_, idx) => idx !== index),
                            );
                          }}
                          aria-label="Remove variant"
                          title={
                            canRemove ? "Remove" : "At least 1 variant required"
                          }
                        >
                          <FiTrash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div>
                <Button
                  type="button"
                  variant="secondary"
                  startIcon={<FiPlus size={16} />}
                  onClick={() =>
                    setVariants((current) => [...current, emptyVariant()])
                  }
                >
                  Add variant
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <Panel title="Images" subtitle="Thumbnail and gallery images">
            <div className="space-y-4">
              <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                <div className="text-xs font-semibold text-(--text-muted)">
                  Current thumbnail
                </div>
                <div
                  className="mt-3 aspect-square w-full rounded-3xl border border-(--border) bg-(--surface)"
                  style={
                    thumbnailPreviewUrl
                      ? {
                          backgroundImage: `url(${thumbnailPreviewUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : existingThumbnail
                        ? {
                            backgroundImage: `url(${existingThumbnail})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                  }
                />

                <div className="mt-3">
                  <label className="inline-flex w-full cursor-pointer flex-col gap-2">
                    <span className="text-sm font-medium text-(--text)">
                      {mode === "create"
                        ? "Thumbnail (required)"
                        : "Replace thumbnail"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setThumbnailFile(file);
                        event.target.value = "";
                      }}
                      className={cn(
                        "block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm",
                        "file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900",
                        "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:file:bg-slate-800 dark:file:text-slate-50",
                      )}
                    />
                  </label>

                  {thumbnailFile ? (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-(--border) bg-(--surface) px-3 py-2">
                      <div className="min-w-0 truncate text-xs font-semibold text-(--text-muted)">
                        Selected: {thumbnailFile.name}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setThumbnailFile(null)}
                        startIcon={<FiX size={16} />}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                <div className="text-xs font-semibold text-(--text-muted)">
                  Gallery images
                </div>
                <div className="mt-2 text-xs font-semibold text-(--text-muted)">
                  Existing:{" "}
                  {mode === "edit"
                    ? `${keptExistingImages.length}/${existingImages.length}`
                    : String(existingImages.length)}{" "}
                  · New: {imagesFiles.length} (max 6)
                </div>

                {mode === "edit" && existingImages.length ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-(--text-muted)">
                      Click an image to mark/unmark for removal.
                    </div>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {existingImages.map((image) => {
                        const isMarked = destroyImages.includes(image);

                        return (
                          <button
                            key={image}
                            type="button"
                            onClick={() => onToggleDestroyExistingImage(image)}
                            className={cn(
                              "relative aspect-square rounded-2xl border border-(--border) bg-(--surface) transition",
                              isMarked ? "opacity-50" : "hover:opacity-90",
                            )}
                            style={{
                              backgroundImage: `url(${image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                            aria-label={
                              isMarked
                                ? "Unmark image for removal"
                                : "Mark image for removal"
                            }
                            title={
                              isMarked ? "Will be removed" : "Click to remove"
                            }
                          >
                            {isMarked ? (
                              <span className="absolute inset-1 flex items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-[10px] font-extrabold text-(--text)">
                                Remove
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    {destroyImages.length ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setDestroyImages([])}
                        >
                          Undo removals ({destroyImages.length})
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-3">
                  <label className="inline-flex w-full cursor-pointer flex-col gap-2">
                    <span className="text-sm font-medium text-(--text)">
                      Add images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        const maxNewImages =
                          mode === "edit"
                            ? Math.max(0, 6 - keptExistingImages.length)
                            : 6;

                        setImagesFiles((current) => {
                          const merged = [...current];

                          for (const file of files) {
                            if (!merged.some((f) => isSameFile(f, file))) {
                              merged.push(file);
                            }
                          }

                          if (merged.length > maxNewImages) {
                            toast.error(
                              "Validation",
                              maxNewImages > 0
                                ? `You can add up to ${maxNewImages} new images`
                                : "Remove some existing images first",
                            );
                            return merged.slice(0, maxNewImages);
                          }

                          return merged;
                        });
                        event.target.value = "";
                      }}
                      className={cn(
                        "block w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm",
                        "file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900",
                        "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:file:bg-slate-800 dark:file:text-slate-50",
                      )}
                    />
                  </label>
                </div>

                {imagesFiles.length ? (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-(--text-muted)">
                      Selected images preview
                    </div>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {newImagePreviewUrls.map((preview, index) => (
                        <div
                          key={`${preview.key}:${index}`}
                          className="relative aspect-square overflow-hidden rounded-2xl border border-(--border) bg-(--surface)"
                          title="Selected image"
                        >
                          <Image
                            src={preview.url}
                            alt="image preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setImagesFiles((current) =>
                                current.filter((_, idx) => idx !== index),
                              )
                            }
                            className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-(--border) bg-(--surface) text-(--text) hover:opacity-90"
                            aria-label="Remove selected image"
                            title="Remove"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setImagesFiles([])}
                      >
                        Clear selected ({imagesFiles.length})
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel title="Notes" subtitle="What gets saved">
            <div className="space-y-2 text-sm font-semibold text-(--text-muted)">
              <div>
                - Create requires a thumbnail; edit can keep existing thumbnail.
              </div>
              <div>- Images: choose up to 6 files.</div>
              <div>- Tags are split by comma and de-duplicated.</div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
