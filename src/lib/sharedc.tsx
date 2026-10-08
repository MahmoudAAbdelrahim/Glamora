"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
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
      const items: { quantity?: number }[] = root.items ?? root.products ?? [];
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
      refreshCart();
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