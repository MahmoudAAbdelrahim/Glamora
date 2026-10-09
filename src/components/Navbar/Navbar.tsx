"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

interface SearchProduct {
  id?: string;
  _id?: string;
  name?: string;
  brand?: string;
  price?: number;
  discountPrice?: number | null;
  isActive?: boolean;
  images?: Array<
    | string
    | {
        url?: string;
      }
  >;
}

const CSS = `
.gl-nav {
  --bg: rgba(255, 255, 255, 0.97);
  --panel: #fff;
  --bd: #f0dfe3;
  --ink: #2a1a1f;
  --link: #8b1538;
  --dim: rgba(42, 26, 31, 0.68);
  --hov: #fbe4e8;
  --acc: #8b1538;
  --acc-d: #6e0f2c;
  --out: #8b1538;
  --lb: #ead9de;
  --p1: #8b1538;
  --p2: #d6506f;
  --p3: #f4b6c2;

  position: sticky;
  top: 0;
  z-index: 1000;
  isolation: isolate;
  width: 100%;
  max-width: 100%;
  background: var(--bg);
  border-bottom: 1px solid var(--bd);
  box-sizing: border-box;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.gl-nav[data-theme="dark"]{
  --bg:rgba(8,9,15,.97);
  --panel:#0d0f17;
  --bd:#2b2026;
  --ink:#f8edf0;
  --link:#f4b6c2;
  --dim:rgba(248,237,240,.68);
  --hov:#21151d;
  --acc:#8b1538;
  --acc-d:#6e0f2c;
  --out:#d6506f;
  --lb:#3a252d;
  --p1:#f4b6c2;
  --p2:#d6506f;
  --p3:#a8294d;
}

.gl-nav *,
.gl-nav *::before,
.gl-nav *::after{
  box-sizing:border-box;
}

.gl-nav .gl-bar{
  width:100%;
  min-height:76px;

  display:flex;
  align-items:center;

  padding:12px clamp(16px,4vw,64px);
}

/* =========================
   LOGO
========================= */

.gl-nav .gl-logo{
  display:inline-flex;
  align-items:center;
  gap:9px;

  flex-shrink:0;

  color:var(--link);
  text-decoration:none;
}

.gl-nav .gl-logo span{
  color:var(--link);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:1.55rem;
  font-weight:700;

  letter-spacing:.4px;
}

.gl-nav .gl-p1{
  fill:var(--p1);
}

.gl-nav .gl-p2{
  fill:var(--p2);
}

.gl-nav .gl-p3{
  fill:var(--p3);
}

.gl-nav .gl-st{
  stroke:var(--p1);
}

/* =========================
   DESKTOP LINKS
========================= */

.gl-nav .gl-links{
  display:none;
  align-items:center;

  gap:28px;

  margin-inline-start:48px;
}

.gl-nav .gl-link{
  display:inline-flex;
  align-items:center;
  gap:7px;

  color:var(--dim);

  text-decoration:none;
  white-space:nowrap;

  font-size:.91rem;
  font-weight:600;

  transition:
    color .2s ease,
    transform .2s ease;
}

.gl-nav .gl-link:hover{
  color:var(--link);
}

.gl-nav .gl-link.on{
  color:var(--link);
  font-weight:800;
}

/* =========================
   ACTIONS
========================= */

.gl-nav .gl-actions{
  display:flex;
  align-items:center;

  gap:4px;

  margin-inline-start:auto;
  padding-inline-start:10px;

  flex-shrink:0;
}

/* كل مربعات الأيقونات واحدة */

.gl-nav .gl-ic{
  position:relative;

  width:42px;
  height:42px;

  flex:0 0 42px;

  display:inline-flex;
  align-items:center;
  justify-content:center;

  padding:0;
  margin:0;

  border:0;
  border-radius:11px;

  background:transparent;

  color:var(--ink);

  text-decoration:none;

  cursor:pointer;

  transition:
    background .2s ease,
    color .2s ease,
    transform .18s ease;
}

.gl-nav .gl-ic:hover,
.gl-nav .gl-ic.on{
  background:var(--hov);
  color:var(--link);
}

.gl-nav .gl-ic:active{
  transform:scale(.94);
}

/* =========================
   BADGE
========================= */

.gl-nav .gl-badge{
  position:absolute;

  top:-3px;
  inset-inline-end:-3px;

  min-width:19px;
  height:19px;

  display:flex;
  align-items:center;
  justify-content:center;

  padding:0 5px;

  border-radius:999px;

  background:#8b1538;
  color:#fff;

  border:2px solid var(--bg);

  font-size:.61rem;
  font-weight:900;

  line-height:1;

  z-index:5;
}

.gl-nav .gl-badge.in{
  position:static;

  min-width:auto;
  height:auto;

  margin-inline-start:auto;

  padding:3px 7px;

  border:0;
}

/* =========================
   LANGUAGE
========================= */

.gl-nav .gl-lang{
  width:42px;
  min-width:42px;
  height:42px;

  flex:0 0 42px;

  display:none;
  align-items:center;
  justify-content:center;

  padding:0;

  border:1px solid var(--lb);
  border-radius:11px;

  background:transparent;

  color:var(--link);

  font-size:.71rem;
  font-weight:900;

  line-height:1;
  text-align:center;

  text-decoration:none;

  transition:
    background .2s ease,
    border-color .2s ease;
}

.gl-nav .gl-lang:hover{
  background:var(--hov);
  border-color:var(--link);
}

/* =========================
   PROFILE
========================= */

.gl-nav .gl-profile{
  position:relative;

  width:42px;
  height:42px;

  flex:0 0 42px;

  display:inline-flex;
  align-items:center;
  justify-content:center;
}

.gl-nav .gl-profile-btn{
  width:42px;
  height:42px;

  display:inline-flex;
  align-items:center;
  justify-content:center;

  padding:0;

  overflow:hidden;

  border:2px solid var(--link);
  border-radius:50%;

  background:var(--hov);
  color:var(--link);

  cursor:pointer;

  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.gl-nav .gl-profile-btn:hover{
  transform:translateY(-1px);

  box-shadow:
    0 6px 18px rgba(139,21,56,.18);
}

.gl-nav .gl-profile-btn img{
  width:100%;
  height:100%;

  display:block;

  object-fit:cover;
}

.gl-nav .gl-profile-name{
  position:absolute;

  top:calc(100% + 9px);
  inset-inline-end:0;

  padding:7px 10px;

  border-radius:8px;

  background:#2a1a1f;
  color:#fff;

  white-space:nowrap;

  font-size:.7rem;
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

/* =========================
   LOGIN / REGISTER
========================= */

.gl-nav .gl-btn{
  display:none;
  align-items:center;
  justify-content:center;

  min-height:42px;

  padding:8px 15px;

  border:1px solid var(--out);
  border-radius:10px;

  background:transparent;

  color:var(--link);

  text-decoration:none;

  font-size:.82rem;
  font-weight:700;

  transition:
    background .2s ease,
    color .2s ease,
    transform .2s ease;
}

.gl-nav .gl-btn:hover{
  background:var(--acc);
  border-color:var(--acc);
  color:#fff;

  transform:translateY(-1px);
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

/* =========================
   SEARCH POPOVER
========================= */

.gl-nav .gl-search-wrap{
  position:relative;

  width:42px;
  height:42px;

  flex:0 0 42px;
}

.gl-nav .gl-search-pop{
  position:absolute;

  top:calc(100% + 11px);
  inset-inline-end:0;

  width:min(430px,calc(100vw - 24px));

  padding:12px;

  border:1px solid var(--bd);
  border-radius:16px;

  background:var(--panel);

  box-shadow:
    0 18px 45px rgba(42,26,31,.15);

  z-index:1200;

  animation:
    gl-search-in .18s ease both;
}

@keyframes gl-search-in{
  from{
    opacity:0;
    transform:
      translateY(-7px)
      scale(.98);
  }

  to{
    opacity:1;
    transform:
      translateY(0)
      scale(1);
  }
}

.gl-nav .gl-search-input-wrap{
  width:100%;
  height:46px;

  display:flex;
  align-items:center;

  gap:8px;

  padding:0 11px;

  border:1px solid var(--bd);
  border-radius:11px;

  background:var(--bg);

  color:var(--link);
}

.gl-nav .gl-search-input-wrap:focus-within{
  border-color:var(--link);

  box-shadow:
    0 0 0 3px rgba(139,21,56,.08);
}

.gl-nav .gl-search-input{
  width:100%;
  min-width:0;

  border:0;
  outline:0;

  background:transparent;
  color:var(--ink);

  font:inherit;
  font-size:.86rem;
}

.gl-nav .gl-search-input::placeholder{
  color:var(--dim);
}

.gl-nav .gl-search-clear{
  width:28px;
  height:28px;

  flex:0 0 28px;

  display:flex;
  align-items:center;
  justify-content:center;

  padding:0;

  border:0;
  border-radius:8px;

  background:transparent;

  color:var(--dim);

  cursor:pointer;
}

.gl-nav .gl-search-clear:hover{
  background:var(--hov);
  color:var(--link);
}

.gl-nav .gl-search-results{
  display:flex;
  flex-direction:column;

  gap:3px;

  max-height:350px;

  margin-top:8px;

  overflow-y:auto;
}

.gl-nav .gl-search-result{
  width:100%;

  display:flex;
  align-items:center;

  gap:10px;

  padding:8px;

  border-radius:11px;

  color:var(--ink);

  text-decoration:none;

  transition:
    background .18s ease;
}

.gl-nav .gl-search-result:hover{
  background:var(--hov);
}

.gl-nav .gl-search-thumb{
  width:48px;
  height:48px;

  flex:0 0 48px;

  overflow:hidden;

  border-radius:9px;

  background:#fbe4e8;
}

.gl-nav .gl-search-thumb img{
  width:100%;
  height:100%;

  display:block;

  object-fit:cover;
}

.gl-nav .gl-search-info{
  min-width:0;
  flex:1;
}

.gl-nav .gl-search-name{
  display:block;

  overflow:hidden;

  white-space:nowrap;
  text-overflow:ellipsis;

  color:var(--ink);

  font-size:.81rem;
  font-weight:800;
}

.gl-nav .gl-search-brand{
  display:block;

  margin-top:2px;

  overflow:hidden;

  white-space:nowrap;
  text-overflow:ellipsis;

  color:var(--dim);

  font-size:.68rem;
}

.gl-nav .gl-search-price{
  flex:0 0 auto;

  color:var(--link);

  font-size:.75rem;
  font-weight:900;

  white-space:nowrap;
}

.gl-nav .gl-search-state{
  padding:15px 8px;

  text-align:center;

  color:var(--dim);

  font-size:.77rem;
}

.gl-nav .gl-search-view-all{
  min-height:40px;

  display:flex;
  align-items:center;
  justify-content:center;

  margin-top:7px;

  border-radius:10px;

  background:var(--hov);
  color:var(--link);

  font-size:.77rem;
  font-weight:800;

  text-decoration:none;
}

.gl-nav .gl-mobile-searchbox{
  display:none;
}

/* =========================
   MOBILE PANEL
========================= */

.gl-nav .gl-panel{
  position:absolute;

  top:100%;
  inset-inline:0;

  background:var(--panel);

  border-bottom:1px solid var(--bd);

  box-shadow:
    0 16px 35px rgba(0,0,0,.08);
}

.gl-nav .gl-pnav{
  display:flex;
  flex-direction:column;

  gap:4px;

  padding:14px clamp(14px,5vw,60px);
}

.gl-nav .gl-m{
  width:100%;

  min-height:46px;

  display:flex;
  align-items:center;

  gap:10px;

  padding:10px 13px;

  border:0;
  border-radius:10px;

  background:transparent;

  color:var(--ink);

  font-size:.9rem;
  font-weight:600;

  text-align:start;
  text-decoration:none;

  cursor:pointer;

  transition:
    background .18s ease,
    color .18s ease;
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
  width:100%;
  height:1px;

  margin:8px 0;

  background:var(--bd);
}

.gl-nav .gl-mbtns{
  display:flex;
  flex-direction:column;

  gap:8px;

  margin-top:8px;
}

.gl-nav .gl-mbtns .gl-btn{
  width:100%;

  display:flex;
}

/* =========================
   DESKTOP
========================= */

@media(min-width:576px){

  .gl-nav .gl-lang{
    display:inline-flex;
  }

}

@media(min-width:768px){

  .gl-nav .gl-actions > .gl-btn{
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

/* =========================
   MOBILE
========================= */


@media (max-width: 575px) {
  .gl-nav .gl-bar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 10px 12px;
  }

  .gl-nav .gl-logo {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }

  .gl-nav .gl-actions {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    min-width: 0;
    margin: 0;
    padding: 0;
  }

  .gl-nav .gl-ic,
  .gl-nav .gl-lang,
  .gl-nav .gl-profile {
    flex-shrink: 0;
  }

  .gl-nav .gl-mobile-searchbox {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    min-width: 0;
  }
}



  .gl-nav .gl-search-wrap{
    width:38px;
    height:38px;

    flex-basis:38px;
  }

  .gl-nav .gl-profile{
    width:38px;
    height:38px;

    flex-basis:38px;
  }

  .gl-nav .gl-profile-btn{
    width:38px;
    height:38px;
  }

  .gl-nav .gl-lang{
    width:38px;
    min-width:38px;
    height:38px;

    flex-basis:38px;

    padding:0;

    font-size:.67rem;
    line-height:1;

    display:inline-flex;
  }

  .gl-nav .gl-theme-toggle{
    display:none;
  }

  .gl-nav .gl-action-favorites{
    display:none;
  }

  .gl-nav .gl-btn{
    display:none;
  }

}

/* =========================
   SMALL PHONES
========================= */

@media(max-width:430px){

  .gl-nav .gl-logo span{
    display:none;
  }

  .gl-nav .gl-action-search{
    display:none;
  }

  .gl-nav .gl-mobile-searchbox{
    display:block;
  }

  .gl-nav .gl-mobile-searchbox .gl-search-pop{
    width:100%;

    position:static;

    padding:0;

    border:0;

    box-shadow:none;

    animation:none;
  }

}

/* =========================
   VERY SMALL PHONES
========================= */

@media(max-width:360px){

  .gl-nav .gl-bar{
    padding-inline:8px;
  }

  .gl-nav .gl-actions{
    gap:1px;
  }

  .gl-nav .gl-ic,
  .gl-nav .gl-profile,
  .gl-nav .gl-profile-btn,
  .gl-nav .gl-search-wrap,
  .gl-nav .gl-lang{
    width:35px;
    height:35px;

    flex-basis:35px;
  }

  .gl-nav .gl-lang{
    min-width:35px;
  }

  .gl-nav .gl-ic svg{
    width:19px;
    height:19px;
  }

}
`;

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

  const [realCartCount, setRealCartCount] =
    useState(cartCount);

  const [realWishCount, setRealWishCount] =
    useState(wishCount);

  /* SEARCH */

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState<SearchProduct[]>([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const searchRef =
    useRef<HTMLDivElement | null>(null);

  const mobileSearchRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================
     THEME
  ========================= */

  useEffect(() => {
    setMounted(true);

    const savedTheme =
      localStorage.getItem(
        "glamora-theme"
      );

    const isDark =
      savedTheme === "dark";

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

  /* =========================
     CLOSE MOBILE MENU
  ========================= */

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* =========================
     SEARCH
  ========================= */

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const query =
      searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    const timer =
      window.setTimeout(
        async () => {
          try {
            setSearchLoading(true);

            const response =
              await fetch(
                `/api/products?search=${encodeURIComponent(
                  query
                )}&page=1&limit=8`,
                {
                  cache: "no-store",
                }
              );

            const json =
              await response.json();

            if (cancelled) {
              return;
            }

            const products =
              json?.data?.products ??
              json?.products ??
              [];

            if (
              Array.isArray(products)
            ) {
              setSearchResults(
                products
                  .filter(
                    (product: SearchProduct) =>
                      product?.isActive !== false
                  )
                  .slice(0, 8)
              );
            } else {
              setSearchResults([]);
            }
          } catch (error) {
            if (!cancelled) {
              console.error(
                "NAVBAR_SEARCH_ERROR:",
                error
              );

              setSearchResults([]);
            }
          } finally {
            if (!cancelled) {
              setSearchLoading(false);
            }
          }
        },
        220
      );

    return () => {
      cancelled = true;

      window.clearTimeout(timer);
    };
  }, [
    searchOpen,
    searchQuery,
  ]);

  /* =========================
     CLOSE SEARCH OUTSIDE
  ========================= */

  useEffect(() => {
    const handleOutside =
      (event: MouseEvent) => {
        const target =
          event.target as Node;

        const desktopInside =
          searchRef.current?.contains(
            target
          );

        const mobileInside =
          mobileSearchRef.current?.contains(
            target
          );

        if (
          !desktopInside &&
          !mobileInside
        ) {
          setSearchOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  /* =========================
     CART + FAVORITES COUNTS
  ========================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setRealCartCount(0);
      setRealWishCount(0);
      return;
    }

    let cancelled = false;

    async function loadCounts() {
      try {
        const [
          cartResponse,
          wishResponse,
        ] = await Promise.all([
          fetch("/api/cart", {
            cache: "no-store",
          }),

          fetch("/api/favorites", {
            cache: "no-store",
          }),
        ]);

        const cartData =
          await cartResponse.json();

        const wishData =
          await wishResponse.json();

        if (cancelled) {
          return;
        }

        if (
          cartResponse.ok &&
          cartData?.success
        ) {
          const cart =
            cartData?.data?.cart ??
            cartData?.data ??
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
                  Number(
                    item.quantity ?? 0
                  ),
                0
              )
            );
          } else if (
            Array.isArray(
              cart?.items
            )
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
                  Number(
                    item.quantity ?? 0
                  ),
                0
              )
            );
          }
        }

        if (
          wishResponse.ok &&
          wishData?.success
        ) {
          const favorites =
            wishData?.data?.favorites ??
            wishData?.data ??
            [];

          if (
            Array.isArray(favorites)
          ) {
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

    const refresh =
      () => loadCounts();

    window.addEventListener(
      "glamora:refresh-navbar",
      refresh
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "glamora:refresh-navbar",
        refresh
      );
    };
  }, [
    user,
    authLoading,
  ]);

  /* =========================
     THEME TOGGLE
  ========================= */

  const toggleTheme = () => {
    const next =
      !dark;

    setDark(next);

    if (next) {
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

  /* =========================
     TRANSLATIONS
  ========================= */

  const t = useMemo(
    () =>
      locale === "ar"
        ? {
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
            adminProducts:
              "المنتجات",
            menu: "القائمة",
            lightMode:
              "الوضع الفاتح",
            darkMode:
              "الوضع الداكن",
            language:
              "تغيير اللغة",
            logout:
              "تسجيل الخروج",
            account: "الحساب",
          }
        : {
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
            adminProducts:
              "Products",
            menu: "Menu",
            lightMode:
              "Light mode",
            darkMode:
              "Dark mode",
            language:
              "Change language",
            logout:
              "Logout",
            account: "Account",
          },
    [locale]
  );

  const switchLocale =
    locale === "ar"
      ? "en"
      : "ar";

  const localizedPath =
    pathname.replace(
      /^\/(ar|en)(?=\/|$)/,
      `/${switchLocale}`
    );

  /* =========================
     ACTIVE LINK
  ========================= */

  const isActive = (
    href: string
  ) => {
    if (
      href === `/${locale}` ||
      href ===
        `/${locale}/admin`
    ) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };

  /* =========================
     ROLE
  ========================= */

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

  /* =========================
     LINKS
  ========================= */

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

  const adminLinks: NavItem[] = [
    {
      href: `/${locale}/admin/dashboard`,
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: `/${locale}/admin/dashboard/users`,
      label: t.users,
      icon: Users,
    },
    {
      href: `/${locale}/admin/dashboard/products`,
      label:
        t.adminProducts,
      icon: Package,
    },
    {
      href: `/${locale}/admin/dashboard/orders`,
      label: t.orders,
      icon: ClipboardList,
    },
    {
      href: `/${locale}/profile`,
      label: t.profile,
      icon: User,
    },
  ];

  const actionLinks: NavItem[] = [
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

  /* =========================
     SEARCH HELPERS
  ========================= */

  const getProductImage = (
    product: SearchProduct
  ) => {
    const image =
      product?.images?.[0];

    if (
      typeof image ===
      "string"
    ) {
      return image;
    }

    if (
      image &&
      typeof image ===
        "object" &&
      typeof image.url ===
        "string"
    ) {
      return image.url;
    }

    return "/images/placeholder-product.png";
  };

  const getProductName = (
    product: SearchProduct
  ) => {
    return (
      product?.name ??
      (locale === "ar"
        ? "منتج"
        : "Product")
    );
  };

  const getProductPrice = (
    product: SearchProduct
  ) => {
    const price = Number(
      product?.discountPrice ??
        product?.price ??
        0
    );

    return `${price.toLocaleString(
      locale === "ar"
        ? "ar-EG"
        : "en-US"
    )} ${
      locale === "ar"
        ? "جنيه"
        : "EGP"
    }`;
  };

  /* =========================
     SEARCH POPOVER
  ========================= */

  const SearchPopover = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <div
      className={
        mobile
          ? "gl-search-pop gl-mobile-pop"
          : "gl-search-pop"
      }
    >
      <div className="gl-search-input-wrap">
        <Search
          size={18}
          strokeWidth={1.8}
        />

        <input
          autoFocus
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(
              event.target.value
            );

            setSearchOpen(true);
          }}
          onKeyDown={(event) => {
            if (
              event.key ===
              "Escape"
            ) {
              setSearchOpen(false);
            }
          }}
          className="gl-search-input"
          placeholder={
            locale === "ar"
              ? "ابحثي عن منتج..."
              : "Search for products..."
          }
          aria-label={
            t.search
          }
        />

        {searchQuery && (
          <button
            type="button"
            className="gl-search-clear"
            onClick={() =>
              setSearchQuery("")
            }
            aria-label={
              locale === "ar"
                ? "مسح"
                : "Clear"
            }
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="gl-search-results">
        {searchLoading && (
          <div className="gl-search-state">
            {locale === "ar"
              ? "جاري البحث..."
              : "Searching..."}
          </div>
        )}

        {!searchLoading &&
          searchQuery.trim()
            .length < 2 && (
            <div className="gl-search-state">
              {locale === "ar"
                ? "اكتبي اسم المنتج للبحث"
                : "Type at least 2 characters"}
            </div>
          )}

        {!searchLoading &&
          searchQuery.trim()
            .length >= 2 &&
          searchResults.length ===
            0 && (
            <div className="gl-search-state">
              {locale === "ar"
                ? "لا توجد منتجات مطابقة"
                : "No matching products"}
            </div>
          )}

        {!searchLoading &&
          searchResults.map(
            (product) => {
              const id = String(
                product?.id ??
                  product?._id ??
                  ""
              );

              if (!id) {
                return null;
              }

              return (
                <Link
                  key={id}
                  href={`/${locale}/products/${id}`}
                  className="gl-search-result"
                  onClick={() =>
                    setSearchOpen(false)
                  }
                >
                  <span className="gl-search-thumb">
                    <img
                      src={getProductImage(
                        product
                      )}
                      alt={getProductName(
                        product
                      )}
                    />
                  </span>

                  <span className="gl-search-info">
                    <span className="gl-search-name">
                      {getProductName(
                        product
                      )}
                    </span>

                    <span className="gl-search-brand">
                      {product?.brand ||
                        "Glamora"}
                    </span>
                  </span>

                  <span className="gl-search-price">
                    {getProductPrice(
                      product
                    )}
                  </span>
                </Link>
              );
            }
          )}
      </div>

      {searchQuery.trim()
        .length >= 2 && (
        <Link
          href={`/${locale}/products?search=${encodeURIComponent(
            searchQuery.trim()
          )}`}
          className="gl-search-view-all"
          onClick={() =>
            setSearchOpen(false)
          }
        >
          {locale === "ar"
            ? "عرض كل النتائج"
            : "View all results"}
        </Link>
      )}
    </div>
  );

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      setLoggingOut(true);

      try {
        await logout();

        window.location.href =
          `/${locale}`;
      } finally {
        setLoggingOut(false);
      }
    };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: CSS,
        }}
      />

      <header
        className="gl-nav"
        dir="ltr"
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
            aria-label="Glamora"
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 40 40"
              fill="none"
              aria-hidden="true"
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

            <span>
              Glamora
            </span>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="gl-links">
            {navLinks.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className={`gl-link${
                      active
                        ? " on"
                        : ""
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={17}
                        strokeWidth={
                          1.8
                        }
                      />
                    )}

                    <span>
                      {
                        item.label
                      }
                    </span>
                  </Link>
                );
              }
            )}
          </nav>

          {/* ACTIONS */}

          <div className="gl-actions">

            {/* SEARCH */}

            {role !==
              "admin" && (
              <div
                className="gl-search-wrap"
                ref={
                  searchRef
                }
              >
                <button
                  type="button"
                  className={`gl-ic gl-action-search${
                    searchOpen
                      ? " on"
                      : ""
                  }`}
                  aria-label={
                    t.search
                  }
                  title={
                    t.search
                  }
                  onClick={() =>
                    setSearchOpen(
                      (value) =>
                        !value
                    )
                  }
                >
                  <Search
                    size={20}
                    strokeWidth={
                      1.8
                    }
                  />
                </button>

                {searchOpen && (
                  <SearchPopover />
                )}
              </div>
            )}

            {/* FAVORITES + CART */}

            {role !==
              "admin" &&
              actionLinks.map(
                (item) => {
                  const Icon =
                    item.icon!;

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      className={`gl-ic ${
                        item.href.includes(
                          "/favorites"
                        )
                          ? "gl-action-favorites"
                          : "gl-action-cart"
                      }${
                        isActive(
                          item.href
                        )
                          ? " on"
                          : ""
                      }`}
                      aria-label={
                        item.label
                      }
                      title={
                        item.label
                      }
                    >
                      <Icon
                        size={20}
                        strokeWidth={
                          1.8
                        }
                      />

                      {item.count &&
                        item.count >
                          0 && (
                          <span className="gl-badge">
                            {item.count >
                            99
                              ? "99+"
                              : item.count}
                          </span>
                        )}
                    </Link>
                  );
                }
              )}

            {/* GUEST */}

            {role ===
            "guest" ? (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="gl-btn"
                >
                  {
                    t.login
                  }
                </Link>

                <Link
                  href={`/${locale}/register`}
                  className="gl-btn solid"
                >
                  {
                    t.register
                  }
                </Link>
              </>
            ) : (
              <div className="gl-profile">
                <Link
                  href={`/${locale}/profile`}
                  className="gl-profile-btn"
                  aria-label={
                    t.profile
                  }
                >
                  {(
                    user as any
                  )?.profileImage
                    ?.url ? (
                    <Image
                      src={
                        (
                          user as any
                        )
                          .profileImage
                          .url
                      }
                      alt={
                        (
                          user as any
                        )
                          ?.fullName ??
                        "Profile"
                      }
                      width={
                        42
                      }
                      height={
                        42
                      }
                      unoptimized
                    />
                  ) : (
                    <User
                      size={
                        20
                      }
                      strokeWidth={
                        1.8
                      }
                    />
                  )}
                </Link>

                <span className="gl-profile-name">
                  {(
                    user as any
                  )?.fullName ??
                    t.account}
                </span>
              </div>
            )}

            {/* LANGUAGE */}

            <Link
              href={
                localizedPath
              }
              className="gl-lang"
              aria-label={
                t.language
              }
              title={
                t.language
              }
            >
              {switchLocale.toUpperCase()}
            </Link>

            {/* THEME */}

            <button
              type="button"
              className="gl-ic gl-theme-toggle"
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
              onClick={
                toggleTheme
              }
            >
              {dark ? (
                <Sun
                  size={20}
                  strokeWidth={
                    1.8
                  }
                />
              ) : (
                <Moon
                  size={20}
                  strokeWidth={
                    1.8
                  }
                />
              )}
            </button>

            {/* MENU */}

            <button
              type="button"
              className="gl-ic gl-burger"
              aria-label={
                t.menu
              }
              aria-expanded={
                mobileOpen
              }
              onClick={() =>
                setMobileOpen(
                  (value) =>
                    !value
                )
              }
            >
              {mobileOpen ? (
                <X
                  size={21}
                  strokeWidth={
                    1.8
                  }
                />
              ) : (
                <Menu
                  size={21}
                  strokeWidth={
                    1.8
                  }
                />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}

        {mobileOpen && (
          <div className="gl-panel">
            <nav className="gl-pnav">

              {navLinks.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    isActive(
                      item.href
                    );

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
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
                          strokeWidth={
                            1.8
                          }
                        />
                      )}

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </Link>
                  );
                }
              )}

              {/* MOBILE SEARCH */}

              {role !==
                "admin" && (
                <div
                  ref={
                    mobileSearchRef
                  }
                  className="gl-mobile-searchbox"
                >
                  <SearchPopover
                    mobile
                  />
                </div>
              )}

              {/* STORE ACTIONS */}

              {role !==
                "admin" && (
                <>
                  <div className="gl-sep" />

                  {actionLinks.map(
                    (item) => {
                      const Icon =
                        item.icon!;

                      return (
                        <Link
                          key={
                            item.href
                          }
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
                            {
                              item.label
                            }
                          </span>

                          {item.count &&
                            item.count >
                              0 && (
                              <span className="gl-badge in">
                                {item.count >
                                99
                                  ? "99+"
                                  : item.count}
                              </span>
                            )}
                        </Link>
                      );
                    }
                  )}
                </>
              )}

              <div className="gl-sep" />

              {/* LANGUAGE */}

              <Link
                href={
                  localizedPath
                }
                className="gl-m between"
              >
                <span>
                  {
                    t.language
                  }
                </span>

                <b>
                  {
                    switchLocale.toUpperCase()
                  }
                </b>
              </Link>

              {/* THEME */}

              <button
                type="button"
                className="gl-m"
                onClick={
                  toggleTheme
                }
              >
                {dark ? (
                  <Sun
                    size={18}
                    strokeWidth={
                      1.8
                    }
                  />
                ) : (
                  <Moon
                    size={18}
                    strokeWidth={
                      1.8
                    }
                  />
                )}

                <span>
                  {dark
                    ? t.lightMode
                    : t.darkMode}
                </span>
              </button>

              {/* GUEST */}

              {role ===
                "guest" && (
                <div className="gl-mbtns">
                  <Link
                    href={`/${locale}/login`}
                    className="gl-btn"
                  >
                    {
                      t.login
                    }
                  </Link>

                  <Link
                    href={`/${locale}/register`}
                    className="gl-btn solid"
                  >
                    {
                      t.register
                    }
                  </Link>
                </div>
              )}

              {/* USER */}

              {role ===
                "user" && (
                <>
                  <Link
                    href={`/${locale}/profile`}
                    className="gl-m"
                  >
                    <User
                      size={18}
                      strokeWidth={
                        1.8
                      }
                    />

                    <span>
                      {
                        t.profile
                      }
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

              {role ===
                "admin" && (
                <>
                  <div className="gl-sep" />

                  <Link
                    href={`/${locale}/profile`}
                    className="gl-m"
                  >
                    <User
                      size={18}
                      strokeWidth={
                        1.8
                      }
                    />

                    <span>
                      {
                        t.profile
                      }
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
