"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Heart, ShoppingBag, Star } from "lucide-react";
import {
  BASE_CSS, LABELS, REFRESH_EVENT, currencyLabel, formatPrice, useStore, useToast,
  type Locale, type Product,
} from "../../../lib/sharedids";

const T = {
  en: {
    title: "Your Wishlist", items: "items", empty: "Your wishlist is empty",
    emptyText: "Tap the heart on any product to save it here.", browse: "Browse Products",
    login: "Log in to see your wishlist", loginBtn: "Log in", error: "We couldn't load your wishlist.",
    retry: "Try again", removed: "Removed from wishlist", remove: "Remove from wishlist",
    addCart: "Add to Cart", unavailable: "Out of stock", continue: "Continue Shopping",
  },
  ar: {
    title: "المفضلة", items: "منتجات", empty: "قائمة المفضلة فارغة",
    emptyText: "اضغط على القلب في أي منتج لحفظه هنا.", browse: "تصفح المنتجات",
    login: "سجّل الدخول لعرض المفضلة", loginBtn: "تسجيل الدخول", error: "تعذر تحميل المفضلة.",
    retry: "إعادة المحاولة", removed: "تمت الإزالة من المفضلة", remove: "إزالة من المفضلة",
    addCart: "أضف إلى السلة", unavailable: "نفد المخزون", continue: "متابعة التسوق",
  },
};

export default function FavoritesPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const t = T[locale];
  const l = LABELS[locale];

  const store = useStore();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const favRes = await fetch("/api/favorites", { cache: "no-store" });
      if (favRes.status === 401) return setNeedLogin(true);
      const favData = await favRes.json();
      if (!favRes.ok || !favData.success) throw new Error(favData.message);

      const raw: unknown[] = favData.data?.favorites ?? [];
      const ids = raw
        .map((f) => (typeof f === "string" ? f : String((f as { id?: string; _id?: string })?.id ?? (f as { _id?: string })?._id ?? "")))
        .filter(Boolean);

      if (!ids.length) return setProducts([]);

      const res = await fetch(`/api/products?ids=${ids.join(",")}&limit=50`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      // keep the order of the favorites list
      const byId = new Map<string, Product>(data.data.products.map((p: Product) => [p.id, p]));
      setProducts(ids.map((id) => byId.get(id)).filter(Boolean) as Product[]);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFavorite = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/favorites?productId=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setProducts((list) => list.filter((p) => p.id !== id));
      window.dispatchEvent(new Event(REFRESH_EVENT));
      toast.show(t.removed);
    } catch (e) {
      console.error(e);
      toast.show(l.cartError);
    } finally {
      setBusy(null);
    }
  };

  const onCart = async (id: string) => {
    const r = await store.addToCart(id, 1);
    toast.show(r === "login" ? l.loginFirst : r === "ok" ? l.cartAdded : l.cartError);
  };

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const state = (icon: React.ReactNode, title: string, text: string, action: React.ReactNode) => (
    <div className="gf-state">
      {icon}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );

  let body: React.ReactNode;

  if (loading) {
    body = (
      <div className="gf-grid">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="gf-skel" />)}
      </div>
    );
  } else if (needLogin) {
    body = state(<Heart size={38} />, t.login, "",
      <Link href={`/${locale}/login?redirect=/${locale}/favorites`} className="gf-btn solid">{t.loginBtn}</Link>);
  } else if (error) {
    body = state(<AlertCircle size={38} />, t.error, "",
      <button type="button" className="gf-btn solid" onClick={load}>{t.retry}</button>);
  } else if (products.length === 0) {
    body = state(<Heart size={38} />, t.empty, t.emptyText,
      <Link href={`/${locale}/products`} className="gf-btn solid">{t.browse} <Arrow size={17} /></Link>);
  } else {
    body = (
      <>
        <div className="gf-grid">
          {products.map((p) => {
            const price = p.discountPrice ?? p.price;
            const out = p.stock <= 0;
            return (
              <article className="gf-card" key={p.id}>
                <div className="gf-media">
                  <Link href={`/${locale}/products/${p.id}`} aria-label={p.name}>
                    {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} loading="lazy" /> : <span className="gf-noimg"><ShoppingBag size={32} /></span>}
                  </Link>
                  {out && <em>{l.outOfStock}</em>}
                  <button type="button" className="gf-heart" onClick={() => removeFavorite(p.id)}
                    disabled={busy === p.id} aria-label={t.remove}>
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>

                <Link href={`/${locale}/products/${p.id}`} className="gf-name">{p.name}</Link>
                <p className="gf-brand">{p.brand}</p>

                <div className="gf-price">
                  <strong>{formatPrice(price, locale)} {currencyLabel(p, locale)}</strong>
                  {p.discountPrice != null && p.discountPrice < p.price && <s>{formatPrice(p.price, locale)}</s>}
                </div>

                <div className="gf-rate">
                  <Star size={13} fill="currentColor" />
                  <b>{(p.rating || 0).toFixed(1)}</b>
                  <span>({p.reviewsCount || 0})</span>
                </div>

                <button type="button" className="gf-btn solid full" disabled={out} onClick={() => onCart(p.id)}>
                  <ShoppingBag size={17} /> {out ? t.unavailable : t.addCart}
                </button>
              </article>
            );
          })}
        </div>

        <Link href={`/${locale}/products`} className="gf-continue">
          {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />} {t.continue}
        </Link>
      </>
    );
  }

  return (
    <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
      <style>{BASE_CSS + CSS}</style>
      <div className="gf-wrap">
        <h1>
          {t.title}
          {!loading && products.length > 0 && <span> ({formatPrice(products.length, locale)} {t.items})</span>}
        </h1>
        {body}
      </div>
      {toast.message && <div className="gl-toast">{toast.message}</div>}
    </main>
  );
}

