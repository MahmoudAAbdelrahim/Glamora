"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Search, ShoppingBag, SlidersHorizontal, Star, X,
} from "lucide-react";
import {
  BASE_CSS, CONCERNS, HeaderIcons, LABELS, SKIN_TYPES, currencyLabel, formatPrice,
  useStore, useToast, type Locale, type Product,
} from "../../../lib/sharedc";

type Draft = { skinTypes: string[]; brands: string[]; concerns: string[]; min: number; max: number };
type Applied = { skinTypes: string[]; brands: string[]; concerns: string[]; min: number | null; max: number | null };

const emptyApplied: Applied = { skinTypes: [], brands: [], concerns: [], min: null, max: null };
const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export default function ProductsPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const t = LABELS[locale];

  const store = useStore();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [bound, setBound] = useState(2000);
  const [draft, setDraft] = useState<Draft>({ skinTypes: [], brands: [], concerns: [], min: 0, max: 2000 });
  const [applied, setApplied] = useState<Applied>(emptyApplied);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("best-selling");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
  if (!drawer) return;

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setDrawer(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.overflow = previousOverflow;
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [drawer]);
  const [moreConcerns, setMoreConcerns] = useState(false);
  const [boundReady, setBoundReady] = useState(false);

  // Read ?category= from the URL (used by the breadcrumb link on the details page)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c === "skincare" || c === "makeup") setCategory(c);
  }, []);

  // Debounced search
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: "12", sort });
      if (search) q.set("search", search);
      if (category) q.set("category", category);
      if (applied.skinTypes.length) q.set("skinType", applied.skinTypes.join(","));
      if (applied.concerns.length) q.set("concern", applied.concerns.join(","));
      if (applied.brands.length) q.set("brand", applied.brands.join(","));
      if (applied.min !== null) q.set("minPrice", String(applied.min));
      if (applied.max !== null) q.set("maxPrice", String(applied.max));

      const res = await fetch(`/api/products?${q}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      setProducts(data.data.products);
      setTotal(data.data.pagination.total);
      setTotalPages(data.data.pagination.totalPages || 1);
      setBrands(data.data.filters?.brands ?? []);

      if (!boundReady) {
        const b = Math.max(100, Math.ceil((data.data.filters?.maxPrice || 0) / 100) * 100);
        setBound(b);
        setDraft((d) => ({ ...d, max: b }));
        setBoundReady(true);
      }
    } catch (e) {
      console.error(e);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category, applied, boundReady]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFilters = () => {
    setApplied({
      skinTypes: draft.skinTypes,
      brands: draft.brands,
      concerns: draft.concerns,
      min: draft.min > 0 ? draft.min : null,
      max: draft.max < bound ? draft.max : null,
    });
    setPage(1);
    setDrawer(false);
  };

  const clearAll = () => {
    setDraft({ skinTypes: [], brands: [], concerns: [], min: 0, max: bound });
    setApplied(emptyApplied);
    setCategory("");
    setSearchInput("");
    setPage(1);
  };

  const onFavorite = async (id: string) => {
    const r = await store.toggleFavorite(id);
    toast.show(
      r === "login" ? t.loginFirst : r === "added" ? t.favAdded : r === "removed" ? t.favRemoved : t.cartError
    );
  };

  const onCart = async (id: string) => {
    const r = await store.addToCart(id, 1);
    if (r === "login") {
      window.location.href = `/${locale}/login?redirect=/${locale}/products`;
      return;
    }
    toast.show(r === "ok" ? t.cartAdded : t.cartError);
  };

  const activeCount =
    applied.skinTypes.length + applied.brands.length + applied.concerns.length +
    (applied.min !== null || applied.max !== null ? 1 : 0);

  const concernList = moreConcerns ? CONCERNS : CONCERNS.slice(0, 6);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  const Next = isAr ? ArrowLeft : ArrowRight;
  const Prev = isAr ? ArrowRight : ArrowLeft;

  const pct = (v: number) => `${(v / bound) * 100}%`;

  return (
    <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
      <style>{BASE_CSS + CSS}</style>

      <div className="gl-list">
        {drawer && <div className="gl-scrim" onClick={() => setDrawer(false)} />}

<aside
  id="products-filter-drawer"
  className={`gl-side ${drawer ? "open" : ""}`}
  aria-hidden={!drawer}
>          <div className="gl-side-head">
            <h2>{t.filters}</h2>
            <button type="button" className="gl-link" onClick={clearAll}>{t.clearAll}</button>
            <button type="button" className="gl-close" onClick={() => setDrawer(false)} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <FilterGroup title={t.skinType}>
            {SKIN_TYPES.map((s) => (
              <Check_ key={s} label={t[s]} checked={draft.skinTypes.includes(s)}
                onChange={() => setDraft((d) => ({ ...d, skinTypes: toggleIn(d.skinTypes, s) }))} />
            ))}
          </FilterGroup>

          <FilterGroup title={t.budget}>
            <div className="gl-range">
              <div className="gl-track">
                <i style={{ insetInlineStart: pct(draft.min), width: `calc(${pct(draft.max)} - ${pct(draft.min)})` }} />
              </div>
              <input type="range" min={0} max={bound} step={50} value={draft.min} aria-label="Min"
                onChange={(e) => setDraft((d) => ({ ...d, min: Math.min(Number(e.target.value), d.max - 50) }))} />
              <input type="range" min={0} max={bound} step={50} value={draft.max} aria-label="Max"
                onChange={(e) => setDraft((d) => ({ ...d, max: Math.max(Number(e.target.value), d.min + 50) }))} />
            </div>
            <p className="gl-range-text">
              {formatPrice(draft.min, locale)} {t.egp} - {formatPrice(draft.max, locale)} {t.egp}
            </p>
          </FilterGroup>

          {brands.length > 0 && (
            <FilterGroup title={t.brand}>
              {brands.map((b) => (
                <Check_ key={b} label={b} checked={draft.brands.includes(b)}
                  onChange={() => setDraft((d) => ({ ...d, brands: toggleIn(d.brands, b) }))} />
              ))}
            </FilterGroup>
          )}

          <FilterGroup title={t.concern}>
            {concernList.map((c) => (
              <Check_ key={c} label={t[c]} checked={draft.concerns.includes(c)}
                onChange={() => setDraft((d) => ({ ...d, concerns: toggleIn(d.concerns, c) }))} />
            ))}
            <button type="button" className="gl-link more" onClick={() => setMoreConcerns((v) => !v)}>
              {moreConcerns ? t.showLess : t.showMore}
            </button>
          </FilterGroup>

          <button type="button" className="gl-apply" onClick={applyFilters}>{t.apply}</button>
        </aside>

        <section className="gl-main">
          <div className="gl-bar">
            <label className="gl-search">
              <Search size={19} />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder} />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear"><X size={16} /></button>
              )}
            </label>

            <label className="gl-sort">
              <span>{t.sortBy}:</span>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                <option value="best-selling">{t.popular}</option>
                <option value="newest">{t.newest}</option>
                <option value="price-low">{t.priceLow}</option>
                <option value="price-high">{t.priceHigh}</option>
                <option value="rating">{t.topRated}</option>
              </select>
              <ChevronDown size={16} />
            </label>

            <HeaderIcons locale={locale} favoritesCount={store.favorites.length} cartCount={store.cartCount} />
          </div>

          <div className="gl-sub">
            <p className="gl-count">{t.showing} {total} {t.productsWord}</p>
            <div className="gl-tabs">
              {[["", isAr ? "الكل" : "All"], ["skincare", t.skincare], ["makeup", t.makeup]].map(([key, label]) => (
                <button key={key} type="button" className={category === key ? "on" : ""}
                  onClick={() => { setCategory(key); setPage(1); }}>
                  {label}
                </button>
              ))}
            </div>
<button
  type="button"
  className="gl-filter-btn"
  onClick={() => setDrawer(true)}
  aria-expanded={drawer}
  aria-controls="products-filter-drawer"
>
               <SlidersHorizontal size={16} /> {t.filtersBtn}
              {activeCount > 0 && <b>{activeCount}</b>}
            </button>
          </div>

          {loading ? (
            <div className="gl-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="gl-skel" key={i}><div /><span /><span /></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="gl-empty">
              <ShoppingBag size={36} />
              <h2>{t.noProducts}</h2>
              <p>{t.noProductsText}</p>
              <button type="button" className="gl-apply" onClick={clearAll}>{t.clearAll}</button>
            </div>
          ) : (
            <div className="gl-grid">
              {products.map((p) => {
                const price = p.discountPrice ?? p.price;
                const fav = store.favorites.includes(p.id);
                const out = p.stock <= 0;
                return (
                  <article className="gl-card" key={p.id}>
                    <div className="gl-media">
                      <Link href={`/${locale}/products/${p.id}`} aria-label={p.name}>
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} loading="lazy" />
                        ) : (
                          <span className="gl-noimg"><ShoppingBag size={34} /></span>
                        )}
                      </Link>
                      {out && <em className="gl-out">{t.outOfStock}</em>}
                      <button type="button" className={`gl-heart ${fav ? "on" : ""}`}
                        onClick={() => onFavorite(p.id)} aria-label={t.favorites}>
                        <Heart size={18} fill={fav ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <Link href={`/${locale}/products/${p.id}`} className="gl-name">{p.name}</Link>
                    <p className="gl-brand">{p.brand}</p>

                    <div className="gl-price">
                      <div>
                        <strong>{formatPrice(price, locale)} {currencyLabel(p, locale)}</strong>
                        {p.discountPrice != null && p.discountPrice < p.price && (
                          <s>{formatPrice(p.price, locale)}</s>
                        )}
                      </div>
                      <button type="button" className="gl-cart" disabled={out}
                        onClick={() => onCart(p.id)} aria-label={t.addToCart}>
                        <ShoppingBag size={17} />
                      </button>
                    </div>

                    <div className="gl-rate">
                      <Star size={13} fill="currentColor" />
                      <b>{(p.rating || 0).toFixed(1)}</b>
                      <span>({p.reviewsCount || 0})</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <nav className="gl-pages" aria-label="Pagination">
              {page > 1 && (
                <button type="button" onClick={() => setPage(page - 1)} aria-label={t.prev}><Prev size={16} /></button>
              )}
              {pages.map((p, i) => (
                <span key={p} className="gl-pg">
                  {i > 0 && p - pages[i - 1] > 1 && <i>…</i>}
                  <button type="button" className={p === page ? "on" : ""} onClick={() => setPage(p)}>
                    {formatPrice(p, locale)}
                  </button>
                </span>
              ))}
              {page < totalPages && (
                <button type="button" onClick={() => setPage(page + 1)} aria-label={t.next}><Next size={16} /></button>
              )}
            </nav>
          )}
        </section>
      </div>

      {toast.message && <div className="gl-toast">{toast.message}</div>}
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="gl-group">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Check_({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="gl-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="box"><Check size={13} strokeWidth={3} /></span>
      {label}
    </label>
  );
}

const CSS = `
.gl-list{display:grid;grid-template-columns:290px minmax(0,1fr);min-height:calc(100vh - var(--top))}
.gl-side{background:var(--side);border-inline-end:1px solid var(--ln);padding:30px 28px 40px}
.gl-side-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:26px}
.gl-side-head h2{margin:0;font-size:16px;font-weight:800}
.gl-close{display:none;border:0;background:none;color:var(--ink)}
.gl-link{border:0;background:none;color:var(--w);font-size:13px;font-weight:700;padding:0}
.gl-link.more{margin-top:6px}
.gl-group{margin-bottom:28px}
.gl-group h3{margin:0 0 14px;font-size:15px;font-weight:800}
.gl-check{display:flex;align-items:center;gap:12px;margin-bottom:13px;font-size:14px;color:var(--ink);cursor:pointer}
.gl-check input{position:absolute;opacity:0;pointer-events:none}
.gl-check .box{width:22px;height:22px;flex:0 0 22px;border:1.5px solid #dccdd1;border-radius:6px;background:var(--card);display:grid;place-items:center;color:transparent;transition:.15s}
.gl-check input:checked+.box{background:var(--w);border-color:var(--w);color:#fff}
.gl-check input:focus-visible+.box{outline:2px solid var(--w);outline-offset:2px}
.gl-range{position:relative;height:24px;margin:6px 2px 0}
.gl-track{position:absolute;top:10px;inset-inline:0;height:4px;border-radius:2px;background:var(--ln)}
.gl-track i{position:absolute;top:0;height:100%;background:var(--w);border-radius:2px}
.gl-range input{position:absolute;inset-inline:0;top:0;width:100%;height:24px;margin:0;background:none;pointer-events:none;-webkit-appearance:none;appearance:none}
.gl-range input::-webkit-slider-thumb{pointer-events:auto;-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--w);border:3px solid var(--card);box-shadow:0 0 0 1px var(--w);cursor:grab}
.gl-range input::-moz-range-thumb{pointer-events:auto;width:14px;height:14px;border-radius:50%;background:var(--w);border:3px solid var(--card);box-shadow:0 0 0 1px var(--w);cursor:grab}
.gl-range-text{margin:12px 0 0;color:var(--mu);font-size:13px}
.gl-apply{width:100%;height:50px;border:0;border-radius:10px;background:var(--w);color:#fff;font-size:15px;font-weight:800;box-shadow:0 8px 20px rgba(139,21,56,.2);transition:background .2s}
.gl-apply:hover{background:var(--wd)}
.gl-empty .gl-apply{width:auto;padding:0 24px}
.gl-main{padding:30px 34px 60px;min-width:0}
.gl-bar{display:flex;gap:14px;align-items:center}
.gl-search{flex:1;height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border:1px solid var(--ln);border-radius:12px;background:var(--side);color:var(--mu)}
.gl-search:focus-within{border-color:var(--w)}
.gl-search input{flex:1;min-width:0;border:0;outline:0;background:none;color:var(--ink);font:inherit;font-size:14px}
.gl-search button{border:0;background:none;color:var(--mu);display:grid}
.gl-sort{position:relative;height:52px;min-width:210px;display:flex;align-items:center;gap:6px;padding:0 14px;border:1px solid var(--ln);border-radius:12px;background:var(--card);font-size:14px;color:var(--ink)}
.gl-sort select{flex:1;min-width:0;border:0;outline:0;background:none;color:var(--ink);font:inherit;font-weight:600;appearance:none;cursor:pointer}
.gl-sort select option{color:#2a1a1f}
.gl-sort svg{pointer-events:none;color:var(--mu)}
.gl-sub{display:flex;align-items:center;gap:14px;margin:26px 0 20px;flex-wrap:wrap}
.gl-count{margin:0;margin-inline-end:auto;font-size:15px;font-weight:600}
.gl-tabs{display:flex;gap:4px;padding:4px;border:1px solid var(--ln);border-radius:10px;background:var(--card)}
.gl-tabs button{height:34px;padding:0 14px;border:0;border-radius:7px;background:none;color:var(--mu);font-size:13px;font-weight:700}
.gl-tabs button.on{background:var(--w);color:#fff}
.gl-filter-btn{display:none;height:42px;align-items:center;gap:7px;padding:0 14px;border:1px solid var(--ln);border-radius:10px;background:var(--card);color:var(--ink);font-size:13px;font-weight:700}
.gl-filter-btn b{min-width:18px;height:18px;border-radius:9px;background:var(--w);color:#fff;font-size:10px;display:grid;place-items:center}
.gl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px 24px}
.gl-card{min-width:0;display:flex;flex-direction:column}
.gl-media{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;background:var(--soft)}
.gl-media a{display:block;height:100%}
.gl-media img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.gl-card:hover .gl-media img{transform:scale(1.04)}
.gl-noimg{height:100%;display:grid;place-items:center;color:var(--w)}
.gl-out{position:absolute;bottom:10px;inset-inline-start:10px;padding:4px 10px;border-radius:7px;background:rgba(36,21,27,.85);color:#fff;font-size:11px;font-style:normal;font-weight:700}
.gl-heart{position:absolute;top:10px;inset-inline-end:10px;width:36px;height:36px;border:0;border-radius:50%;background:#fff;color:var(--w);display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.08);transition:transform .2s}
.gl-heart:hover{transform:scale(1.08)}
.gl-heart.on{background:var(--w);color:#fff}
.gl-name{margin-top:14px;font-size:15px;font-weight:600;line-height:1.45;min-height:44px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gl-name:hover{color:var(--w)}
.gl-brand{margin:2px 0 0;color:var(--mu);font-size:12px}
.gl-price{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}
.gl-price strong{color:var(--w);font-size:18px;font-weight:800}
.gl-price s{margin-inline-start:8px;color:var(--mu);font-size:12px}
.gl-cart{width:38px;height:38px;flex:0 0 38px;border:0;border-radius:50%;background:var(--soft);color:var(--w);display:grid;place-items:center;transition:.2s}
.gl-cart:hover:not(:disabled){background:var(--w);color:#fff}
.gl-cart:disabled{opacity:.4;cursor:not-allowed}
.gl-rate{display:flex;align-items:center;gap:5px;margin-top:6px;font-size:13px;color:#e8a317}
.gl-rate b{color:var(--ink);font-weight:700}
.gl-rate span{color:var(--mu);font-size:12px}
.gl-pages{display:flex;justify-content:center;gap:8px;margin-top:44px}
.gl-pg{display:inline-flex;gap:8px;align-items:center}
.gl-pg i{color:var(--mu);font-style:normal}
.gl-pages button{min-width:44px;height:44px;padding:0 8px;border:1px solid var(--ln);border-radius:9px;background:var(--card);color:var(--ink);font-weight:700;display:grid;place-items:center}
.gl-pages button.on{background:var(--w);border-color:var(--w);color:#fff}
.gl-skel div{aspect-ratio:1/1;border-radius:14px}
.gl-skel span{display:block;height:12px;margin-top:14px;width:70%;border-radius:6px}
.gl-skel span+span{width:40%}
.gl-skel div,.gl-skel span{background:linear-gradient(90deg,var(--soft),var(--ln),var(--soft));background-size:200% 100%;animation:glsh 1.3s infinite}
@keyframes glsh{to{background-position:-200% 0}}
.gl-empty{min-height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--mu)}
.gl-empty svg{color:var(--w);margin-bottom:12px}
.gl-empty h2{margin:0;color:var(--ink);font-size:20px}
.gl-empty p{margin:6px 0 16px}
.gl-scrim{display:none}
@media (max-width:1100px){.gl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* Mobile filter drawer */
@media (max-width: 860px) {
  .gl-list {
    display: block;
    min-height: auto;
  }

  .gl-side {
    position: fixed;
    z-index: 1001;

    top: max(12px, env(safe-area-inset-top));
    bottom: max(12px, env(safe-area-inset-bottom));

    left: 0;
    right: auto;

    width: min(360px, calc(100vw - 28px));
    max-width: calc(100vw - 28px);
    height: auto;
    box-sizing: border-box;

    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;

    padding: 24px 20px 28px;
    background: var(--side);
    border: 1px solid var(--ln);
    border-radius: 18px;

    visibility: hidden;
    pointer-events: none;
    transform: translateX(-110%);
    transition:
      transform 0.28s ease,
      visibility 0.28s ease;

    box-shadow: 0 20px 60px rgba(36, 21, 27, 0.2);
  }

  /* RTL: افتح القائمة من اليمين */
  [dir="rtl"] .gl-side {
    left: auto;
    right: 0;
    transform: translateX(110%);
  }

  /* القائمة ظاهرة بالكامل */
  .gl-side.open {
    visibility: visible;
    pointer-events: auto;
    transform: translateX(0);
  }

  .gl-side-head {
    position: sticky;
    top: -24px;
    z-index: 5;

    display: flex;
    align-items: center;
    gap: 10px;

    margin: -24px -20px 24px;
    padding: 20px;
    background: var(--side);
    border-bottom: 1px solid var(--ln);
  }

  .gl-side-head h2 {
    flex: 1;
    min-width: 0;
    font-size: 17px;
  }

  .gl-close {
    display: grid;
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    place-items: center;

    border: 1px solid var(--ln);
    border-radius: 12px;
    background: var(--card);
    color: var(--ink);
    cursor: pointer;
  }

  .gl-close:hover {
    background: var(--w);
    color: #fff;
  }

  .gl-scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1000;

    background: rgba(30, 20, 35, 0.58);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .gl-filter-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .gl-main {
    min-width: 0;
    padding: 20px 14px 50px;
  }

  .gl-bar {
    flex-wrap: wrap;
  }

  .gl-search {
    flex: 1 1 100%;
    min-width: 0;
  }

  .gl-sort {
    flex: 1;
    min-width: 0;
  }

  .gl-apply {
    position: sticky;
    bottom: 0;
    z-index: 2;
    margin-top: 8px;
  }
}

@media (max-width: 520px) {
  .gl-grid {
    gap: 20px 12px;
  }

  .gl-name {
    font-size: 13px;
    min-height: 38px;
  }

  .gl-price strong {
    font-size: 15px;
  }

  .gl-tabs {
    order: 3;
    width: 100%;
  }

  .gl-tabs button {
    flex: 1;
  }

  .gl-side {
    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);
    top: 8px;
    bottom: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gl-side {
    transition: none;
  }
}
 .gl-side.open{transform:none!important}
 .gl-scrim{display:block;position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.4)}
 .gl-close{display:grid}
 .gl-filter-btn{display:inline-flex}
 .gl-main{padding:20px 14px 50px}
 .gl-bar{flex-wrap:wrap}
 .gl-search{flex:1 1 100%}
 .gl-sort{flex:1;min-width:0}
}
@media (max-width:520px){.gl-grid{gap:20px 12px}.gl-name{font-size:13px;min-height:38px}.gl-price strong{font-size:15px}.gl-tabs{order:3;width:100%}.gl-tabs button{flex:1}}
`;