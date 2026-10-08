"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, CreditCard, Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/src/components/providers/AuthProvider";

export type Locale = "ar" | "en";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: "skincare" | "makeup";
  description?: string;
  price: number;
  discountPrice?: number | null;
  currency?: string;
  images: { url: string; publicId?: string }[];
  skinTypes?: string[];
  concerns?: string[];
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
  suitableForAge?: { min?: number; max?: number };
  shade?: string;
  size?: string;
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  bestSeller?: boolean;
};

export const SKIN_TYPES = ["oily", "dry", "combination", "sensitive", "normal"];

export const CONCERNS = [
  "acne", "dark-circles", "dark-spots", "pores", "dehydration", "dryness", "oiliness",
  "wrinkles", "fine-lines", "redness", "dullness", "uneven-tone", "blackheads", "blemishes",
];

export const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    home: "Home", products: "Products", skincare: "Skincare", makeup: "Makeup",
    filters: "Filters", clearAll: "Clear All", skinType: "Skin Type", budget: "Budget",
    brand: "Brand", concern: "Concern", apply: "Apply Filters", showMore: "Show more",
    showLess: "Show less", searchPlaceholder: "Search for products...", sortBy: "Sort by",
    popular: "Popular", newest: "Newest", priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low", topRated: "Top Rated", showing: "Showing",
    productsWord: "products", egp: "EGP", noProducts: "No products found",
    noProductsText: "Try changing your search or filters.", outOfStock: "Out of stock",
    addToCart: "Add to Cart", addToWishlist: "Add to Wishlist", inWishlist: "In Wishlist",
    quantity: "Quantity", suitableFor: "Suitable For", keyBenefits: "Key Benefits",
    description: "Description", ingredients: "Ingredients", reviews: "Reviews",
    reviewsWord: "reviews", inStock: "In stock", onlyLeft: "Only {n} left",
    cartAdded: "Added to cart", cartError: "Could not add to cart",
    loginFirst: "Please log in first", favAdded: "Added to wishlist",
    favRemoved: "Removed from wishlist", favorites: "Wishlist", cart: "Cart",
    notFound: "Product not found", notFoundText: "This product is unavailable or was removed.",
    back: "Back to products", size: "Size", shade: "Shade", age: "Suitable age", sku: "SKU",
    howToUse: "How to use", noIngredients: "Ingredients are not listed for this product.",
    noReviews: "Customer reviews will appear here.", years: "years", from: "From", to: "to",
    filtersBtn: "Filters", prev: "Previous", next: "Next",
    all: "All skin types", oily: "Oily", dry: "Dry", combination: "Combination",
    sensitive: "Sensitive", normal: "Normal", acne: "Acne", "dark-circles": "Dark Circles",
    "dark-spots": "Dark Spots", pores: "Pores", dehydration: "Dehydration", dryness: "Dryness",
    oiliness: "Oiliness", wrinkles: "Wrinkles", "fine-lines": "Fine Lines", redness: "Redness",
    dullness: "Dullness", "uneven-tone": "Uneven Tone", blackheads: "Blackheads",
    blemishes: "Blemishes",
  },
  ar: {
    home: "الرئيسية", products: "المنتجات", skincare: "العناية بالبشرة", makeup: "المكياج",
    filters: "الفلاتر", clearAll: "مسح الكل", skinType: "نوع البشرة", budget: "الميزانية",
    brand: "البراند", concern: "المشكلة", apply: "تطبيق الفلاتر", showMore: "عرض المزيد",
    showLess: "عرض أقل", searchPlaceholder: "ابحث عن منتج...", sortBy: "ترتيب حسب",
    popular: "الأكثر شيوعًا", newest: "الأحدث", priceLow: "السعر: من الأقل",
    priceHigh: "السعر: من الأعلى", topRated: "الأعلى تقييمًا", showing: "عرض",
    productsWord: "منتج", egp: "ج.م", noProducts: "لا توجد منتجات",
    noProductsText: "جرّب تغيير البحث أو الفلاتر.", outOfStock: "نفد المخزون",
    addToCart: "أضف إلى السلة", addToWishlist: "أضف إلى المفضلة", inWishlist: "في المفضلة",
    quantity: "الكمية", suitableFor: "مناسب لـ", keyBenefits: "أهم الفوائد",
    description: "الوصف", ingredients: "المكونات", reviews: "التقييمات",
    reviewsWord: "تقييم", inStock: "متوفر", onlyLeft: "متبقي {n} فقط",
    cartAdded: "تمت الإضافة إلى السلة", cartError: "تعذر الإضافة إلى السلة",
    loginFirst: "سجّل الدخول أولًا", favAdded: "تمت الإضافة للمفضلة",
    favRemoved: "تمت الإزالة من المفضلة", favorites: "المفضلة", cart: "السلة",
    notFound: "المنتج غير موجود", notFoundText: "هذا المنتج غير متاح أو تم حذفه.",
    back: "العودة للمنتجات", size: "الحجم", shade: "الدرجة", age: "العمر المناسب", sku: "رمز المنتج",
    howToUse: "طريقة الاستخدام", noIngredients: "لم تُذكر المكونات لهذا المنتج.",
    noReviews: "ستظهر تقييمات العملاء هنا.", years: "سنة", from: "من", to: "إلى",
    filtersBtn: "الفلاتر", prev: "السابق", next: "التالي",
    all: "كل أنواع البشرة", oily: "دهنية", dry: "جافة", combination: "مختلطة",
    sensitive: "حساسة", normal: "عادية", acne: "حب الشباب", "dark-circles": "الهالات السوداء",
    "dark-spots": "البقع الداكنة", pores: "المسام", dehydration: "الجفاف ونقص الترطيب",
    dryness: "الجفاف", oiliness: "الدهون الزائدة", wrinkles: "التجاعيد",
    "fine-lines": "الخطوط الدقيقة", redness: "الاحمرار", dullness: "بهتان البشرة",
    "uneven-tone": "تفاوت اللون", blackheads: "الرؤوس السوداء", blemishes: "العيوب",
  },
};

