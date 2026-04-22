"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
  FiHome,
} from "react-icons/fi";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils/cn";
import { useAppDispatch } from "@/store/hooks";
import {
  authApi,
  useGetProfileQuery,
  useLogoutMutation,
} from "@/services/auth.service";

const navLinks = [
  { label: "Home", href: "/", icon: FiHome },
  { label: "Products", href: "/products", icon: FiShoppingBag },
  { label: "Search", href: "/search", icon: FiSearch },
  { label: "Account", href: "/account/profile", icon: FiUser },
];

function LinkItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
        active
          ? "bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function StoreHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopBrowseOpen, setDesktopBrowseOpen] = useState(false);
  const [mobileBrowseOpen, setMobileBrowseOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

  const browseRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const user = profileData?.data ?? null;
  const isLoggedIn = Boolean(user) && !profileLoading;
  const displayName =
    user?.fullName ?? user?.name ?? user?.email?.split("@")[0] ?? "Account";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        browseRef.current &&
        !browseRef.current.contains(event.target as Node)
      ) {
        setDesktopBrowseOpen(false);
      }

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDesktopBrowseOpen(false);
        setMobileBrowseOpen(false);
        setProfileMenuOpen(false);
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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileDrawer = () => {
    setMobileOpen(false);
    setMobileBrowseOpen(false);
  };

  const handleHeaderSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = headerSearch.trim();

    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    closeMobileDrawer();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out", "You have been successfully logged out.");
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : typeof error === "object" && error !== null && "data" in error
            ? ((error as { data?: { message?: string; error?: string } }).data
                ?.message ??
              (error as { data?: { message?: string; error?: string } }).data
                ?.error ??
              "Logout failed")
            : "Logout failed";

      toast.error("Logout failed", message);
    } finally {
      dispatch(authApi.util.resetApiState());
      closeMobileDrawer();
      setProfileMenuOpen(false);
      router.push("/");
    }
  };

  const quickLinks = [
    { label: "All products", href: "/products", icon: FiShoppingBag },
    { label: "Search products", href: "/search", icon: FiSearch },
    { label: "My account", href: "/account/profile", icon: FiUser },
    { label: "Cart", href: "/cart", icon: FiShoppingBag },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white text-slate-950 backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-white">
        <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white transition-colors duration-300 dark:bg-white/10 dark:text-white">
              <FiShoppingBag className="h-4.5 w-4.5" />
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-slate-950 dark:text-white">
                Shimanto Store
              </p>
              <p className="text-xs text-slate-500 dark:text-white/60">
                E-commerce
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <LinkItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              />
            ))}

            <div className="relative" ref={browseRef}>
              <button
                type="button"
                onClick={() => setDesktopBrowseOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                aria-expanded={desktopBrowseOpen}
                aria-haspopup="menu"
              >
                Explore
                <FiChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    desktopBrowseOpen ? "rotate-180" : "",
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute left-0 top-[calc(100%+10px)] w-60 origin-top rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl transition-all duration-300 dark:border-zinc-800 dark:bg-black",
                  desktopBrowseOpen
                    ? "pointer-events-auto visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-2 opacity-0",
                )}
              >
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                    onClick={() => setDesktopBrowseOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <form className="relative" onSubmit={handleHeaderSearch}>
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/50" />
              <input
                type="text"
                value={headerSearch}
                onChange={(event) => setHeaderSearch(event.target.value)}
                placeholder="Search products..."
                className="h-10 w-64 rounded-xl border border-zinc-200 bg-white pl-9 pr-10 text-sm text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:bg-white/10"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
                aria-label="Search"
              >
                Search
              </button>
            </form>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              aria-label="Cart"
            >
              <FiShoppingBag className="h-4.5 w-4.5" />
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  aria-label="Profile menu"
                  aria-expanded={profileMenuOpen}
                >
                  <FiUser className="h-4.5 w-4.5" />
                  <span className="max-w-24 truncate">{displayName}</span>
                  <FiChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      profileMenuOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl transition-all duration-300 dark:border-zinc-800 dark:bg-black",
                    profileMenuOpen
                      ? "pointer-events-auto visible translate-y-0 opacity-100"
                      : "pointer-events-none invisible -translate-y-2 opacity-0",
                  )}
                >
                  <Link
                    href="/account/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <FiUser className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Login
              </Link>
            )}

            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              aria-label="Cart"
            >
              <FiShoppingBag className="h-4.5 w-4.5" />
            </Link>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 backdrop-blur-[2px] transition-all duration-300 lg:hidden",
          mobileOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        )}
        onClick={closeMobileDrawer}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-[88%] max-w-sm flex-col border-l border-zinc-200 bg-white text-slate-950 shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-black dark:text-white lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white/10">
              <FiShoppingBag className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Shimanto Store
              </p>
              <p className="text-xs text-slate-500 dark:text-white/60">Menu</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileDrawer}
            aria-label="Close menu"
          >
            <FiX className="h-4.5 w-4.5 text-slate-950 dark:text-white" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <form className="relative mb-5" onSubmit={handleHeaderSearch}>
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/50" />
            <input
              type="text"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-20 text-sm text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-zinc-800 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/20 dark:focus:bg-white/10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              aria-label="Search"
            >
              Search
            </button>
          </form>

          <nav className="space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white",
                )}
                onClick={closeMobileDrawer}
              >
                <span className="inline-flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <FiArrowRight className="h-4 w-4 text-white/40" />
              </Link>
            ))}

            <div className="rounded-2xl border border-zinc-200 p-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setMobileBrowseOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <span>Explore</span>
                <FiChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    mobileBrowseOpen ? "rotate-180" : "",
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300",
                  mobileBrowseOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 space-y-1">
                    {quickLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                        onClick={closeMobileDrawer}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {isLoggedIn ? (
              <Link
                href="/account/profile"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:border-zinc-800 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={closeMobileDrawer}
              >
                <FiUser className="h-4 w-4" />
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:border-zinc-800 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={closeMobileDrawer}
              >
                Login
              </Link>
            )}

            <ThemeToggle />
          </div>

          {isLoggedIn && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950 dark:border-zinc-800 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
