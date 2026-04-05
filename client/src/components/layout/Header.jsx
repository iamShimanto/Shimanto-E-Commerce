import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Store,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { useGetCategoriesQuery } from "../../api/category/categoryApi";
import { authApi, useLogoutMutation, useProfileQuery } from "../../api/auth/authApi";
import { useGetCartQuery } from "../../api/cart/cartApi";
import { useNavigate } from "react-router";
import { useToast } from "../../hooks/useToast";
import { useDispatch } from "react-redux"
import { useTheme } from "../../hooks/useTheme";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCategoryOpen, setDesktopCategoryOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const categoryRef = useRef(null);
  const profileMenuRef = useRef(null);

  const { isDark, toggle } = useTheme();

  const { data: apiCategories = [] } = useGetCategoriesQuery();
  const categoriesToShow =
    Array.isArray(apiCategories) && apiCategories.length > 0
      ? apiCategories.map((c) => ({
        label: c.name,
        href: `/products?category=${c.slug}`,
      }))
      : [];

  const { data: profileData, isLoading: profileLoading } = useProfileQuery();
  const [triggerLogout, { isLoading: logoutLoading }] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { push } = useToast()

  const [headerSearch, setHeaderSearch] = useState("");
  const user = profileData?.data || profileData?.user || null;
  const isLoggedIn = !!user && !profileLoading;

  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isLoggedIn,
  });
  const cartCount = Number(cartData?.totalItems || 0);

  const handleHeaderSearch = (event) => {
    event.preventDefault();
    const query = headerSearch.trim();
    if (query.length > 0) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
    setMobileOpen(false); // close mobile drawer if open
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setDesktopCategoryOpen(false);
      }

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setDesktopCategoryOpen(false);
        setMobileCategoryOpen(false);
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
    setMobileCategoryOpen(false);
  };

  const handleLogout = async () => {
    try {
      await triggerLogout().unwrap()
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.error ||
        (typeof error === "string" ? error : null) ||
        "Logout failed"
      push({
        title: "Logout Error",
        message: message,
        variant: "error"
      })
    } finally {
      dispatch(authApi.util.resetApiState())
      navigate("/", { replace: true })
      push({
        title: "Logged out",
        message: "You have been successfully logged out.",
        variant: "success"
      })
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 text-white bg-zinc-950 backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800/80">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300">
              <Store size={18} />
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">
                Shimanto Store
              </p>
              <p className="text-xs">
                E-commerce
              </p>
            </div>
          </Link>

          {/* Middle: Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300"
            >
              Products
            </Link>

            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setDesktopCategoryOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300"
                aria-expanded={desktopCategoryOpen}
                aria-haspopup="menu"
              >
                Categories
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${desktopCategoryOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`absolute left-0 top-[calc(100%+10px)] w-60 origin-top rounded-2xl bg-black border border-zinc-200 p-2 shadow-xl transition-all duration-300 dark:border-zinc-800 ${desktopCategoryOpen
                  ? "pointer-events-auto visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible -translate-y-2 opacity-0"
                  }`}
              >
                {categoriesToShow.length > 0 ? (
                  categoriesToShow.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block rounded-xl px-4 py-2.5 text-sm transition-all duration-300"
                      onClick={() => setDesktopCategoryOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-2.5 text-sm">
                    No categories found
                  </p>
                )}
              </div>
            </div>

            {navLinks.slice(2).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <form className="relative" onSubmit={handleHeaderSearch}>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-64 rounded-xl border border-zinc-200 pl-9 pr-10 text-sm outline-none transition-all duration-300 focus:border-zinc-400"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-white cursor-pointer"
                aria-label="Search"
              >
                Search
              </button>
            </form>

            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition-all duration-300 hover:-translate-y-0.5"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition-all duration-300 hover:-translate-y-0.5"
                  aria-label="Profile menu"
                  aria-expanded={profileMenuOpen}
                >
                  <User size={18} />
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right rounded-2xl border bg-black border-zinc-200 p-2 shadow-xl transition-all duration-300 dark:border-zinc-800 ${profileMenuOpen
                    ? "pointer-events-auto visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-2 opacity-0"
                    }`}
                >
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={16} />
                    {logoutLoading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all duration-300"
              >
                Login
              </Link>
            )}

            <ThemeToggle isDark={isDark} onToggle={toggle} />

          </div>

          {/* Mobile Right */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition-all duration-300"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                  {cartCount}
                </span>
              ) : null}
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
        className={`fixed inset-0 z-40 backdrop-blur-[2px] transition-all duration-300 lg:hidden ${mobileOpen
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0"
          }`}
        onClick={closeMobileDrawer}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[88%] max-w-sm flex-col border-l border-zinc-200 bg-black text-white shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 lg:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl">
              <Store size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold">
                Shimanto Store
              </p>
              <p className="text-xs">Menu</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileDrawer}
            aria-label="Close menu"
          >
            <X size={18} className="text-white" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <form className="relative mb-5" onSubmit={handleHeaderSearch}>
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 pl-9 pr-20 text-sm outline-none transition-all duration-300 focus:border-zinc-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
              aria-label="Search"
            >
              Search
            </button>
          </form>

          <nav className="space-y-2">
            <Link
              to="/"
              className="block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300"
              onClick={closeMobileDrawer}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300"
              onClick={closeMobileDrawer}
            >
              Products
            </Link>

            <div className="rounded-2xl border border-zinc-200 p-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setMobileCategoryOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium transition-all duration-300"
              >
                <span>Categories</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${mobileCategoryOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${mobileCategoryOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-2 space-y-1">
                    {categoriesToShow.length > 0 ? (
                      categoriesToShow.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="block rounded-xl px-3 py-2 text-sm transition-all duration-300"
                          onClick={closeMobileDrawer}
                        >
                          {item.label}
                        </Link>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm">
                        No categories found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/about"
              className="block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300"
              onClick={closeMobileDrawer}
            >
              About
            </Link>

            <Link
              to="/contact"
              className="block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300"
              onClick={closeMobileDrawer}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {isLoggedIn ? (
              <Link
                to="/profile"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium transition-all duration-300"
                onClick={closeMobileDrawer}
              >
                <User size={16} />
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium transition-all duration-300"
                onClick={closeMobileDrawer}
              >
                Login
              </Link>
            )}

            <ThemeToggle isDark={isDark} onToggle={toggle} />

          </div>

          {isLoggedIn && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={16} />
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}