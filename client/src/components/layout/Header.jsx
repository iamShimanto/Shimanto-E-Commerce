import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Store,
} from "lucide-react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { useTheme } from "../../hooks/useTheme";
import { Link } from "react-router";
import { useGetCategoriesQuery } from "../../api/category/categoryApi";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const { isDark, toggle } = useTheme();

  const { data: apiCategories = [] } = useGetCategoriesQuery();
  const categoriesToShow = (apiCategories && apiCategories.length > 0)
    ? apiCategories.map((c) => ({ label: c.name, href: `/categories/${c.slug}` }))
    : [];



  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 container items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors duration-300 dark:bg-white dark:text-zinc-900">
              <Store size={18} />
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">
                Shimanto Store
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                E-commerce
              </p>
            </div>
          </Link>

          {/* Middle: Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              Home
            </Link>

            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                aria-expanded={categoryOpen}
                aria-haspopup="menu"
              >
                Categories
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${categoryOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`absolute left-0 top-[calc(100%+10px)] w-60 origin-top rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 ${categoryOpen
                  ? "pointer-events-auto visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible -translate-y-2 opacity-0"
                  }`}
              >
                {categoriesToShow.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="block rounded-xl px-4 py-2.5 text-sm text-zinc-700 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                    onClick={() => setCategoryOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {navLinks.slice(1).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <form className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                className="h-10 w-64 rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:bg-zinc-950"
              />
            </form>

            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                2
              </span>
            </Link>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              aria-label="Profile"
            >
              <User size={18} />
            </Link>

            <ThemeToggle isDark={isDark} onToggle={toggle} />
          </div>

          {/* Mobile Right */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-all duration-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                2
              </span>
            </Link>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all duration-300 lg:hidden ${mobileOpen
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0"
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[88%] max-w-sm flex-col border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Store size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Shimanto Store
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Menu
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Mobile Search */}
          <form className="relative mb-5">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 outline-none transition-all duration-300 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:bg-zinc-950"
            />
          </form>

          {/* Mobile Nav */}
          <nav className="space-y-2">
            <Link
              to="/"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>

            <div className="rounded-2xl border border-zinc-200 p-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <span>Categories</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${categoryOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${categoryOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 space-y-1">
                    {categoriesToShow.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block rounded-xl px-3 py-2 text-sm text-zinc-600 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>

            <Link
              to="/contact"
              className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              <User size={16} />
              Profile
            </Link>

            <ThemeToggle isDark={isDark} onToggle={toggle} />
          </div>
        </div>
      </aside>
    </>
  );
}