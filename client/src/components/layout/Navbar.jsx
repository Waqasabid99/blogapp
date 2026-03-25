"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { Moon, Sun, Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Image from "next/image";

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
  const [imageError, setImageError] = useState(false);
  const profileRef = useRef(null);
  const router = useRouter();
  const isDashboardPage = usePathname().startsWith("/dashboard");

  const visibleCategories = categories?.slice(0, 5) ?? [];
  const moreCategories = categories?.slice(5) ?? [];
  const { isAuthenticated, user, logout, avatar } = useAuthStore();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  useClickOutside(profileRef, () => setProfileOpen(false));

  // Get initials from name or email
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // Get display name
  const getDisplayName = () => {
    return user?.name || user?.email?.split("@")[0] || "Account";
  };

  // Avatar component with image fallback
  const Avatar = ({ size = "md", showBorder = false }) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-9 h-9 text-sm",
      lg: "w-10 h-10 text-base",
    };

    const hasValidAvatar = avatar || user?.avatarUrl && !imageError;

    return (
      <div
        className={`relative rounded-full overflow-hidden flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200
          ${sizeClasses[size]}
          ${showBorder ? "ring-2 ring-(--brand-primary) ring-offset-2 ring-offset-(--bg-primary)" : ""}
          ${hasValidAvatar ? "" : "bg-linear-to-br from-(--brand-primary) to-(--brand-secondary) text-(--text-inverse)"}
          hover:opacity-90 hover:scale-105 active:scale-95`}
      >
        {hasValidAvatar ? (
          <Image
            src={avatar}
            alt={getDisplayName()}
            fill
            sizes="(max-width: 768px) 32px, 36px"
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <span className="font-semibold select-none">{getInitials()}</span>
        )}
      </div>
    );
  };

  return (
    <header className="w-full bg-(--bg-primary) border-b border-(--border-light) sticky top-0 z-50">
      <div className={`max-w-full mx-auto flex items-center justify-between px-4 sm:px-6 py-3 transition-all ease-in-out duration-500`}>
        {/* Logo */}
        <Link
          href="/"
          className="heading-3 text-(--text-primary) italic shrink-0"
        >
          NEWZONE
        </Link>

        {/* Desktop Navigation */}
        {isDashboardPage ? null : (
          <nav className="hidden lg:block">
            <ul className="flex gap-6">
              {visibleCategories?.map((category) => (
                <li key={category?.id} className="relative group">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <Link className="link" href={`/blog/${category?.slug}`}>
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
                          <Link className="link wrap-normal" href={`/blog/${child?.slug}`}>
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
                        <Link className="link" href={`/blog/${category?.slug}`}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </nav>
        )}

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
                aria-expanded={profileOpen}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-(--bg-tertiary) transition-colors"
              >
                <Avatar size="md" showBorder={profileOpen} />
                <span className="hidden sm:block text-sm font-medium text-(--text-primary) max-w-25 truncate">
                  {getDisplayName()}
                </span>
                <IoIosArrowDown
                  className={`w-4 h-4 text-(--text-secondary) transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-(--bg-tertiary) border border-(--border-light) rounded shadow-(--shadow-lg) py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info with avatar */}
                  <div className="px-4 py-3 border-b border-(--border-light)">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--text-primary) truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-(--text-muted) truncate">
                          {user?.email}
                        </p>
                        {user?.role && (
                          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-(--brand-primary)/10 text-(--brand-primary)">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {isAuthenticated && user?.role === "user" ? (
                    null
                  ) : (
                    <div className="py-1">
                      <Link
                        href={user?.role === "guest_writer" ? `/dashboard/${user?.role}/${user?.id}/posts` : `/dashboard/${user?.role}/${user?.id}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-(--text-primary) hover:bg-(--bg-light) transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-(--text-secondary)" />
                        Dashboard
                      </Link>
                    </div>
                  )}

                  <div className="border-t border-(--border-light) py-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
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
          {/* Mobile User Section (when authenticated) */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 py-4 border-b border-(--border-light)">
              <Avatar size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-(--text-primary) truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-(--text-muted) truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          <ul className="flex flex-col mt-4 divide-y divide-(--border-light)">
            {categories?.map((category) => (
              <li key={category?.id}>
                <Link
                  href={`/blog/${category?.slug}`}
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
                          href={`/blog/${child?.slug}`}
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

          {/* Mobile auth buttons */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 mt-5">
              <Link
                href={`/dashboard/${user?.role}/${user?.id}`}
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline w-full flex items-center justify-center gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          ) : (
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