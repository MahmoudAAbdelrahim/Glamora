"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Moon,
  Sun,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../../components/providers/AuthProvider";

type Locale = "ar" | "en";

interface NavbarProps {
  locale: Locale;
  cartCount?: number;
  wishCount?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

const CSS = `
.gl-nav{
  --bg:rgba(255,255,255,.97);
  --panel:#fff;
  --bd:#f0dfe3;
  --ink:#2a1a1f;
  --link:#8b1538;
  --dim:rgba(42,26,31,.72);
  --hov:#fbe4e8;
  --acc:#8b1538;
  --acc-d:#6e0f2c;
  --out:#8b1538;
  --lb:#f0dfe3;
  --p1:#8b1538;
  --p2:#d6506f;
  --p3:#f4b6c2;

  position:sticky;
  top:0;
  z-index:1000;
  width:100%;
  background:var(--bg);
  border-bottom:1px solid var(--bd);
  -webkit-backdrop-filter:blur(14px);
  backdrop-filter:blur(14px);
}

.gl-nav[data-theme="dark"]{
  --bg:rgba(8,9,15,.97);
  --panel:#0b0d14;
  --bd:#2b2026;
  --ink:#f7edf0;
  --link:#f4b6c2;
  --dim:rgba(247,237,240,.72);
  --hov:#211522;
  --acc:#8b1538;
  --acc-d:#6e0f2c;
  --out:#d6506f;
  --lb:#39242d;
  --p1:#f4b6c2;
  --p2:#d6506f;
  --p3:#a8294d;
}

.gl-nav .gl-bar{
  display:flex;
  align-items:center;
  width:100%;
  min-height:76px;
  padding:12px clamp(18px,5vw,72px);
}

/* LOGO */

.gl-nav .gl-logo{
  display:inline-flex;
  align-items:center;
  gap:9px;
  flex-shrink:0;
  text-decoration:none;
}

.gl-nav .gl-logo span{
  font-family:Georgia,"Times New Roman",serif;
  font-size:1.62rem;
  font-weight:700;
  letter-spacing:.5px;
  color:var(--link);
}

.gl-nav .gl-p1{fill:var(--p1)}
.gl-nav .gl-p2{fill:var(--p2)}
.gl-nav .gl-p3{fill:var(--p3)}
.gl-nav .gl-st{stroke:var(--p1)}

/* DESKTOP LINKS */

.gl-nav .gl-links{
  display:none;
  align-items:center;
  gap:30px;
  margin-left:55px;
}

.gl-nav .gl-link{
  display:inline-flex;
  align-items:center;
  gap:7px;
  white-space:nowrap;
  text-decoration:none;
  font-size:.94rem;
  font-weight:600;
  color:var(--dim);
  transition:color .2s ease;
}

.gl-nav .gl-link:hover{
  color:var(--link);
}

.gl-nav .gl-link.on{
  color:var(--link);
  font-weight:800;
}

/* ACTIONS */

.gl-nav .gl-actions{
  display:flex;
  align-items:center;
  gap:6px;
  flex-shrink:0;
  margin-left:auto;
  padding-left:18px;
}

.gl-nav .gl-ic{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:44px;
  height:44px;
  padding:0;
  border:0;
  border-radius:12px;
  background:transparent;
  color:var(--ink);
  text-decoration:none;
  cursor:pointer;
  transition:
    background .2s ease,
    color .2s ease,
    transform .2s ease;
}

.gl-nav .gl-ic:hover,
.gl-nav .gl-ic.on{
  background:var(--hov);
  color:var(--link);
}

.gl-nav .gl-ic:active{
  transform:scale(.94);
}

.gl-nav .gl-burger{
  color:var(--link);
}

/* BADGE */

.gl-nav .gl-badge{
  position:absolute;
  top:-3px;
  right:-4px;

  display:inline-flex;
  align-items:center;
  justify-content:center;

  min-width:21px;
  height:21px;

  padding:0 5px;

  border-radius:999px;

  background:#8b1538;
  color:#fff;

  font-size:.66rem;
  font-weight:900;
  line-height:1;

  border:2px solid var(--bg);

  box-shadow:
    0 3px 8px rgba(139,21,56,.28);

  z-index:5;
}

.gl-nav .gl-badge.in{
  position:static;
  margin-left:auto;
  border:0;
}

/* BUTTONS */

.gl-nav .gl-btn{
  display:none;
  align-items:center;
  justify-content:center;
  min-height:42px;
  padding:8px 16px;
  border:1px solid var(--out);
  border-radius:10px;
  background:transparent;
  color:var(--link);
  font-size:.84rem;
  font-weight:700;
  text-decoration:none;
  transition:
    background .2s ease,
    color .2s ease;
}

.gl-nav .gl-btn:hover{
  background:var(--acc);
  border-color:var(--acc);
  color:#fff;
}

.gl-nav .gl-btn.solid{
  background:var(--acc);
  border-color:var(--acc);
  color:#fff;
}

.gl-nav .gl-btn.solid:hover{
  background:var(--acc-d);
  border-color:var(--acc-d);
}

/* LANGUAGE */

.gl-nav .gl-lang{
  display:none;
  align-items:center;
  justify-content:center;
  min-width:44px;
  height:44px;
  padding:0 9px;
  border:1px solid var(--lb);
  border-radius:10px;
  color:var(--link);
  font-size:.72rem;
  font-weight:900;
  text-decoration:none;
  transition:background .2s ease;
}

.gl-nav .gl-lang:hover{
  background:var(--hov);
}

/* PROFILE */

.gl-nav .gl-profile{
  position:relative;
  display:inline-flex;
}

.gl-nav .gl-profile-btn{
  width:44px;
  height:44px;
  border-radius:50%;
  padding:0;
  overflow:hidden;
  border:2px solid var(--link);
  background:var(--hov);
  color:var(--link);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.gl-nav .gl-profile-btn:hover{
  transform:translateY(-1px);
  box-shadow:0 6px 18px rgba(139,21,56,.2);
}

.gl-nav .gl-profile-btn img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.gl-nav .gl-profile-name{
  position:absolute;
  top:calc(100% + 9px);
  right:0;
  white-space:nowrap;
  padding:8px 12px;
  border-radius:9px;
  background:#2a1a1f;
  color:#fff;
  font-size:.75rem;
  font-weight:700;
  opacity:0;
  visibility:hidden;
  transform:translateY(-4px);
  pointer-events:none;
  transition:
    opacity .18s ease,
    visibility .18s ease,
    transform .18s ease;
}

.gl-nav .gl-profile:hover .gl-profile-name{
  opacity:1;
  visibility:visible;
  transform:translateY(0);
}

/* MOBILE PANEL */

.gl-nav .gl-panel{
  position:absolute;
  left:0;
  right:0;
  top:100%;
  background:var(--panel);
  border-bottom:1px solid var(--bd);
  box-shadow:0 15px 30px rgba(0,0,0,.08);
}

.gl-nav .gl-pnav{
  display:flex;
  flex-direction:column;
  gap:5px;
  padding:15px clamp(16px,5vw,72px);
}

.gl-nav .gl-m{
  display:flex;
  align-items:center;
  gap:10px;
  padding:13px 14px;
  border-radius:10px;
  color:var(--ink);
  font-size:.92rem;
  font-weight:600;
  text-decoration:none;
  transition:
    background .2s ease,
    color .2s ease;
}

.gl-nav .gl-m:hover,
.gl-nav .gl-m.on{
  background:var(--hov);
  color:var(--link);
}

.gl-nav .gl-m.on{
  font-weight:800;
}

.gl-nav .gl-m.between{
  justify-content:space-between;
}

.gl-nav .gl-m.between b{
  color:var(--link);
}

.gl-nav .gl-sep{
  height:1px;
  margin:9px 0;
  background:var(--bd);
}

.gl-nav .gl-mbtns{
  display:flex;
  flex-direction:column;
  gap:9px;
  margin-top:9px;
}

.gl-nav .gl-mbtns .gl-btn{
  display:flex;
  width:100%;
  padding:11px 14px;
}

/* DESKTOP */

@media(min-width:576px){

  .gl-nav .gl-lang{
    display:inline-flex;
  }

}

@media(min-width:768px){

  .gl-nav .gl-actions>.gl-btn{
    display:inline-flex;
  }

}

@media(min-width:992px){

  .gl-nav .gl-links{
    display:flex;
  }

  .gl-nav .gl-burger,
  .gl-nav .gl-panel{
    display:none;
  }

}

/* MOBILE */

@media(max-width:575px){

  .gl-nav .gl-bar{
    min-height:68px;
    padding:10px 14px;
  }

  .gl-nav .gl-logo span{
    font-size:1.35rem;
  }

  .gl-nav .gl-logo svg{
    width:31px;
    height:31px;
  }

  .gl-nav .gl-actions{
    gap:2px;
    padding-left:8px;
  }

  .gl-nav .gl-ic{
    width:40px;
    height:40px;
  }

  .gl-nav .gl-profile-btn{
    width:40px;
    height:40px;
  }

  .gl-nav .gl-badge{
    top:-2px;
    right:-3px;
  }

}
`;

function Badge({
  count,
  inline = false,
}: {
  count?: number;
  inline?: boolean;
}) {
  if (!count || count < 1) {
    return null;
  }

  return (
    <span
      className={`gl-badge${inline ? " in" : ""}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Navbar({
  locale,
  cartCount = 0,
  wishCount = 0,
}: NavbarProps) {

  const pathname = usePathname() ?? "";

  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [dark, setDark] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
   * العدد الحقيقي للسلة
   */
  const [realCartCount, setRealCartCount] =
    useState(cartCount);

  /*
   * العدد الحقيقي للمفضلة
   */
  const [realWishCount, setRealWishCount] =
    useState(wishCount);

  /*
   * تحميل الثيم
   */
  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem("glamora-theme");

    const isDark = savedTheme === "dark";

    setDark(isDark);

    if (isDark) {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }
  }, []);

  /*
   * إغلاق قائمة الموبايل عند تغيير الصفحة
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * جلب عدد السلة والمفضلة
   *
   * يتم فقط للمستخدم المسجل.
   */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRealCartCount(0);
      setRealWishCount(0);
      return;
    }

    let cancelled = false;

    async function loadCounts() {
      try {
        const [cartResponse, wishResponse] =
          await Promise.all([
            fetch("/api/cart", {
              method: "GET",
              cache: "no-store",
            }),

            fetch("/api/favorites", {
              method: "GET",
              cache: "no-store",
            }),
          ]);

        const cartData =
          await cartResponse.json();

        const wishData =
          await wishResponse.json();

        if (cancelled) return;

        /*
         * Cart
         */
        if (
          cartResponse.ok &&
          cartData?.success
        ) {
          const cart =
            cartData?.data?.cart ||
            cartData?.data ||
            [];

          if (Array.isArray(cart)) {
            setRealCartCount(
              cart.reduce(
                (
                  total: number,
                  item: {
                    quantity?: number;
                  }
                ) =>
                  total +
                  Number(item.quantity || 0),
                0
              )
            );
          } else if (
            Array.isArray(cart?.items)
          ) {
            setRealCartCount(
              cart.items.reduce(
                (
                  total: number,
                  item: {
                    quantity?: number;
                  }
                ) =>
                  total +
                  Number(item.quantity || 0),
                0
              )
            );
          }
        }

        /*
         * Favorites
         */
        if (
          wishResponse.ok &&
          wishData?.success
        ) {
          const favorites =
            wishData?.data?.favorites ||
            wishData?.data ||
            [];

          if (Array.isArray(favorites)) {
            setRealWishCount(
              favorites.length
            );
          }
        }
      } catch (error) {
        console.error(
          "NAVBAR_COUNTS_ERROR:",
          error
        );
      }
    }

    loadCounts();

    /*
     * نسمح للصفحات الأخرى بتحديث الناف
     * بعد إضافة/حذف منتج.
     */
    const handleNavbarRefresh = () => {
      loadCounts();
    };

    window.addEventListener(
      "glamora:refresh-navbar",
      handleNavbarRefresh
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "glamora:refresh-navbar",
        handleNavbarRefresh
      );
    };
  }, [user, authLoading]);

  /*
   * تحديث الثيم
   */
  const toggleTheme = () => {
    const nextTheme = !dark;

    setDark(nextTheme);

    if (nextTheme) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "glamora-theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "glamora-theme",
        "light"
      );
    }
  };

  const t = useMemo(
    () =>
      ({
        ar: {
          home: "الرئيسية",
          products: "المنتجات",
          about: "من نحن",
          contact: "تواصل معنا",
          favorites: "المفضلة",
          cart: "السلة",
          search: "البحث",
          login: "تسجيل الدخول",
          register: "إنشاء حساب",
          profile: "الملف الشخصي",
          dashboard: "لوحة التحكم",
          users: "المستخدمين",
          orders: "الطلبات",
          adminProducts: "المنتجات",
          menu: "القائمة",
          lightMode: "الوضع الفاتح",
          darkMode: "الوضع الداكن",
          language: "تغيير اللغة",
          logout: "تسجيل الخروج",
          account: "الحساب",
        },

        en: {
          home: "Home",
          products: "Products",
          about: "About Us",
          contact: "Contact",
          favorites: "Favorites",
          cart: "Cart",
          search: "Search",
          login: "Login",
          register: "Register",
          profile: "Profile",
          dashboard: "Dashboard",
          users: "Users",
          orders: "Orders",
          adminProducts: "Products",
          menu: "Menu",
          lightMode: "Light mode",
          darkMode: "Dark mode",
          language: "Change language",
          logout: "Logout",
          account: "Account",
        },
      })[locale],
    [locale]
  );

  const switchLocale =
    locale === "ar" ? "en" : "ar";

  const localizedPath = pathname.replace(
    /^\/(ar|en)(?=\/|$)/,
    `/${switchLocale}`
  );

  const isActive = (href: string) => {
    if (
      href === `/${locale}` ||
      href === `/${locale}/admin`
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /*
   * Role
   */
  const role:
    | "guest"
    | "user"
    | "admin" =
    authLoading
      ? "guest"
      : user?.role === "admin"
        ? "admin"
        : user
          ? "user"
          : "guest";

  /*
   * Public links
   */
  const publicLinks: NavItem[] = [
    {
      href: `/${locale}`,
      label: t.home,
    },
    {
      href: `/${locale}/products`,
      label: t.products,
    },
    {
      href: `/${locale}/about`,
      label: t.about,
    },
    {
      href: `/${locale}/contact`,
      label: t.contact,
    },
  ];

  /*
   * Admin links
   */
  const adminLinks: NavItem[] = [
    {
      href: `/${locale}/admin/Dashboard`,
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/admin/Dashboard/users`,
      label: t.users,
      icon: Users,
    },
    {
      href: `/${locale}/admin/Dashboard/products`,
      label: t.adminProducts,
      icon: Package,
    },
    {
      href: `/${locale}/admin/Dashboard/orders`,
      label: t.orders,
      icon: ClipboardList,
    },
    {
      href: `/${locale}/profile`,
      label: t.profile,
      icon: User,
    },
  ];

  /*
   * Store actions
   */
  const actionLinks: NavItem[] = [
    {
      href: `/${locale}/search`,
      label: t.search,
      icon: Search,
    },
    {
      href: `/${locale}/favorites`,
      label: t.favorites,
      icon: Heart,
      count: realWishCount,
    },
    {
      href: `/${locale}/cart`,
      label: t.cart,
      icon: ShoppingBag,
      count: realCartCount,
    },
  ];

  const navLinks =
    role === "admin"
      ? adminLinks
      : publicLinks;

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();

      window.location.href =
        `/${locale}`;
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      <header
        dir="ltr"
        className="gl-nav"
        data-theme={
          mounted && dark
            ? "dark"
            : "light"
        }
      >
        <div className="gl-bar">

          {/* LOGO */}

          <Link
            href={`/${locale}`}
            className="gl-logo"
            aria-label="Glamora Home"
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{
                flexShrink: 0,
              }}
            >
              <path
                className="gl-p3"
                d="M20 16C24 21 24 27 20 32C16 27 16 21 20 16Z"
                transform="rotate(-62 20 32)"
              />

