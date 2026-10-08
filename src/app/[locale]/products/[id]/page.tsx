"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Minus, Package, Plus, ShoppingBag, Star } from "lucide-react";
import {
  BASE_CSS, HeaderIcons, LABELS, currencyLabel, formatPrice, useStore, useToast,
  type Locale, type Product,
} from "../../../../lib/sharedc";

type Tab = "description" | "ingredients" | "reviews";

export default function ProductDetailsPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const t = LABELS[locale];
  const id = String(params.id);

  const store = useStore();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("description");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        if (alive) setProduct(data.data.product);
      } catch (e) {
        console.error(e);
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const discount = useMemo(() => {
    if (!product?.discountPrice || product.discountPrice >= product.price) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }, [product]);

  const Back = isAr ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
        <style>{BASE_CSS + CSS}</style>
        <div className="gd-wrap">
          <div className="gd-skel" style={{ width: 320, height: 18, marginBottom: 28 }} />
          <div className="gd-grid">
            <div className="gd-skel" style={{ aspectRatio: "1/1" }} />
            <div className="gd-skel" style={{ height: 520 }} />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
        <style>{BASE_CSS + CSS}</style>
        <div className="gd-error">
          <Package size={40} />
          <h1>{t.notFound}</h1>
          <p>{t.notFoundText}</p>
          <Link href={`/${locale}/products`} className="gd-btn primary" style={{ maxWidth: 260 }}>
            <Back size={18} /> {t.back}
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images ?? [];
  const price = product.discountPrice ?? product.price;
  const out = product.stock <= 0;
  const low = !out && !!product.lowStockThreshold && product.stock <= product.lowStockThreshold;
  const fav = store.favorites.includes(product.id);
  const catLabel = product.category === "skincare" ? t.skincare : t.makeup;
  const suitable = [
    ...(product.skinTypes ?? []).map((s) => (s === "all" ? t.all : t[s] || s)),
    ...(product.concerns ?? []).map((c) => t[c] || c),
  ];
  const age = product.suitableForAge;
  const hasAge = age && (age.min !== undefined || age.max !== undefined);
  const facts = [
    product.size && `${t.size}: ${product.size}`,
    product.shade && `${t.shade}: ${product.shade}`,
    hasAge &&
      `${t.age}: ${age!.min !== undefined ? `${t.from} ${age!.min} ` : ""}${age!.max !== undefined ? `${t.to} ${age!.max} ` : ""}${t.years}`,
    product.sku && `${t.sku}: ${product.sku}`,
  ].filter(Boolean) as string[];

  const onFavorite = async () => {
    const r = await store.toggleFavorite(product.id);
    toast.show(
      r === "login" ? t.loginFirst : r === "added" ? t.favAdded : r === "removed" ? t.favRemoved : t.cartError
    );
  };

  const onCart = async () => {
    const r = await store.addToCart(product.id, quantity);
    toast.show(r === "login" ? t.loginFirst : r === "ok" ? t.cartAdded : t.cartError);
  };

  return (
    <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
      <style>{BASE_CSS + CSS}</style>

      <div className="gd-wrap">
        <div className="gd-top">
          <nav className="gd-crumbs" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{t.home}</Link>
            <ChevronRight size={14} />
            <Link href={`/${locale}/products`}>{t.products}</Link>
            <ChevronRight size={14} />
            <Link href={`/${locale}/products?category=${product.category}`}>{catLabel}</Link>
            <ChevronRight size={14} />
            <b>{product.name}</b>
          </nav>
          <HeaderIcons locale={locale} favoritesCount={store.favorites.length} cartCount={store.cartCount} />
        </div>

        <div className="gd-grid">
          <section className="gd-gallery">
            <div className="gd-main">
              {discount > 0 && <span className="gd-disc">-{discount}%</span>}
              <button type="button" className={`gd-heart ${fav ? "on" : ""}`} onClick={onFavorite} aria-label={t.favorites}>
                <Heart size={20} fill={fav ? "currentColor" : "none"} />
              </button>
              {images[selected]?.url ? (
                <img src={images[selected].url} alt={product.name} />
              ) : (
                <span className="gd-noimg"><ShoppingBag size={48} /></span>
              )}
            </div>

            {images.length > 1 && (
              <div className="gd-thumbs">
                {images.map((img, i) => (
                  <button key={`${img.url}-${i}`} type="button" className={i === selected ? "on" : ""}
                    onClick={() => setSelected(i)} aria-label={`${product.name} ${i + 1}`}>
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="gd-info">
            <p className="gd-brand">{product.brand}</p>
            <h1 className="gl-serif">{product.name}</h1>

            <div className="gd-priceline">
              <div className="gd-price">
                <strong>{formatPrice(price, locale)} {currencyLabel(product, locale)}</strong>
                {discount > 0 && <s>{formatPrice(product.price, locale)}</s>}
              </div>
              <div className="gd-rating">
                <span className="gl-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill={s <= Math.round(product.rating || 0) ? "currentColor" : "none"} />
                  ))}
                </span>
                <b>{(product.rating || 0).toFixed(1)}</b>
                <span>({product.reviewsCount || 0} {t.reviewsWord})</span>
              </div>
            </div>

            {product.description && <p className="gd-desc">{product.description}</p>}

            {suitable.length > 0 && (
              <div className="gd-block">
                <h3>{t.suitableFor}</h3>
                <div className="gd-tags">{suitable.map((s) => <span key={s}>{s}</span>)}</div>
              </div>
            )}

            {!!product.benefits?.length && (
              <div className="gd-block">
                <h3>{t.keyBenefits}</h3>
                <ul className="gd-benefits">
                  {product.benefits.map((b) => (
                    <li key={b}><span><Check size={13} strokeWidth={3} /></span>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className={`gd-stock ${out ? "out" : low ? "low" : ""}`}>
              <i />
              {out ? t.outOfStock : low ? t.onlyLeft.replace("{n}", String(product.stock)) : t.inStock}
            </p>

            <div className="gd-block">
              <h3>{t.quantity}</h3>
              <div className="gd-qty">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || out} aria-label="-"><Minus size={16} /></button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || out} aria-label="+"><Plus size={16} /></button>
              </div>
            </div>

            <button type="button" className="gd-btn primary" onClick={onCart} disabled={out}>
              <ShoppingBag size={19} /> {out ? t.outOfStock : t.addToCart}
            </button>
            <button type="button" className={`gd-btn ghost ${fav ? "on" : ""}`} onClick={onFavorite}>
              <Heart size={19} fill={fav ? "currentColor" : "none"} /> {fav ? t.inWishlist : t.addToWishlist}
            </button>
          </section>
        </div>

        <section className="gd-tabs">
          <div className="gd-tabbar" role="tablist">
            {([
              ["description", t.description],
              ["ingredients", t.ingredients],
              ["reviews", `${t.reviews} (${product.reviewsCount || 0})`],
            ] as [Tab, string][]).map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key}
                className={tab === key ? "on" : ""} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className="gd-panel">
            {tab === "description" && (
              <>
                {product.description && <p>{product.description}</p>}
                {facts.length > 0 && (
                  <ul>{facts.map((f) => <li key={f}>{f}</li>)}</ul>
                )}
                {product.howToUse && (
                  <>
                    <h4>{t.howToUse}</h4>
                    <p>{product.howToUse}</p>
                  </>
                )}
              </>
            )}

            {tab === "ingredients" &&
              (product.ingredients?.length ? (
                <ul>{product.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
              ) : (
                <p>{t.noIngredients}</p>
              ))}

            {tab === "reviews" && (
              <div className="gd-reviews">
                <strong>{(product.rating || 0).toFixed(1)}</strong>
                <div>
                  <span className="gl-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill={s <= Math.round(product.rating || 0) ? "currentColor" : "none"} />
                    ))}
                  </span>
                  <p>{product.reviewsCount || 0} {t.reviewsWord}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {toast.message && <div className="gl-toast">{toast.message}</div>}
    </main>
  );
}

const CSS = `
.gd-wrap{max-width:1180px;margin:0 auto;padding:22px 24px 80px}
.gd-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:26px;flex-wrap:wrap}
.gd-crumbs{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--mu)}
.gd-crumbs a:hover{color:var(--w)}
.gd-crumbs b{color:var(--w);font-weight:700}
[dir=rtl] .gd-crumbs svg{transform:scaleX(-1)}
.gd-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:44px;align-items:start}
.gd-main{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;background:var(--soft)}
.gd-main img{width:100%;height:100%;object-fit:cover}
.gd-noimg{height:100%;display:grid;place-items:center;color:var(--w)}
.gd-disc{position:absolute;top:16px;inset-inline-start:16px;z-index:2;padding:6px 12px;border-radius:999px;background:var(--w);color:#fff;font-size:13px;font-weight:800}
.gd-heart{position:absolute;top:16px;inset-inline-end:16px;z-index:2;width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,255,255,.9);color:var(--w);display:grid;place-items:center;transition:transform .2s}
.gd-heart:hover{transform:scale(1.08)}
.gd-heart.on{background:var(--w);color:#fff}
.gd-thumbs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:16px}
.gd-thumbs button{aspect-ratio:1/1;padding:0;border:2px solid transparent;border-radius:12px;overflow:hidden;background:var(--soft)}
.gd-thumbs button.on{border-color:var(--w)}
.gd-thumbs img{width:100%;height:100%;object-fit:cover;display:block}
.gd-brand{margin:0 0 6px;color:var(--mu);font-size:13px;font-weight:700}
.gd-info h1{margin:0;font-size:clamp(30px,4vw,40px);line-height:1.2;font-weight:700}
.gd-priceline{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:18px 0}
.gd-price strong{color:var(--w);font-size:32px;font-weight:800}
.gd-price s{margin-inline-start:10px;color:var(--mu);font-size:15px}
.gd-rating{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--mu)}
.gd-rating b{color:var(--ink)}
.gd-desc{margin:0 0 22px;color:var(--mu);font-size:15px;line-height:1.85}
.gd-block{margin-bottom:22px}
.gd-block h3{margin:0 0 12px;font-size:16px;font-weight:800}
.gd-tags{display:flex;flex-wrap:wrap;gap:10px}
.gd-tags span{padding:9px 16px;border-radius:999px;background:var(--soft);color:var(--w);font-size:13px;font-weight:600}
.gd-benefits{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.gd-benefits li{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--mu)}
.gd-benefits li span{width:24px;height:24px;flex:0 0 24px;border-radius:50%;background:var(--w);color:#fff;display:grid;place-items:center}
.gd-stock{display:flex;align-items:center;gap:8px;margin:0 0 20px;font-size:13px;font-weight:700;color:#2f8f5b}
.gd-stock i{width:9px;height:9px;border-radius:50%;background:currentColor}
.gd-stock.low{color:#b8820d}.gd-stock.out{color:#c33d4b}
.gd-qty{display:inline-flex;align-items:stretch;height:48px;border:1px solid var(--ln);border-radius:8px;overflow:hidden;background:var(--card)}
.gd-qty button{width:48px;border:0;background:var(--side);color:var(--w);display:grid;place-items:center}
.gd-qty button:disabled{opacity:.4;cursor:not-allowed}
.gd-qty span{min-width:96px;display:grid;place-items:center;font-weight:700}
.gd-btn{width:100%;height:54px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:9px;font-size:16px;font-weight:800;transition:.2s}
.gd-btn.primary{border:0;background:var(--w);color:#fff;box-shadow:0 8px 20px rgba(139,21,56,.22)}
.gd-btn.primary:hover:not(:disabled){background:var(--wd)}
.gd-btn.primary:disabled{background:#a6a0a3;box-shadow:none;cursor:not-allowed}
.gd-btn.ghost{border:1.5px solid var(--pk);background:var(--blush);color:var(--w)}
.gd-btn.ghost:hover,.gd-btn.ghost.on{background:var(--soft);border-color:var(--w)}
.gd-tabs{margin-top:56px}
.gd-tabbar{display:flex;gap:34px;padding:0 6px;overflow-x:auto}
.gd-tabbar button{padding:14px 2px;border:0;border-bottom:2px solid transparent;background:none;color:var(--mu);font-size:16px;font-weight:700;white-space:nowrap}
.gd-tabbar button.on{color:var(--w);border-bottom-color:var(--w)}
.gd-panel{padding:26px 28px;border-radius:0 0 12px 12px;background:var(--side);color:var(--mu);font-size:15px;line-height:1.85}
.gd-panel p{margin:0 0 14px}
.gd-panel h4{margin:18px 0 6px;color:var(--ink);font-size:15px}
.gd-panel ul{margin:0;padding-inline-start:26px}
.gd-panel li{margin-bottom:6px}
.gd-reviews{display:flex;align-items:center;gap:18px}
.gd-reviews strong{color:var(--ink);font-size:44px;font-weight:800}
.gd-reviews p{margin:4px 0 0}
.gd-error{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:40px 20px}
.gd-error svg{color:var(--w)}.gd-error h1{margin:6px 0 0;font-size:26px}.gd-error p{margin:0 0 14px;color:var(--mu)}
.gd-error .gd-btn{text-decoration:none}
.gd-skel{border-radius:14px;background:linear-gradient(90deg,var(--soft),var(--ln),var(--soft));background-size:200% 100%;animation:gdsh 1.3s infinite}
@keyframes gdsh{to{background-position:-200% 0}}
@media (max-width:900px){.gd-grid{grid-template-columns:1fr;gap:28px}}
@media (max-width:520px){.gd-wrap{padding:16px 14px 60px}.gd-thumbs{gap:8px}.gd-price strong{font-size:27px}.gd-panel{padding:20px 16px}.gd-tabbar{gap:20px}}
`;