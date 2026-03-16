"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { Moon, Sun, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

/* ─── tiny hook: close a floating panel when clicking outside ─── */
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Navbar = ({ categories }) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();

  const visibleCategories = categories?.slice(0, 5) ?? [];
  const moreCategories = categories?.slice(5) ?? [];
  const { isAuthenticated, user, logout } = useAuthStore();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  useClickOutside(profileRef, () => setProfileOpen(false));

  return (
    <header className="w-full bg-(--bg-primary) border-b border-(--border-light) sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="heading-3 text-(--text-primary) italic shrink-0"
        >
          NEWZONE
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex gap-6">
            {visibleCategories?.map((category) => (
              <li key={category?.id} className="relative group">
                
                <div className="flex items-center gap-1 cursor-pointer">
                  <Link className="link" href={`/${category?.slug}`}>
                    {category.name}
                  </Link>

                  {category?.children?.length > 0 && (
                    <IoIosArrowDown className="group-hover:rotate-180 duration-300" />
                  )}
                </div>

                {category?.children?.length > 0 && (
                  <ul className="min-w-52 w-auto absolute top-full left-0 bg-(--bg-tertiary) px-4 py-3 hidden group-hover:block rounded shadow-lg">
                    {category.children.map((child) => (
                      <li key={child?.id} className="py-2 border-b">
                        <Link className="link wrap-normal" href={`/${child?.slug}`}>
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            {moreCategories?.length > 0 && (
              <li className="relative group">
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="link">More</span>
                  <IoIosArrowDown className="group-hover:rotate-180 duration-300" />
                </div>

                <ul className="absolute top-full left-0 bg-(--bg-tertiary) px-4 py-3 hidden group-hover:block w-52 rounded shadow-lg">
                  {moreCategories.map((category) => (
                    <li key={category?.id} className="py-1">
                      <Link className="link" href={`/${category?.slug}`}>
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="relative flex items-center w-16 h-8 px-1 rounded-full bg-(--bg-tertiary) transition-colors duration-300 cursor-pointer"
          >
            <Moon className="w-4 h-4 text-(--text-secondary)" />
            <Sun className="w-4 h-4 ml-auto text-(--text-secondary)" />

            <span
              className={`absolute w-6 h-6 bg-(--bg-primary) rounded-full shadow-md transform transition-transform duration-300
              ${currentTheme === "dark" ? "translate-x-8" : "translate-x-0"}`}
            />
          </button>

          {/* Auth: authenticated state */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="Open profile menu"
                className="w-9 h-9 rounded-full bg-(--brand-primary) text-(--text-inverse) text-sm font-semibold flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {user?.name?.slice(0, 1).toUpperCase() ||
                  user?.email?.slice(0, 1).toUpperCase() ||
                  "U"}
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 w-48 bg-(--bg-tertiary) border border-(--border-light) rounded-lg shadow-(--shadow-lg) py-2 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-2 border-b border-(--border-light)">
                    <p className="text-sm font-semibold text-(--text-primary) truncate">
                      {user?.name || "Account"}
                    </p>
                    <p className="text-xs text-(--text-muted) truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm nav-link hover:bg-(--bg-light)"
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Auth: guest state — desktop only */
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="btn btn-outline"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/register")}
                className="btn btn-primary"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile hamburger — only on < lg */}
          <button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-(--bg-tertiary) transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-(--text-primary)" />
            ) : (
              <Menu className="w-5 h-5 text-(--text-primary)" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-(--bg-primary) border-t border-(--border-light) px-4 sm:px-6 pb-6">
          <ul className="flex flex-col mt-4 divide-y divide-(--border-light)">
            {categories?.map((category) => (
              <li key={category?.id}>
                <Link
                  href={`/${category?.slug}`}
                  className="block py-3 text-sm font-medium text-(--text-primary) hover:text-(--brand-primary) transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {category.name}
                </Link>

                {category?.children?.length > 0 && (
                  <ul className="mb-2">
                    {category.children.map((child) => (
                      <li key={child?.id}>
                        <Link
                          href={`/${child?.slug}`}
                          className="block pl-4 py-2 text-sm text-(--text-secondary) hover:text-(--brand-primary) transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile auth — only shown when guest */}
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => {
                  router.push("/login");
                  setMobileOpen(false);
                }}
                className="btn btn-outline w-full"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  router.push("/register");
                  setMobileOpen(false);
                }}
                className="btn btn-primary w-full"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
