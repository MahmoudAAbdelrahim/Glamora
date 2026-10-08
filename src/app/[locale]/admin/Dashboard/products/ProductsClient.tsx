"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Search, Plus, Package, CheckCircle2, XCircle, AlertTriangle, MoreVertical,
  Eye, Pencil, Trash2, Power, PowerOff, ChevronLeft, ChevronRight, X,
  RefreshCw, Star, ShoppingBag,
} from "lucide-react";

import DeleteModal from "../../../../../components/DeleteModal/DeleteModal";
import {
  ADMIN_CSS, API, T, base, fmt, inter, playfair, stockState, useGlTheme,
  type Locale, type Product, type Stats, type Tx,
} from "../../../../../lib/shared";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    products: Product[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    stats: Stats;
  };
};

const LIMIT = 10;

export default function ProductsPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const theme = useGlTheme();

  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const t = T[locale];
  const isRTL = locale === "ar";
  const B = base(locale);

  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, outOfStock: 0, lowStock: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProducts = useCallback(
    async (showRefresh = false) => {
      try {
        showRefresh ? setRefreshing(true) : setLoading(true);
        setError("");

        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (category !== "all") query.set("category", category);
        if (status !== "all") query.set("status", status);
        query.set("page", String(page));
        query.set("limit", String(LIMIT));

        const response = await fetch(`${API}?${query.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || t.error);
        }

        setProducts(result.data.products || []);
        setStats(result.data.stats);
        setTotal(result.data.pagination.total);
        setTotalPages(result.data.pagination.totalPages);
      } catch (err) {
        console.error("PRODUCTS_PAGE_ERROR:", err);
        setError(err instanceof Error ? err.message : t.error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, page, search, status, t.error]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* إيقاف / تفعيل المنتج (PATCH isActive) */
  const handleStatusChange = async (product: Product) => {
    try {
      setUpdatingId(product.id);
      setOpenMenu(null);

      const response = await fetch(`${API}/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || t.failed);

      setProducts((cur) =>
        cur.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
      setStats((cur) => ({
        ...cur,
        active: product.isActive ? Math.max(cur.active - 1, 0) : cur.active + 1,
        inactive: product.isActive ? cur.inactive + 1 : Math.max(cur.inactive - 1, 0),
      }));
    } catch (err) {
      console.error("PRODUCT_STATUS_ERROR:", err);
      alert(err instanceof Error ? err.message : t.failed);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      setDeleting(true);
      const response = await fetch(`${API}/${deleteProduct.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || t.failed);

      setDeleteProduct(null);
      if (products.length === 1 && page > 1) setPage((c) => c - 1);
      else await loadProducts(true);
    } catch (err) {
      console.error("PRODUCT_DELETE_ERROR:", err);
      alert(err instanceof Error ? err.message : t.failed);
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("all");
    setStatus("all");
    setPage(1);
  };

  const hasFilters = searchInput.trim() !== "" || category !== "all" || status !== "all";

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2) return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  const firstItem = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const lastItem = Math.min(page * LIMIT, total);

  const statCards = [
    { icon: <Package size={21} />, label: t.total, value: stats.total, type: "" },
    { icon: <CheckCircle2 size={21} />, label: t.active, value: stats.active, type: "ok" },
    { icon: <XCircle size={21} />, label: t.inactive, value: stats.inactive, type: "off" },
    { icon: <AlertTriangle size={21} />, label: t.outOfStock, value: stats.outOfStock, type: "bad" },
    { icon: <ShoppingBag size={21} />, label: t.lowStock, value: stats.lowStock, type: "warn" },
  ];

  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  return (
    <>
      <style>{ADMIN_CSS}</style>

      <main dir={isRTL ? "rtl" : "ltr"} className={`gl-ad ${inter.className}`} data-theme={theme}>
        <div className="wrap">
          {/* Header */}
          <header className="hd">
            <div>
              <div className="crumb">
                <span>Glamora</span>
                <span>/</span>
                <span>{t.title}</span>
              </div>
              <h1 className={`ttl ${playfair.className}`}>{t.title}</h1>
              <p className="sub">{t.subtitle}</p>
            </div>

            <div className="acts">
              <button type="button" className="btn ghost" onClick={() => loadProducts(true)} disabled={refreshing}>
                <RefreshCw size={17} className={refreshing ? "spin" : ""} />
                <span>{t.refresh}</span>
              </button>
              <Link href={`${B}/create`} className="btn">
                <Plus size={18} />
                <span>{t.addProduct}</span>
              </Link>
            </div>
          </header>

          {/* Stats */}
          <section className="stats">
            {statCards.map((s) => (
              <div key={s.label} className={`card stat ${s.type}`}>
                <i>{s.icon}</i>
                <div>
                  <small>{s.label}</small>
                  <b>{fmt(locale, s.value)}</b>
                </div>
              </div>
            ))}
          </section>

          {/* Toolbar */}
          <section className="card tool">
            <div className="search">
              <Search size={18} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filters">
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                <option value="all">{t.allCategories}</option>
                <option value="skincare">{t.skincare}</option>
                <option value="makeup">{t.makeup}</option>
              </select>

              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="all">{t.allStatus}</option>
                <option value="active">{t.activeStatus}</option>
                <option value="inactive">{t.inactiveStatus}</option>
                <option value="outOfStock">{t.outOfStock}</option>
                <option value="lowStock">{t.lowStock}</option>
              </select>

              {hasFilters && (
                <button type="button" className="btn soft" onClick={resetFilters}>
                  <X size={15} />
                  <span>{t.resetFilters}</span>
                </button>
              )}
            </div>
          </section>

          {error && (
            <div className="alert bad">
              <AlertTriangle size={19} />
              <span>{error}</span>
              <button type="button" className="btn sm" onClick={() => loadProducts(true)}>
                {t.retry}
              </button>
            </div>
          )}

          {/* Table */}
          <section className="card tcard">
            <div className="thd">
              <h2>{t.product}</h2>
              <span>
                {t.showing} {firstItem}-{lastItem} {t.of} {total} {t.productCount}
              </span>
            </div>

            {loading ? (
              <div className="state">
                <div className="loader" />
                <span>{t.loading}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="state">
                <div className="ico"><Package size={27} /></div>
                <h3>{t.noProducts}</h3>
                <p>{t.noProductsDescription}</p>
                {hasFilters && (
                  <button type="button" className="btn sm" onClick={resetFilters}>
                    {t.resetFilters}
                  </button>
                )}
              </div>
            ) : (
              <div className="twrap">
                <table className="rt">
                  <thead>
                    <tr>
                      <th>{t.product}</th>
                      <th>{t.category}</th>
                      <th>{t.price}</th>
                      <th>{t.stock}</th>
                      <th>{t.status}</th>
                      <th>{t.features}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((p) => {
                      const st = stockState(p, t);

                      return (
                        <tr
                          key={p.id}
                          className="rowlink"
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest("button,a")) return;
                            router.push(`${B}/${p.id}`);
                          }}
                        >
                          <td className="first">
                            <Link href={`${B}/${p.id}`} className="pc">
                              <div className="pimg">
                                {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} /> : <Package size={23} />}
                              </div>
                              <div className="pn">
                                <b>{p.name}</b>
                                <span>{p.brand}</span>
                                {p.sku && <small>SKU: {p.sku}</small>}
                              </div>
                            </Link>
                          </td>

                          <td data-label={t.category}>
                            <span className="bdg">{p.category === "skincare" ? t.skincare : t.makeup}</span>
                          </td>

                          <td data-label={t.price}>
                            <div className="pr">
                              {p.discountPrice ? (
                                <>
                                  <b>{fmt(locale, p.discountPrice)} {t.egp}</b>
                                  <del>{fmt(locale, p.price)}</del>
                                </>
                              ) : (
                                <b>{fmt(locale, p.price)} {t.egp}</b>
                              )}
                            </div>
                          </td>

                          <td data-label={t.stock}>
                            <div className="stk">
                              <b>{p.stock}</b>
                              <span className={`t-${st.type}`}>{st.label}</span>
                            </div>
                          </td>

                          <td data-label={t.status}>
                            <button
                              type="button"
                              className={`bdg ${p.isActive ? "ok" : "off"}`}
                              onClick={() => handleStatusChange(p)}
                              disabled={updatingId === p.id}
                              title={p.isActive ? t.deactivate : t.activate}
                            >
                              <i />
                              {p.isActive ? t.activeStatus : t.inactiveStatus}
                            </button>
                          </td>

                          <td data-label={t.features}>
                            <div className="feats">
                              {p.featured && (
                                <span className="bdg warn"><Star size={12} />{t.featured}</span>
                              )}
                              {p.bestSeller && (
                                <span className="bdg"><ShoppingBag size={12} />{t.bestSeller}</span>
                              )}
                              {!p.featured && !p.bestSeller && <span style={{ opacity: 0.5 }}>—</span>}
                            </div>
                          </td>

                          <td data-label={t.actions}>
                            <div className="am">
                              <button
                                type="button"
                                className="amb"
                                aria-label={t.actions}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu((c) => (c === p.id ? null : p.id));
                                }}
                              >
                                <MoreVertical size={18} />
                              </button>

                              {openMenu === p.id && (
                                <div className="menu" onClick={(e) => e.stopPropagation()}>
                                  <Link href={`${B}/${p.id}`}><Eye size={15} />{t.view}</Link>
                                  <Link href={`${B}/${p.id}/edit`}><Pencil size={15} />{t.edit}</Link>
                                  <button type="button" onClick={() => handleStatusChange(p)} disabled={updatingId === p.id}>
                                    {p.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                                    {p.isActive ? t.deactivate : t.activate}
                                  </button>
                                  <button
                                    type="button"
                                    className="dg"
                                    onClick={() => { setOpenMenu(null); setDeleteProduct(p); }}
                                  >
                                    <Trash2 size={15} />{t.delete}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && products.length > 0 && (
              <Pagination
                t={t}
                page={page}
                totalPages={totalPages}
                visiblePages={visiblePages}
                setPage={setPage}
                Prev={Prev}
                Next={Next}
              />
            )}
          </section>
        </div>

        {deleteProduct && (
          <DeleteModal
            t={t}
            product={deleteProduct}
            busy={deleting}
            onCancel={() => setDeleteProduct(null)}
            onConfirm={handleDelete}
          />
        )}
      </main>
    </>
  );
}

function Pagination({
  t, page, totalPages, visiblePages, setPage, Prev, Next,
}: {
  t: Tx;
  page: number;
  totalPages: number;
  visiblePages: number[];
  setPage: React.Dispatch<React.SetStateAction<number>>;
  Prev: typeof ChevronLeft;
  Next: typeof ChevronRight;
}) {
  return (
    <div className="pg">
      <span>{t.page} {page} {t.of} {totalPages}</span>

      <div className="pgb">
        <button type="button" disabled={page === 1} aria-label={t.previous} onClick={() => setPage((c) => Math.max(c - 1, 1))}>
          <Prev size={16} />
        </button>

        {visiblePages.map((n) => (
          <button key={n} type="button" className={n === page ? "cur" : ""} onClick={() => setPage(n)}>
            {n}
          </button>
        ))}

        <button type="button" disabled={page === totalPages} aria-label={t.next} onClick={() => setPage((c) => Math.min(c + 1, totalPages))}>
          <Next size={16} />
        </button>
      </div>
    </div>
  );
}