export function formatPrice(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function currencyLabel(product: { currency?: string }, locale: Locale) {
  const c = product.currency || "EGP";
  return c === "EGP" ? LABELS[locale].egp : c;
}

export function useToast() {
  const [message, setMessage] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((text: string) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(""), 2500);
  }, []);
  return { message, show };
}

function toIds(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) =>
      typeof item === "string"
        ? item
        : String(item?.id ?? item?._id ?? item?.productId?._id ?? item?.productId ?? "")
    )
    .filter(Boolean);
}

/** Favorites + cart count, shared by the list and details pages. */
export function useStore() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) return setCartCount(0);
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      const root = data.data?.cart ?? data.data ?? {};
      // /api/cart returns data.cart as an array of { product, quantity }
      const items: { quantity?: number }[] = Array.isArray(root) ? root : root.items ?? root.products ?? [];
      setCartCount(
        Array.isArray(items) ? items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0) : 0
      );
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (!user) return setFavorites([]);
    fetch("/api/favorites", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.success && setFavorites(toIds(d.data?.favorites)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    refreshCart();
    window.addEventListener(REFRESH_EVENT, refreshCart);
    return () => window.removeEventListener(REFRESH_EVENT, refreshCart);
  }, [refreshCart]);

  const toggleFavorite = async (id: string): Promise<"login" | "added" | "removed" | "error"> => {
    if (!user) return "login";
    const exists = favorites.includes(id);
    try {
      const res = await fetch(exists ? `/api/favorites?productId=${id}` : "/api/favorites", {
        method: exists ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return "error";
      setFavorites(
        data.data?.favorites
          ? toIds(data.data.favorites)
          : exists
            ? favorites.filter((f) => f !== id)
            : [...favorites, id]
      );
      window.dispatchEvent(new Event(REFRESH_EVENT));
      return exists ? "removed" : "added";
    } catch {
      return "error";
    }
  };

  const addToCart = async (productId: string, quantity = 1): Promise<"login" | "ok" | "error"> => {
    if (!user) return "login";
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return "error";
      window.dispatchEvent(new Event(REFRESH_EVENT));
      return "ok";
    } catch {
      return "error";
    }
  };

  return { user, favorites, cartCount, toggleFavorite, addToCart };
}