              <path
                className="gl-p3"
                d="M20 16C24 21 24 27 20 32C16 27 16 21 20 16Z"
                transform="rotate(62 20 32)"
              />

              <path
                className="gl-p2"
                d="M20 12C25 18 25 26 20 32C15 26 15 18 20 12Z"
                transform="rotate(-31 20 32)"
              />

              <path
                className="gl-p2"
                d="M20 12C25 18 25 26 20 32C15 26 15 18 20 12Z"
                transform="rotate(31 20 32)"
              />

              <path
                className="gl-p1"
                d="M20 7C26 14 26 24 20 32C14 24 14 14 20 7Z"
              />

              <path
                className="gl-st"
                d="M10 35.5Q20 39 30 35.5"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <span>Glamora</span>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="gl-links">
            {navLinks.map((item) => {
              const Icon = item.icon;

              const active =
                isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`gl-link${
                    active ? " on" : ""
                  }`}
                >
                  {Icon && (
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />
                  )}

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ACTIONS */}

          <div className="gl-actions">

            {/* Search / Favorites / Cart */}

            {role !== "admin" &&
              actionLinks.map((item) => {
                const Icon = item.icon!;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    title={item.label}
                    className={`gl-ic${
                      isActive(item.href)
                        ? " on"
                        : ""
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={1.8}
                    />

                    <Badge
                      count={item.count}
                    />
                  </Link>
                );
              })}

            {/* GUEST */}

            {role === "guest" ? (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="gl-btn"
                >
                  {t.login}
                </Link>

                <Link
                  href={`/${locale}/register`}
                  className="gl-btn solid"
                >
                  {t.register}
                </Link>
              </>
            ) : (
              <div className="gl-profile">

                <Link
                  href={`/${locale}/profile`}
                  aria-label={t.profile}
                  className="gl-profile-btn"
                >
                  {user?.profileImage?.url ? (
                    <Image
                      src={
                        user.profileImage.url
                      }
                      alt={user.fullName}
                      width={44}
                      height={44}
                      unoptimized
                    />
                  ) : (
                    <User
                      size={21}
                      strokeWidth={1.8}
                    />
                  )}
                </Link>

                <span className="gl-profile-name">
                  {user?.fullName ||
                    t.account}
                </span>

              </div>
            )}

            {/* LANGUAGE */}

            <Link
              href={localizedPath}
              aria-label={t.language}
              title={t.language}
              className="gl-lang"
            >
              {switchLocale.toUpperCase()}
            </Link>

            {/* THEME */}

            <button
              type="button"
              aria-label={
                dark
                  ? t.lightMode
                  : t.darkMode
              }
              title={
                dark
                  ? t.lightMode
                  : t.darkMode
              }
              onClick={toggleTheme}
              className="gl-ic"
            >
              {dark ? (
                <Sun
                  size={21}
                  strokeWidth={1.8}
                />
              ) : (
                <Moon
                  size={21}
                  strokeWidth={1.8}
                />
              )}
            </button>

            {/* MOBILE */}

            <button
              type="button"
              aria-label={t.menu}
              aria-expanded={mobileOpen}
              onClick={() =>
                setMobileOpen(
                  (prev) => !prev
                )
              }
              className="gl-ic gl-burger"
            >
              {mobileOpen ? (
                <X
                  size={23}
                  strokeWidth={1.8}
                />
              ) : (
                <Menu
                  size={23}
                  strokeWidth={1.8}
                />
              )}
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}

        {mobileOpen && (
          <div className="gl-panel">

            <nav className="gl-pnav">

              {navLinks.map((item) => {
                const Icon = item.icon;

                const active =
                  isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={`gl-m${
                      active
                        ? " on"
                        : ""
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                      />
                    )}

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              {/* STORE ACTIONS */}

              {role !== "admin" && (
                <>
                  <div className="gl-sep" />

                  {actionLinks.map(
                    (item) => {
                      const Icon =
                        item.icon!;

                      return (
                        <Link
                          key={item.href}
                          href={
                            item.href
                          }
                          className={`gl-m${
                            isActive(
                              item.href
                            )
                              ? " on"
                              : ""
                          }`}
                        >
                          <Icon
                            size={18}
                            strokeWidth={
                              1.8
                            }
                          />

                          <span>
                            {item.label}
                          </span>

                          <Badge
                            count={
                              item.count
                            }
                            inline
                          />
                        </Link>
                      );
                    }
                  )}
                </>
              )}

              <div className="gl-sep" />

              {/* LANGUAGE */}

              <Link
                href={localizedPath}
                className="gl-m between"
              >
                <span>
                  {t.language}
                </span>

                <b>
                  {switchLocale.toUpperCase()}
                </b>
              </Link>

              {/* GUEST */}

              {role === "guest" && (
                <div className="gl-mbtns">

                  <Link
                    href={`/${locale}/login`}
                    className="gl-btn"
                  >
                    {t.login}
                  </Link>

                  <Link
                    href={`/${locale}/register`}
                    className="gl-btn solid"
                  >
                    {t.register}
                  </Link>

                </div>
              )}

              {/* USER */}

              {role === "user" && (
                <>
                  <Link
                    href={`/${locale}/profile`}
                    className={`gl-m${
                      isActive(
                        `/${locale}/profile`
                      )
                        ? " on"
                        : ""
                    }`}
                  >
                    {user?.profileImage?.url ? (
                      <Image
                        src={
                          user
                            .profileImage
                            .url
                        }
                        alt={
                          user.fullName
                        }
                        width={26}
                        height={26}
                        unoptimized
                        style={{
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <User
                        size={18}
                        strokeWidth={
                          1.8
                        }
                      />
                    )}

                    <span>
                      {t.profile}
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="gl-m"
                    onClick={
                      handleLogout
                    }
                    disabled={
                      loggingOut
                    }
                    style={{
                      border: 0,
                      background:
                        "transparent",
                      width: "100%",
                      cursor:
                        loggingOut
                          ? "wait"
                          : "pointer",
                    }}
                  >
                    <LogOut
                      size={18}
                      strokeWidth={
                        1.8
                      }
                    />

                    <span>
                      {loggingOut
                        ? "..."
                        : t.logout}
                    </span>
                  </button>
                </>
              )}

              {/* ADMIN */}

              {role === "admin" && (
                <>
                  <div className="gl-sep" />

                  <Link
                    href={`/${locale}/profile`}
                    className={`gl-m${
                      isActive(
                        `/${locale}/profile`
                      )
                        ? " on"
                        : ""
                    }`}
                  >
                    {user?.profileImage?.url ? (
                      <Image
                        src={
                          user
                            .profileImage
                            .url
                        }
                        alt={
                          user.fullName
                        }
                        width={26}
                        height={26}
                        unoptimized
                        style={{
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <User
                        size={18}
                        strokeWidth={
                          1.8
                        }
                      />
                    )}

                    <span>
                      {t.profile}
                    </span>
                  </Link>

                  <button
                    type="button"
                    className="gl-m"
                    onClick={
                      handleLogout
                    }
                    disabled={
                      loggingOut
                    }
                    style={{
                      border: 0,
                      background:
                        "transparent",
                      width: "100%",
                      cursor:
                        loggingOut
                          ? "wait"
                          : "pointer",
                    }}
                  >
                    <LogOut
                      size={18}
                      strokeWidth={
                        1.8
                      }
                    />

                    <span>
                      {loggingOut
                        ? "..."
                        : t.logout}
                    </span>
                  </button>
                </>
              )}

            </nav>
          </div>
        )}
      </header>
    </>
  );
}