const CSS = `
.gf-wrap{max-width:1180px;margin:0 auto;padding:26px 24px 80px}
.gf-wrap h1{margin:0 0 26px;font-size:26px;font-weight:800}
.gf-wrap h1 span{color:var(--mu);font-size:20px;font-weight:600}
.gf-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px 22px}
.gf-card{min-width:0;display:flex;flex-direction:column}
.gf-media{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;background:var(--soft)}
.gf-media a{display:block;height:100%}
.gf-media img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.gf-card:hover .gf-media img{transform:scale(1.04)}
.gf-noimg{height:100%;display:grid;place-items:center;color:var(--w)}
.gf-media em{position:absolute;bottom:10px;inset-inline-start:10px;padding:4px 10px;border-radius:7px;background:rgba(36,21,27,.85);color:#fff;font-size:11px;font-style:normal;font-weight:700}
.gf-heart{position:absolute;top:10px;inset-inline-end:10px;width:36px;height:36px;border:0;border-radius:50%;background:var(--w);color:#fff;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.1);transition:transform .2s}
.gf-heart:hover:not(:disabled){transform:scale(1.08)}
.gf-heart:disabled{opacity:.5;cursor:wait}
.gf-name{margin-top:14px;min-height:44px;font-size:15px;font-weight:600;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gf-name:hover{color:var(--w)}
.gf-brand{margin:2px 0 0;color:var(--mu);font-size:12px}
.gf-price{margin-top:8px}
.gf-price strong{color:var(--w);font-size:18px;font-weight:800}
.gf-price s{margin-inline-start:8px;color:var(--mu);font-size:12px}
.gf-rate{display:flex;align-items:center;gap:5px;margin-top:6px;font-size:13px;color:#e8a317}
.gf-rate b{color:var(--ink);font-weight:700}
.gf-rate span{color:var(--mu);font-size:12px}
.gf-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 24px;border-radius:9px;border:0;font-size:14px;font-weight:800;transition:background .2s}
.gf-btn.solid{background:var(--w);color:#fff;box-shadow:0 8px 20px rgba(139,21,56,.2)}
.gf-btn.solid:hover:not(:disabled){background:var(--wd)}
.gf-btn:disabled{background:#a6a0a3;box-shadow:none;cursor:not-allowed}
.gf-btn.full{width:100%;margin-top:14px}
.gf-continue{display:inline-flex;align-items:center;gap:10px;margin-top:38px;color:var(--w);font-weight:800}
.gf-continue:hover{text-decoration:underline}
.gf-state{min-height:400px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;color:var(--mu)}
.gf-state svg{color:var(--w);margin-bottom:6px}
.gf-state h2{margin:0;color:var(--ink);font-size:21px}
.gf-state p{margin:0 0 14px}
.gf-skel{aspect-ratio:1/1.25;border-radius:14px;background:linear-gradient(90deg,var(--soft),var(--ln),var(--soft));background-size:200% 100%;animation:gfsh 1.3s infinite}
@keyframes gfsh{to{background-position:-200% 0}}
@media (max-width:1000px){.gf-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:720px){.gf-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 12px}.gf-wrap{padding:18px 14px 60px}.gf-name{font-size:13px;min-height:38px}.gf-price strong{font-size:15px}}
`;