export function HeaderIcons({
  locale,
  favoritesCount,
  cartCount,
}: {
  locale: Locale;
  favoritesCount: number;
  cartCount: number;
}) {
  const t = LABELS[locale];
  return (
    <div className="gl-icons">
      <Link href={`/${locale}/favorites`} className="gl-iconbtn" aria-label={t.favorites}>
        <Heart size={20} />
        {favoritesCount > 0 && <b>{favoritesCount}</b>}
      </Link>
      <Link href={`/${locale}/cart`} className="gl-iconbtn" aria-label={t.cart}>
        <ShoppingBag size={20} />
        {cartCount > 0 && <b>{cartCount}</b>}
      </Link>
    </div>
  );
}

export const BASE_CSS = `
.gl-store{--w:#8b1538;--wd:#6e0f2c;--pk:#f4b6c2;--soft:#fbe4e8;--blush:#fdf1f3;--ink:#2a1a1f;--mu:#7a6a6f;--ln:#f0dfe3;--card:#fff;--bg:#fff;--side:#fbf6f7;--top:96px;
 min-height:100vh;background:var(--bg);color:var(--ink);padding-top:var(--top)}
.dark .gl-store{--w:#e27794;--wd:#c65777;--soft:#2a1620;--blush:#1c1219;--ink:#f7edf0;--mu:#aa9da3;--ln:#2b2028;--card:#0f1420;--bg:#050505;--side:#0b0f19}
.gl-store a{color:inherit;text-decoration:none}
.gl-store button{font:inherit;cursor:pointer}
.gl-serif{font-family:"Playfair Display",Georgia,"Times New Roman",serif}
.gl-icons{display:flex;gap:8px}
.gl-iconbtn{position:relative;width:46px;height:46px;border:1px solid var(--ln);border-radius:12px;background:var(--card);color:var(--w);display:grid;place-items:center;transition:border-color .2s,background .2s}
.gl-iconbtn:hover{border-color:var(--w);background:var(--blush)}
.gl-iconbtn b{position:absolute;top:-6px;inset-inline-end:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--w);color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center}
.gl-toast{position:fixed;z-index:200;bottom:24px;inset-inline-end:24px;max-width:calc(100vw - 40px);padding:13px 18px;border-radius:12px;background:#24151b;color:#fff;font-size:13px;font-weight:700;box-shadow:0 18px 44px rgba(0,0,0,.25)}
.gl-stars{display:inline-flex;gap:2px;color:#e8a317}
@media (prefers-reduced-motion:reduce){.gl-store *{transition:none!important;animation:none!important}}
`;


/* ------------------------------------------------------------------ */
/* Cart + order summary (shared by cart and checkout pages)            */
/* ------------------------------------------------------------------ */

export const SHIPPING_FEE = 60; // EGP - keep in sync with your server-side order total
export const REFRESH_EVENT = "glamora:refresh-navbar";

export type CartItem = {
  quantity: number;
  product: {
    id: string;
    name: string;
    brand?: string;
    price: number;
    discountPrice?: number | null;
    images?: { url: string }[];
    stock: number;
  };
};

