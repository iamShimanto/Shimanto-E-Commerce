import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightSquare } from "lucide-react";
import { Link } from "react-router";
import { gsap } from "gsap";

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

export default function Banner() {
    const [index, setIndex] = useState(0);
    const timeoutRef = useRef(null);
    const textRef = useRef(null);

    const delay = 6000;

    // autoplay slider
    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, delay);

        return () => clearTimeout(timeoutRef.current);
    }, [index]);

    // GSAP text reveal animation
    useEffect(() => {
        const el = textRef.current;

        if (el) {
            gsap.fromTo(
                el.children,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                }
            );
        }
    }, [index]);

    const prev = () => {
        clearTimeout(timeoutRef.current);
        setIndex((i) => (i - 1 + slides.length) % slides.length);
    };

    const next = () => {
        clearTimeout(timeoutRef.current);
        setIndex((i) => (i + 1) % slides.length);
    };

    return (
        <section className="relative h-screen w-full overflow-hidden">

            <AnimatePresence mode="wait">
                {slides.map((s, i) =>
                    i === index ? (
                        <motion.div
                            key={s.id}
                            className="absolute inset-0"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Image */}
                            <img
                                src={s.image}
                                alt={s.title}
                                className="absolute inset-0 h-full w-full object-cover object-[75%_50%] xl:object-center"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40" />

                            {/* Content */}
                            <div className="relative z-10 flex h-full items-center">
                                <div className="container mx-auto px-6">

                                    <div
                                        ref={textRef}
                                        className="max-w-xl text-white space-y-4"
                                    >
                                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                            {s.title}
                                        </h1>

                                        <p className="text-lg opacity-90">
                                            {s.subtitle}
                                        </p>

                                        <Link
                                            to="/shop"
                                            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition block w-fit"
                                        >
                                            Shop Now
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    ) : null
                )}
            </AnimatePresence>

            {/* Left Arrow */}
            <button
                onClick={prev}
                className="group absolute left-6 top-2/3 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
            >
                <ArrowRightSquare className="rotate-180 transition" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={next}
                className="group absolute right-6 top-2/3 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
            >
                <ArrowRightSquare className="transition" />
            </button>

        </section>
    );
}