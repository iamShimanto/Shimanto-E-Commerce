import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import { useToast } from "../hooks/useToast";

import { useGetProductBySlugQuery } from "../api/products/productsApi";
import { useAddToCartMutation } from "../api/cart/cartApi";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop";

const moneyBDT = (amount) => {
  const n = Number(amount || 0);
  if (!Number.isFinite(n)) return "৳ 0.00";
  return `৳ ${n.toFixed(2)}`;
};

const clampText = (value, max = 160) => {
  const s = String(value || "").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max).trim()}…`;
};

function uniqueStrings(values) {
  const out = [];
  const seen = new Set();
  for (const v of values) {
    const s = String(v || "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function ProductDetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="aspect-square animate-pulse bg-gray-100 dark:bg-zinc-900" />
          <div className="border-t border-gray-200 p-4 dark:border-zinc-800">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-gray-100 dark:bg-zinc-900"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="space-y-6">
          <div>
            <div className="h-7 w-36 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-900" />
            <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
                <div className="mt-2 h-9 w-40 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
              </div>
              <div className="h-8 w-24 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
            </div>

            <div className="mt-6">
              <div className="h-4 w-12 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
              <div className="mt-3 flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-14 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-900"
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="h-12 w-44 animate-pulse rounded-2xl bg-gray-100 dark:bg-zinc-900" />
              <div className="h-12 flex-1 animate-pulse rounded-2xl bg-gray-100 dark:bg-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const {
    data: product,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProductBySlugQuery(slug, { skip: !slug });

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const images = useMemo(() => {
    const extra = Array.isArray(product?.images) ? product.images : [];
    const list = uniqueStrings(extra);
    if (list.length) return list;

    // If no images exist, fallback to thumbnail (then hard fallback)
    const thumb = product?.thumbnail ? String(product.thumbnail) : "";
    return uniqueStrings([thumb])[0] ? [thumb] : [FALLBACK_IMAGE];
  }, [product]);

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product]
  );

  const inStockVariants = useMemo(
    () => variants.filter((v) => Number(v?.stock) > 0),
    [variants]
  );

  const availableSizes = useMemo(
    () => uniqueStrings(variants.map((v) => v?.sizes)),
    [variants]
  );

  const sizeInStock = useMemo(() => {
    const map = new Map();
    for (const v of variants) {
      const s = String(v?.sizes || "").trim();
      if (!s) continue;
      const ok = Number(v?.stock) > 0;
      map.set(s.toLowerCase(), Boolean(map.get(s.toLowerCase())) || ok);
    }
    return map;
  }, [variants]);

  const [activeImage, setActiveImage] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  const defaultVariant = inStockVariants[0] || variants[0] || null;
  const resolvedSize = String(size || defaultVariant?.sizes || "").trim();
  const resolvedActiveImage =
    activeImage && images.includes(activeImage) ? activeImage : images[0] || "";

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    const cleanSize = String(resolvedSize || "").trim().toLowerCase();

    if (cleanSize) {
      const matchInStock = variants.find((v) => {
        const s = String(v?.sizes || "").trim().toLowerCase();
        return s === cleanSize && Number(v?.stock) > 0;
      });
      if (matchInStock) return matchInStock;

      const matchAny = variants.find((v) => {
        const s = String(v?.sizes || "").trim().toLowerCase();
        return s === cleanSize;
      });
      if (matchAny) return matchAny;
    }

    return inStockVariants[0] || variants[0];
  }, [variants, inStockVariants, resolvedSize]);

  const stock = Number(selectedVariant?.stock ?? 0);
  const hasDiscount = Number(product?.discountPercentage || 0) > 0;
  const price = Number(product?.price || 0);
  const discount = Number(product?.discountPercentage || 0);
  const finalPrice = hasDiscount ? price - (price * discount) / 100 : price;

  const canAdd =
    Boolean(product?._id) &&
    Boolean(selectedVariant?.sku) &&
    Number.isInteger(qty) &&
    qty >= 1 &&
    stock >= qty;

  const onAddToCart = async () => {
    if (!product?._id) return;
    if (!selectedVariant?.sku) {
      push({
        title: "Select a variant",
        message: "Please choose a size before adding to cart.",
        variant: "warning",
      });
      return;
    }

    if (qty < 1) {
      push({
        title: "Invalid quantity",
        message: "Quantity must be at least 1.",
        variant: "warning",
      });
      return;
    }

    if (stock > 0 && qty > stock) {
      push({
        title: "Not enough stock",
        message: `Only ${stock} item(s) available for this variant.`,
        variant: "error",
      });
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        sku: selectedVariant.sku,
        quantity: qty,
      }).unwrap();

      push({
        title: "Added to cart",
        description: `${product?.title || "Product"} added successfully.`,
        variant: "success",
      });
    } catch (e) {
      const status = e?.status || e?.originalStatus || e?.data?.statusCode;
      const msg =
        e?.data?.message ||
        e?.data?.error ||
        (typeof e?.error === "string" ? e.error : null) ||
        "Failed to add to cart";

      if (status === 401) {
        push({
          title: "Login required",
          message: "Please login to add items to cart.",
          variant: "warning",
        });
        navigate("/login");
        return;
      }

      push({
        title: "Add to cart failed",
        message: msg,
        variant: "error",
      });
    }
  };

  const seoTitle = product?.title || "Product";
  const seoDescription =
    clampText(product?.description, 170) ||
    "Explore product details, variants, and pricing.";

  const hasProduct = Boolean(product?._id);
  const showSkeleton = (isLoading || isFetching) && !hasProduct;
  const showNotFound = !isLoading && !isFetching && !hasProduct;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords="product details, shimanto store"
        image={images[0]}
        url={slug ? `/products/${slug}` : "/products"}
        type="product"
        price={String(finalPrice)}
        availability={stock > 0 ? "in stock" : "out of stock"}
        productId={selectedVariant?.sku || product?._id}
      />

      <section className="min-h-screen w-full pb-16 pt-6 sm:pt-8 md:pb-20 md:pt-14">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <nav className="hidden items-center gap-2 text-sm md:flex">
                <Link to="/" className="hover:underline">
                  Home
                </Link>
                <span className="opacity-60">/</span>
                <Link to="/products" className="hover:underline">
                  Products
                </Link>
                <span className="opacity-60">/</span>
                <span className="max-w-72 truncate">
                  {isLoading ? "Loading…" : seoTitle}
                </span>
              </nav>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full sm:w-auto cursor-pointer"
              >
                {isFetching ? "Refreshing…" : "Refresh"}
              </Button>
              <Link to="/cart" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ShoppingCart size={16} />}
                  className="w-full"
                >
                  Cart
                </Button>
              </Link>
            </div>
          </div>

          {isError || showNotFound ? (
            <div className="rounded-3xl border border-red-200 p-6 dark:border-red-900/50">
              <div className="text-lg font-bold">Product not found</div>
              <div className="mt-1 text-sm">
                {error?.data?.message || "Could not load this product."}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/products">
                  <Button variant="secondary">Browse products</Button>
                </Link>
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            </div>
          ) : null}

          {!isError && !showNotFound ? (
            <>
              {showSkeleton ? <ProductDetailsSkeleton /> : null}

              {!showSkeleton ? (
                <div className="grid gap-6 lg:grid-cols-12 lg:items-start xl:gap-8">
                  {/* Gallery */}
                  <div className="lg:col-span-7">
                    <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm dark:border-zinc-800">
                      <div className="relative aspect-square bg-gray-100 dark:bg-zinc-900">
                        <img
                          src={resolvedActiveImage || images[0]}
                          alt={product?.title || "Product image"}
                          className="h-full w-full object-cover"
                          loading="eager"
                        />
                        {hasDiscount ? (
                          <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
                            -{discount}%
                          </div>
                        ) : null}
                      </div>

                      <div className="border-t border-gray-200 p-3 sm:p-4 dark:border-zinc-800">
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-3">
                          {images.map((img) => {
                            const active = img === resolvedActiveImage;
                            return (
                              <button
                                key={img}
                                type="button"
                                onClick={() => setActiveImage(img)}
                                className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border transition sm:h-20 sm:w-20 ${active
                                  ? "border-gray-900 ring-2 ring-gray-200 dark:border-white dark:ring-zinc-800"
                                  : "border-gray-200 hover:border-gray-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                                  }`}
                                aria-label="Select image"
                              >
                                <img
                                  src={img}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="lg:col-span-5 lg:sticky lg:top-24 lg:h-fit">
                    <div className="space-y-5 sm:space-y-6">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gray-900 px-3 py-1 text-xs font-semibold text-green-500 dark:border-emerald-900/40  dark:text-emerald-300">
                          <Sparkles className="h-4 w-4" />
                          Verified product
                        </div>

                        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                          {product?.title}
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed sm:text-[15px]">
                          {product?.description || "No description available."}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-gray-200 p-4 shadow-sm sm:p-5 dark:border-zinc-800">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold">Price</div>
                            <div className="mt-1 flex items-end gap-3">
                              <div className="text-2xl font-bold sm:text-3xl">
                                {moneyBDT(finalPrice)}
                              </div>
                              {hasDiscount ? (
                                <div className="pb-1 text-sm font-semibold line-through">
                                  {moneyBDT(price)}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <div className="text-xs font-semibold">Availability</div>
                            <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${stock > 0 ? "bg-emerald-500" : "bg-red-500"
                                  }`}
                              />
                              {stock > 0 ? `${stock} in stock` : "Out of stock"}
                            </div>
                          </div>
                        </div>

                        {/* Variant selectors (Size only) */}
                        <div className="mt-5 sm:mt-6">
                          <div className="text-xs font-semibold">Size</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {availableSizes.length ? (
                              availableSizes.map((s) => {
                                const active =
                                  String(resolvedSize || "").toLowerCase() ===
                                  String(s).toLowerCase();
                                const enabled = Boolean(
                                  sizeInStock.get(String(s).toLowerCase())
                                );

                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSize(s)}
                                    disabled={!enabled}
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase transition ${active
                                      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black"
                                      : "border-gray-200 hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                                      } ${!enabled ? "cursor-not-allowed opacity-50" : ""}`}
                                  >
                                    {active ? <Check className="h-4 w-4" /> : null}
                                    {s}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="text-sm font-semibold">—</div>
                            )}
                          </div>
                        </div>

                        {/* Quantity & actions */}
                        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center">
                          <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
                            <button
                              type="button"
                              onClick={() => setQty((q) => Math.max(1, q - 1))}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-zinc-900"
                              disabled={qty <= 1 || isAdding}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <input
                              value={String(qty)}
                              onChange={(e) => {
                                const n = Number(e.target.value);
                                if (!Number.isFinite(n)) return;
                                setQty(Math.max(1, Math.floor(n)));
                              }}
                              className="h-10 w-14 bg-transparent text-center text-sm font-semibold outline-none"
                              inputMode="numeric"
                            />

                            <button
                              type="button"
                              onClick={() => setQty((q) => q + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-zinc-900"
                              disabled={isAdding || (stock > 0 && qty >= stock)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <Button
                            variant="success"
                            fullWidth
                            loading={isAdding}
                            disabled={!canAdd}
                            onClick={onAddToCart}
                            leftIcon={<ShoppingCart size={18} />}
                            className="rounded-2xl cursor-pointer"
                          >
                            {stock > 0 ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        </div>

                        {selectedVariant?.sku ? (
                          <div className="mt-4 text-xs font-semibold">
                            Selected SKU:{" "}
                            <span className="font-bold">
                              {selectedVariant.sku}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}