export const unitPrice = (item: CartItem) => item.product.discountPrice ?? item.product.price;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const sync = (cart: unknown) => setItems(Array.isArray(cart) ? (cart as CartItem[]) : []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.status === 401) return setNeedLogin(true);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      sync(data.data?.cart);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = async (method: "PATCH" | "DELETE", productId: string, quantity?: number) => {
    setBusy(productId);
    try {
      const res = await fetch("/api/cart", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return false;
      sync(data.data?.cart);
      window.dispatchEvent(new Event(REFRESH_EVENT));
      return true;
    } catch {
      return false;
    } finally {
      setBusy(null);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const shipping = items.length ? SHIPPING_FEE : 0;

  return {
    items, loading, error, needLogin, busy, subtotal, count, shipping, total: subtotal + shipping,
    reload: load,
    clear: () => setItems([]),
    update: (id: string, q: number) => mutate("PATCH", id, q),
    remove: (id: string) => mutate("DELETE", id),
  };
}

const SUM: Record<Locale, Record<string, string>> = {
  en: {
    summary: "Order Summary", subtotal: "Subtotal", shipping: "Shipping", total: "Total",
    cod: "Cash on Delivery", codText: "Pay when you receive your order",
    card: "Card Payment", soon: "Coming soon",
  },
  ar: {
    summary: "ملخص الطلب", subtotal: "المجموع الفرعي", shipping: "الشحن", total: "الإجمالي",
    cod: "الدفع عند الاستلام", codText: "ادفع عند استلام طلبك",
    card: "الدفع بالبطاقة", soon: "قريبًا",
  },
};

export function SummaryPanel({
  locale, subtotal, shipping, top, action,
}: {
  locale: Locale;
  subtotal: number;
  shipping: number;
  top?: React.ReactNode;
  action: React.ReactNode;
}) {
  const s = SUM[locale];
  const egp = LABELS[locale].egp;
  const money = (n: number) => `${formatPrice(n, locale)} ${egp}`;
  return (
    <aside className="gs-panel">
      <h2>{s.summary}</h2>
      {top}
      <div className="gs-row"><span>{s.subtotal}</span><span>{money(subtotal)}</span></div>
      <div className="gs-row"><span>{s.shipping}</span><span>{money(shipping)}</span></div>
      <div className="gs-total"><span>{s.total}</span><strong>{money(subtotal + shipping)}</strong></div>
      {action}
      <div className="gs-pay on">
        <Banknote size={26} />
        <div><b>{s.cod}</b><span>{s.codText}</span></div>
      </div>
      <div className="gs-pay off">
        <CreditCard size={26} />
        <div><b>{s.card}</b><span>{s.soon}</span></div>
      </div>
    </aside>
  );
}

export const SUMMARY_CSS = `
.gs-panel{position:sticky;top:calc(var(--top) + 16px);padding:26px 24px;border-radius:16px;background:color-mix(in srgb,var(--soft) 55%,var(--card))}
.gs-panel h2{margin:0 0 22px;font-size:20px;font-weight:800}
.gs-row{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px;color:var(--mu);font-size:15px}
.gs-total{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:18px 0 26px;padding-top:18px;border-top:1px solid color-mix(in srgb,var(--w) 14%,transparent)}
.gs-total span{font-size:16px;font-weight:800}
.gs-total strong{color:var(--w);font-size:24px;font-weight:800}
.gs-btn{width:100%;height:54px;display:flex;align-items:center;justify-content:center;gap:10px;border:0;border-radius:9px;background:var(--w);color:#fff;font-size:16px;font-weight:800;box-shadow:0 8px 20px rgba(139,21,56,.22);transition:background .2s}
.gs-btn:hover:not(:disabled){background:var(--wd)}
.gs-btn:disabled{background:#a6a0a3;box-shadow:none;cursor:not-allowed}
.gs-pay{display:flex;align-items:center;gap:14px;margin-top:14px;padding:16px;border-radius:10px;border:1px solid var(--pk);background:color-mix(in srgb,var(--card) 40%,transparent);color:var(--w)}
.gs-pay b{display:block;font-size:15px;font-weight:800}
.gs-pay span{display:block;margin-top:2px;color:var(--mu);font-size:12px}
.gs-pay.off{opacity:.55;border-color:var(--ln);color:var(--mu)}
@media (max-width:900px){.gs-panel{position:static}}
`;