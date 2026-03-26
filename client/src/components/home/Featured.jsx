import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetFeaturedProductsQuery } from "../../api/products/productsApi";

const AUTO_DELAY = 3500;
const GAP = 24;

const Featured = () => {
    const { data: response = [], isLoading, isError } = useGetFeaturedProductsQuery();
    const products = useMemo(() => (Array.isArray(response) ? response : []), [response]);

    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const tweenRef = useRef(null);
    const autoplayRef = useRef(null);
    const resizeRafRef = useRef(null);
    const currentIndexRef = useRef(0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // State to ensure exact container fitting mathematically without partial cards overflow
    const [cardWidth, setCardWidth] = useState(280);
    const [visibleCount, setVisibleCount] = useState(4);

    const shouldReduceMotion = useReducedMotion();

    const calculateWidth = useCallback(() => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;

        // Exact column sizing based on Tailwind's breakpoints to stay synced
        let cols = 1;
        if (window.innerWidth >= 1280) cols = 4; // xl
        else if (window.innerWidth >= 1024) cols = 3; // lg
        else if (window.innerWidth >= 640) cols = 2; // sm

        const exactCardWidth = (width - GAP * (cols - 1)) / cols;
        setCardWidth(exactCardWidth);
        setVisibleCount(cols);
    }, []);

    useLayoutEffect(() => {
        calculateWidth();
        window.addEventListener("resize", calculateWidth);
        return () => window.removeEventListener("resize", calculateWidth);
    }, [calculateWidth]);

    const syncIndex = useCallback((index) => {
        currentIndexRef.current = index;
        setCurrentIndex(index);
    }, []);

    const getCardWidth = useCallback(() => {
        return cardWidth + GAP;
    }, [cardWidth]);

    const getVisibleCardsCount = useCallback(() => {
        return visibleCount;
    }, [visibleCount]);

    const getMaxIndex = useCallback(() => {
        return Math.max(0, products.length - getVisibleCardsCount());
    }, [products.length, getVisibleCardsCount]);

    const animateToIndex = useCallback(
        (nextIndex, options = {}) => {
            const track = trackRef.current;
            if (!track) return;

            const { immediate = false } = options;
            const maxIndex = getMaxIndex();

            let safeIndex = nextIndex;
            if (safeIndex > maxIndex) safeIndex = 0;
            if (safeIndex < 0) safeIndex = maxIndex;

            const x = -(safeIndex * getCardWidth());

            syncIndex(safeIndex);

            if (tweenRef.current) {
                tweenRef.current.kill();
            }

            if (shouldReduceMotion || immediate) {
                gsap.set(track, { x });
                return;
            }

            tweenRef.current = gsap.to(track, {
                x,
                duration: 0.9,
                ease: "power3.out",
                overwrite: true,
            });
        },
        [getCardWidth, getMaxIndex, shouldReduceMotion, syncIndex]
    );

    const nextSlide = useCallback(() => {
        animateToIndex(currentIndexRef.current + 1);
    }, [animateToIndex]);

    const prevSlide = useCallback(() => {
        animateToIndex(currentIndexRef.current - 1);
    }, [animateToIndex]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    const startAutoplay = useCallback(() => {
        stopAutoplay();

        if (isPaused || products.length <= getVisibleCardsCount()) return;

        autoplayRef.current = setInterval(() => {
            nextSlide();
        }, AUTO_DELAY);
    }, [getVisibleCardsCount, isPaused, nextSlide, products.length, stopAutoplay]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(trackRef.current, { x: 0 });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        syncIndex(0);
        animateToIndex(0, { immediate: true });
    }, [products.length, animateToIndex, syncIndex]);

    useEffect(() => {
        startAutoplay();
        return stopAutoplay;
    }, [startAutoplay, stopAutoplay]);

    useEffect(() => {
        const handleResize = () => {
            if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);

            resizeRafRef.current = requestAnimationFrame(() => {
                const maxIndex = getMaxIndex();
                const clampedIndex = Math.min(currentIndexRef.current, maxIndex);
                animateToIndex(clampedIndex, { immediate: true });
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
        };
    }, [animateToIndex, getMaxIndex]);

    useEffect(() => {
        return () => {
            stopAutoplay();
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, [stopAutoplay]);

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);
    const handleTouchStart = () => setIsPaused(true);
    const handleTouchEnd = () => setIsPaused(false);

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
                                <div className="aspect-[4/5] animate-pulse bg-gray-100 dark:bg-zinc-900" />
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
                            Failed to load featured products. Please try again later.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const maxIndex = getMaxIndex();
    const canSlide = products.length > getVisibleCardsCount();

    return (
        <section className="w-full overflow-hidden py-14 md:py-20">
            <div className="container px-4 sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Featured Products
                        </h2>

                        <p className="mt-4 text-sm md:text-base lg:text-lg">
                            Discover our curated selection of premium products with quality and value in mind.
                        </p>
                    </motion.div>

                    {products.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-3"
                        >
                            <button
                                type="button"
                                onClick={prevSlide}
                                disabled={!canSlide}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black"
                                aria-label="Show previous products"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={nextSlide}
                                disabled={!canSlide}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-white dark:hover:text-black"
                                aria-label="Show next products"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No featured products available right now.
                    </div>
                ) : (
                    <>
                        <div
                            ref={containerRef}
                            className="relative overflow-hidden"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div
                                ref={trackRef}
                                className="flex w-max gap-6 px-1 py-4"
                                style={{ willChange: "transform" }}
                            >
                                {products.map((product) => {
                                    const id = product._id || product.id;
                                    const thumbnail =
                                        product.thumbnail ||
                                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=900&auto=format&fit=crop";
                                    const hasDiscount = Number(product.discountPercentage) > 0;
                                    const price = Number(product.price || 0);
                                    const discount = Number(product.discountPercentage || 0);
                                    const discountedPrice = hasDiscount
                                        ? price - (price * discount) / 100
                                        : price;

                                    return (
                                        <article
                                            key={id}
                                            className="group relative flex shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
                                            style={{ width: `${cardWidth}px` }}
                                        >
                                            <div className="relative aspect-4/5 overflow-hidden bg-gray-100 dark:bg-zinc-900">
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

                                                <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 translate-y-4">
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
                                })}
                            </div>
                        </div>

                        {canSlide && (
                            <div className="mt-6 flex items-center justify-end gap-4">
                                <></>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => animateToIndex(index)}
                                            aria-label={`Go to slide ${index + 1}`}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === index
                                                ? "w-8 bg-gray-500"
                                                : "w-2.5 bg-gray-300 hover:bg-gray-400"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default Featured;