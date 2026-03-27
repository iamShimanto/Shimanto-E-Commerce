import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, PackageOpen } from "lucide-react";
import { useGetAllProductsQuery } from "../api/products/productsApi";
import { useGetCategoriesQuery } from "../api/category/categoryApi";
import SEO from "../components/seo/SEO";

const PRODUCTS_PER_PAGE = 12;

/* ─── debounce helper ─── */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ═══════════════════════════════════════════════════ */
/*                  PRODUCTS  PAGE                     */
/* ═══════════════════════════════════════════════════ */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── state from URL ── */
  const categoryFromUrl = searchParams.get("category") || "";
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const debouncedSearch = useDebounce(searchInput);

  /* ── keep URL in sync ── */
  const updateParams = useCallback(
    (overrides = {}) => {
      const next = {
        category: overrides.category ?? activeCategory,
        search: overrides.search ?? debouncedSearch,
        page: String(overrides.page ?? currentPage),
      };
      const params = new URLSearchParams();
      if (next.category) params.set("category", next.category);
      if (next.search) params.set("search", next.search);
      if (next.page && next.page !== "1") params.set("page", next.page);
      setSearchParams(params, { replace: true });
    },
    [activeCategory, debouncedSearch, currentPage, setSearchParams]
  );

  /* reset to page 1 on search / category change */
  useEffect(() => {
    setCurrentPage(1);
    updateParams({ search: debouncedSearch, category: activeCategory, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeCategory]);

  useEffect(() => {
    updateParams({ page: currentPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* sync URL → state on first load */
  useEffect(() => {
    if (categoryFromUrl) setActiveCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  /* ── API queries ── */
  const { data: categoriesRaw = [], isLoading: catLoading } =
    useGetCategoriesQuery();

  const categories = useMemo(
    () => (Array.isArray(categoriesRaw) ? categoriesRaw : []),
    [categoriesRaw]
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useGetAllProductsQuery({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    search: debouncedSearch || undefined,
    category: activeCategory || undefined,
  });

  const products = response?.products ?? [];
  const pagination = response?.pagination ?? {
    total: 0,
    page: 1,
    limit: PRODUCTS_PER_PAGE,
    totalPages: 1,
  };

  /* ── helpers ── */
  const handleCategoryClick = (slug) => {
    setActiveCategory(slug === activeCategory ? "" : slug);
  };

  const clearFilters = () => {
    setSearchInput("");
    setActiveCategory("");
    setCurrentPage(1);
  };

  const hasFilters = debouncedSearch || activeCategory;

  /* ═══════════════════════════════════════════════════ */
  /*                      RENDER                        */
  /* ═══════════════════════════════════════════════════ */
  return (
    <>
      <SEO
        title="Products"
        description="Browse our premium collection of products. Filter by category, search by name, and find exactly what you need."
        keywords="products, shop, e-commerce, fashion, clothing"
        url="/products"
      />

      <section className="min-h-screen w-full pb-20 pt-10 md:pt-14">
        <div className="container px-4 sm:px-6 lg:px-8">
          {/* ── Page Header ── */}
          <div className="mb-10 md:mb-14">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              All Products
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base dark:text-gray-400">
              Discover our curated collection — filter by category or search to
              find your perfect style.
            </p>
          </div>

          {/* ── Filters Bar ── */}
          <div className="mb-8 space-y-5">
            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                id="product-search"
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category chips */}
            {!catLoading && categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5">
                <SlidersHorizontal className="mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <button
                  type="button"
                  onClick={() => setActiveCategory("")}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                    !activeCategory
                      ? "border-gray-900 bg-gray-900 text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => {
                  const slug = cat.slug;
                  const isActive = activeCategory === slug;
                  return (
                    <button
                      key={cat._id || cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(slug)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                        isActive
                          ? "border-gray-900 bg-gray-900 text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-2 flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Results count ── */}
          {!isLoading && !isError && (
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {products.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.total}
              </span>{" "}
              products
              {activeCategory && (
                <> in <span className="font-semibold text-gray-900 dark:text-white capitalize">{activeCategory.replace(/-/g, " ")}</span></>
              )}
              {debouncedSearch && (
                <> for "<span className="font-semibold text-gray-900 dark:text-white">{debouncedSearch}</span>"</>
              )}
            </p>
          )}

          {/* ── Loading State ── */}
          {isLoading && <ProductGridSkeleton />}

          {/* ── Error State ── */}
          {isError && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900/50 dark:bg-red-950/30">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
                Oops! Something went wrong
              </h2>
              <p className="mt-2 max-w-md text-sm text-red-700 dark:text-red-300">
                We couldn&apos;t load the products. Please try again later.
              </p>
            </div>
          )}

          {/* ── Empty State ── */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 px-6 py-20 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <PackageOpen className="mb-4 h-16 w-16 text-gray-300 dark:text-zinc-700" />
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                No products found
              </h2>
              <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                {hasFilters
                  ? "Try adjusting your filters or search query."
                  : "Products will appear here once they are added."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* ── Product Grid ── */}
          {!isLoading && !isError && products.length > 0 && (
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity duration-300 ${
                isFetching ? "pointer-events-none opacity-50" : "opacity-100"
              }`}
            >
              {products.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!isLoading && !isError && pagination.totalPages > 1 && (
            <Pagination
              current={pagination.page}
              total={pagination.totalPages}
              onChange={setCurrentPage}
            />
          )}
        </div>
      </section>
    </>
  );
};

/* ═══════════════════════════════════════════════════ */
/*                  PRODUCT CARD                       */
/* ═══════════════════════════════════════════════════ */
const ProductCard = ({ product }) => {
  const thumbnail =
    product.thumbnail ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop";
  const hasDiscount = Number(product.discountPercentage) > 0;
  const price = Number(product.price || 0);
  const discount = Number(product.discountPercentage || 0);
  const discountedPrice = hasDiscount ? price - (price * discount) / 100 : price;
  const categoryName = product.category?.name || "";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-zinc-900">
        <img
          src={thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent opacity-70" />

        {hasDiscount && (
          <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-sm">
            -{discount}%
          </div>
        )}

        {categoryName && (
          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm backdrop-blur-sm dark:bg-black/70 dark:text-gray-200">
            {categoryName}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-4 flex translate-y-4 justify-center px-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
          <Link
            to={`/products/${product.slug}`}
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            {product.title}
          </Link>
        </h3>

        {categoryName && (
          <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
            {categoryName}
          </p>
        )}

        <div className="mt-auto flex items-end gap-2 pt-5">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ৳ {discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-medium text-gray-400 line-through dark:text-gray-500">
              ৳ {price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

/* ═══════════════════════════════════════════════════ */
/*                   PAGINATION                        */
/* ═══════════════════════════════════════════════════ */
const Pagination = ({ current, total, onChange }) => {
  const pages = useMemo(() => {
    const result = [];
    const delta = 2;
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    result.push(1);
    if (left > 2) result.push("...");
    for (let i = left; i <= right; i++) result.push(i);
    if (right < total - 1) result.push("...");
    if (total > 1) result.push(total);

    return result;
  }, [current, total]);

  const btnBase =
    "flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-300";
  const btnNormal =
    "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900";
  const btnActive =
    "border-gray-900 bg-gray-900 text-white shadow-md dark:border-white dark:bg-white dark:text-black";
  const btnDisabled = "pointer-events-none opacity-40";

  return (
    <nav
      aria-label="Products pagination"
      className="mt-12 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        className={`${btnBase} px-3 ${current <= 1 ? btnDisabled : btnNormal}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="flex h-10 w-8 items-center justify-center text-gray-400 dark:text-gray-500"
          >
            ···
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`${btnBase} ${p === current ? btnActive : btnNormal}`}
            aria-current={p === current ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current >= total}
        className={`${btnBase} px-3 ${current >= total ? btnDisabled : btnNormal}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════ */
/*                 SKELETON LOADER                     */
/* ═══════════════════════════════════════════════════ */
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="aspect-4/5 animate-pulse bg-gray-100 dark:bg-zinc-900" />
        <div className="space-y-3 p-5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-zinc-900" />
        </div>
      </div>
    ))}
  </div>
);

export default Products;