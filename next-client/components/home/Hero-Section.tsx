"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuSquareArrowRight } from "react-icons/lu";

type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
};

type HeroSectionProps = {
  bannerContent?: Slide[];
};

const defaultSlides: Slide[] = [
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


export default function HeroSection({ bannerContent }: HeroSectionProps = {}) {
  const [index, setIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slides: Slide[] = bannerContent?.length ? bannerContent : defaultSlides;

  const delay = 6000;

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [index, delay, slides.length]);

  const prev = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  return (
    <section className="relative isolate h-screen w-full overflow-hidden bg-black">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1200 ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 1 : 0,
          }}
        >
          <div className="absolute inset-0 -z-10 h-full w-full">
            <NextImage
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover object-[75%_50%] transition-transform duration-6000 ease-out xl:object-center ${
                i === index ? "scale-105" : "scale-100"
              }`}
            />
          </div>

          <div className="absolute inset-0 z-0 bg-black/45" />

          <div className="relative z-20 flex h-full items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-xl space-y-4 text-white">
                <h1
                  className={`text-4xl font-bold leading-tight transition-all duration-700 ease-out md:text-6xl ${
                    i === index
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: i === index ? "300ms" : "0ms",
                    textShadow: "0 2px 14px rgba(0, 0, 0, 0.55)",
                  }}
                >
                  {slide.title}
                </h1>

                <p
                  className={`text-lg transition-all duration-700 ease-out ${
                    i === index
                      ? "translate-y-0 opacity-90"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: i === index ? "500ms" : "0ms",
                    textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {slide.subtitle}
                </p>

                <Link
                  href="/products"
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

      <div
        className={`pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-1000 ease-out ${
          isReady ? "opacity-0" : "opacity-100"
        }`}
      />

      <button
        onClick={prev}
        className="group absolute left-6 top-2/3 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black"
        aria-label="Previous slide"
        type="button"
      >
        <LuSquareArrowRight className="rotate-180 transition" size={22} />
      </button>

      <button
        onClick={next}
        className="group absolute right-6 top-2/3 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black"
        aria-label="Next slide"
        type="button"
      >
        <LuSquareArrowRight className="transition" size={22} />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              setIndex(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            type="button"
            className={`h-2 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
