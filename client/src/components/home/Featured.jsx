import React, { useMemo, useRef } from "react";
import { Link } from "react-router";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetFeaturedProductsQuery } from "../../api/products/productsApi";

const Featured = () => {
    const {
        data: response = [],
        isLoading,
        isError,
    } = useGetFeaturedProductsQuery();

    const products = useMemo(
        () => (Array.isArray(response) ? response : []),
        [response]
    );

    const splideRef = useRef(null);

    const splideOptions = {
        type: "loop",
        perPage: 4,
        gap: "1.5rem",
        autoplay: true,
        interval: 3500,
        pauseOnHover: true,
        pauseOnFocus: true,
        pagination: true,
        arrows: false,
        drag: true,
        speed: 800,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        lazyLoad: "nearby",
        breakpoints: {
            1279: { perPage: 3 },
            1023: { perPage: 2 },
            639: { perPage: 1, gap: "1rem" },
        },
    };

    if (isLoading) {
        return (
            <section className="w-full overflow-hidden py-14 md:py-20">
                <div className="container px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center md:mb-14">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Featured Products
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 md:text-base dark:text-gray-300">
                            Loading our best products...
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
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
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="w-full py-14 md:py-20">
                <div className="container px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
                        <h2 className="text-3xl font-bold tracking-tight text-red-600 md:text-4xl dark:text-red-400">
                            Oops!
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-sm text-red-700 md:text-base dark:text-red-300">
                            Failed to load featured products. Please try again
                            later.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="featured-section w-full overflow-hidden py-14 md:py-20">
            <div className="container px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Featured Products
                        </h2>

                        <p className="mt-4 text-sm md:text-base lg:text-lg">
                            Discover our curated selection of premium products
                            with quality and value in mind.
                        </p>
                    </div>

                    {products.length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => splideRef.current?.go("<")}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black"
                                aria-label="Show previous products"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => splideRef.current?.go(">")}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black"
                                aria-label="Show next products"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No featured products available right now.
                    </div>
                ) : (
                    <Splide
                        ref={splideRef}
                        options={splideOptions}
                        aria-label="Featured Products"
                    >
                        {products.map((product) => {
                            const id = product._id || product.id;
                            const thumbnail =
                                product.thumbnail ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop";
                            const hasDiscount =
                                Number(product.discountPercentage) > 0;
                            const price = Number(product.price || 0);
                            const discount = Number(
                                product.discountPercentage || 0
                            );
                            const discountedPrice = hasDiscount
                                ? price - (price * discount) / 100
                                : price;

                            return (
                                <SplideSlide key={id}>
                                    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
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

                                            <div className="absolute inset-x-0 bottom-4 flex translate-y-4 justify-center px-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                                <Link
                                                    to={`/product/${product.slug}`}
                                                    className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col p-5">
                                            <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white">
                                                <Link
                                                    to={`/product/${product.slug}`}
                                                    className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    {product.title}
                                                </Link>
                                            </h3>

                                            <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                                                Premium Collection
                                            </p>

                                            <div className="mt-auto flex items-end gap-2 pt-5">
                                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                                    ৳{" "}
                                                    {discountedPrice.toFixed(2)}
                                                </span>

                                                {hasDiscount && (
                                                    <span className="text-sm font-medium text-gray-400 line-through dark:text-gray-500">
                                                        ৳ {price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </SplideSlide>
                            );
                        })}
                    </Splide>
                )}
            </div>
        </section>
    );
};

export default Featured;