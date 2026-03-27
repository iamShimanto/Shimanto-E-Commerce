import React, { useEffect, useState, useRef, useCallback } from "react";
import { ArrowRightSquare } from "lucide-react";
import { Link } from "react-router";

const slides = [
    {
        id: 1,
        image: "/1.webp",
        title: "Discover New Arrivals",
        subtitle: "Upgrade your wardrobe with the latest trends.",
    },
    {
        id: 2,
        image: "/2.webp",
        title: "Summer Sale Up To 50%",
        subtitle: "Limited time offers on selected items.",
    },
    {
        id: 3,
        image: "/3.webp",
        title: "Free Shipping Worldwide",
        subtitle: "Fast delivery and easy returns on all orders.",
    },
];

// Preload all banner images so there's zero flash on first render
if (typeof window !== "undefined") {
    slides.forEach((s) => {
        const img = new Image();
        img.src = s.image;
    });
}

export default function Banner() {
    const [index, setIndex] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const timeoutRef = useRef(null);

    const delay = 6000;

    // Mark component as ready after mount for entrance animation
    useEffect(() => {
        const id = requestAnimationFrame(() => setIsReady(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // Autoplay
    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, delay);

        return () => clearTimeout(timeoutRef.current);
    }, [index]);

    const prev = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setIndex((i) => (i - 1 + slides.length) % slides.length);
    }, []);

    const next = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setIndex((i) => (i + 1) % slides.length);
    }, []);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">

            {/* All slides stacked — only the active one is visible via opacity */}
            {slides.map((s, i) => (
                <div
                    key={s.id}
                    className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
                    style={{
                        opacity: i === index ? 1 : 0,
                        zIndex: i === index ? 1 : 0,
                    }}
                >
                    {/* Image with subtle ken-burns zoom on active slide */}
                    <img
                        src={s.image}
                        alt={s.title}
                        className={`absolute inset-0 h-full w-full object-cover object-[75%_50%] xl:object-center transition-transform duration-[6000ms] ease-out ${
                            i === index ? "scale-105" : "scale-100"
                        }`}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content — CSS-only staggered entrance */}
                    <div className="relative z-10 flex h-full items-center">
                        <div className="container mx-auto px-6">
                            <div className="max-w-xl space-y-4 text-white">
                                <h1
                                    className={`text-4xl font-bold leading-tight md:text-6xl transition-all duration-700 ease-out ${
                                        i === index
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-8 opacity-0"
                                    }`}
                                    style={{ transitionDelay: i === index ? "300ms" : "0ms" }}
                                >
                                    {s.title}
                                </h1>

                                <p
                                    className={`text-lg opacity-90 transition-all duration-700 ease-out ${
                                        i === index
                                            ? "translate-y-0 opacity-90"
                                            : "translate-y-8 opacity-0"
                                    }`}
                                    style={{ transitionDelay: i === index ? "500ms" : "0ms" }}
                                >
                                    {s.subtitle}
                                </p>

                                <Link
                                    to="/shop"
                                    className={`block w-fit rounded-lg bg-white px-6 py-3 font-semibold text-black transition-all duration-700 ease-out hover:bg-gray-200 ${
                                        i === index
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-8 opacity-0"
                                    }`}
                                    style={{ transitionDelay: i === index ? "700ms" : "0ms" }}
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Initial fade-in for entire banner */}
            <div
                className={`pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-1000 ease-out ${
                    isReady ? "opacity-0" : "opacity-100"
                }`}
            />

            {/* Left Arrow */}
            <button
                onClick={prev}
                className="group absolute left-6 top-2/3 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black"
            >
                <ArrowRightSquare className="rotate-180 transition" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={next}
                className="group absolute right-6 top-2/3 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black"
            >
                <ArrowRightSquare className="transition" />
            </button>

            {/* Slide indicators */}
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {slides.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => {
                            clearTimeout(timeoutRef.current);
                            setIndex(i);
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-2 rounded-full transition-all duration-500 ${
                            i === index
                                ? "w-8 bg-white"
                                : "w-2 bg-white/50 hover:bg-white/70"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}