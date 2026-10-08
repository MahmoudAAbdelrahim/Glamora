"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

import {
  Search,
  Plus,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Star,
  ShoppingBag,
} from "lucide-react";


import {
  ADMIN_CSS,
  API,
  T,
  base,
  fmt,
  inter,
  playfair,
  stockState,
  useGlTheme,
  type Locale,
  type Product,
  type Stats,
  type Tx,
} from "../../../../../lib/shared";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: Stats;
  };
};

const LIMIT = 10;

export default function ProductsPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const theme = useGlTheme();

  const locale: Locale =
    params.locale === "en" ? "en" : "ar";

  const t = T[locale];
  const isRTL = locale === "ar";
  const B = base(locale);

  const [products, setProducts] = useState<Product[]>([]);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    outOfStock: 0,
    lowStock: 0,
  });

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

  const [deleting, setDeleting] = useState(false);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const loadProducts = useCallback(
    async (showRefresh = false) => {
      try {
        showRefresh
          ? setRefreshing(true)
          : setLoading(true);

        setError("");

        const query = new URLSearchParams();

        if (search) query.set("search", search);
        if (category !== "all")
          query.set("category", category);
        if (status !== "all")
          query.set("status", status);

        query.set("page", String(page));
        query.set("limit", String(LIMIT));

        const response = await fetch(
          `${API}?${query.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result: ApiResponse =
          await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message || t.error
          );
        }

        setProducts(result.data.products || []);
        setStats(result.data.stats);
        setTotal(
          result.data.pagination.total
        );
        setTotalPages(
          result.data.pagination.totalPages
        );
      } catch (err) {
        console.error(
          "PRODUCTS_PAGE_ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : t.error
        );
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

    return () =>
      window.removeEventListener(
        "click",
        close
      );
  }, []);

  const handleStatusChange = async (
    product: Product
  ) => {
    try {
      setUpdatingId(product.id);
      setOpenMenu(null);

      const response = await fetch(
        `${API}/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            isActive: !product.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || t.failed
        );
      }

      setProducts((cur) =>
        cur.map((p) =>
          p.id === product.id
            ? {
                ...p,
                isActive: !p.isActive,
              }
            : p
        )
      );

      setStats((cur) => ({
        ...cur,
        active: product.isActive
          ? Math.max(cur.active - 1, 0)
          : cur.active + 1,
        inactive: product.isActive
          ? cur.inactive + 1
          : Math.max(cur.inactive - 1, 0),
      }));
    } catch (err) {
      console.error(
        "PRODUCT_STATUS_ERROR:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : t.failed
      );
    } finally {
      setUpdatingId(null);
    }
  };

const handleDelete = async (product: Product) => {
  try {
    console.log("🗑️ START DELETE:", product.id);

    setDeleting(true);

    const response = await fetch(`${API}/${product.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    console.log("📡 DELETE STATUS:", response.status);

    const result = await response.json();

    console.log("📦 DELETE RESULT:", result);

    if (!response.ok || !result.success) {
      throw new Error(result.message || t.failed);
    }

    console.log("✅ DELETE SUCCESS:", product.id);

    setOpenMenu(null);

    if (products.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      await loadProducts(true);
    }
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);

    alert(
      error instanceof Error
        ? error.message
        : t.failed
    );
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

  const hasFilters =
    searchInput.trim() !== "" ||
    category !== "all" ||
    status !== "all";

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (page >= totalPages - 2) {
      return Array.from(
        { length: 5 },
        (_, i) => totalPages - 4 + i
      );
    }

    return [
      page - 2,
      page - 1,
      page,
      page + 1,
      page + 2,
    ];
  }, [page, totalPages]);

  const firstItem =
    total === 0
      ? 0
      : (page - 1) * LIMIT + 1;

  const lastItem = Math.min(
    page * LIMIT,
    total
  );

  const statCards = [
    {
      icon: <Package size={22} />,
      label: t.total,
      value: stats.total,
      type: "total",
    },
    {
      icon: <CheckCircle2 size={22} />,
      label: t.active,
      value: stats.active,
      type: "ok",
    },
    {
      icon: <XCircle size={22} />,
      label: t.inactive,
      value: stats.inactive,
      type: "off",
    },
    {
      icon: <AlertTriangle size={22} />,
      label: t.outOfStock,
      value: stats.outOfStock,
      type: "bad",
    },
    {
      icon: <ShoppingBag size={22} />,
      label: t.lowStock,
      value: stats.lowStock,
      type: "warn",
    },
  ];

  const Prev = isRTL
    ? ChevronRight
    : ChevronLeft;

  const Next = isRTL
    ? ChevronLeft
    : ChevronRight;

  return (
    <>
      <style>{ADMIN_CSS}</style>

      <style>{`
        /* =========================================
           GLAMORA STATISTICS REDESIGN
        ========================================= */

        .glamora-stats {
          display: grid !important;
          grid-template-columns:
            repeat(5, minmax(0, 1fr)) !important;

          gap: 16px !important;
          margin: 0 0 24px !important;

          perspective: 1200px;
        }

        .glamora-stat {
          --accent: #8b1538;
          --soft: rgba(139, 21, 56, 0.09);

          position: relative;

          min-height: 158px;

          padding: 20px !important;

          overflow: hidden;
          isolation: isolate;

          display: flex !important;
          flex-direction: column;
          justify-content: space-between;

          border: 1px solid
            rgba(139, 21, 56, 0.10) !important;

          border-radius: 20px !important;

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.98),
              rgba(255, 248, 250, 0.96)
            ) !important;

          box-shadow:
            0 12px 32px
              rgba(74, 21, 38, 0.055) !important;

          opacity: 0;

          transform:
            translateY(20px)
            scale(0.975);

          animation:
            glamoraStatIn
            0.68s
            cubic-bezier(0.22, 1, 0.36, 1)
            calc(var(--stat-index) * 80ms)
            forwards;

          transition:
            transform 0.35s
              cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }

        .glamora-stat:nth-child(1) {
          --stat-index: 0;
        }

        .glamora-stat:nth-child(2) {
          --stat-index: 1;
        }

        .glamora-stat:nth-child(3) {
          --stat-index: 2;
        }

        .glamora-stat:nth-child(4) {
          --stat-index: 3;
        }

        .glamora-stat:nth-child(5) {
          --stat-index: 4;
        }

        .glamora-stat.total {
          --accent: #8b1538;
          --soft: rgba(139, 21, 56, 0.10);
        }

        .glamora-stat.ok {
          --accent: #21824e;
          --soft: rgba(33, 130, 78, 0.10);
        }

        .glamora-stat.off {
          --accent: #69539a;
          --soft: rgba(105, 83, 154, 0.10);
        }

        .glamora-stat.bad {
          --accent: #b42318;
          --soft: rgba(180, 35, 24, 0.10);
        }

        .glamora-stat.warn {
          --accent: #b76b12;
          --soft: rgba(183, 107, 18, 0.11);
        }

        .glamora-stat::before {
          content: "";

          position: absolute;
          top: -58px;
          right: -58px;

          width: 150px;
          height: 150px;

          border-radius: 50%;

          background: var(--soft);

          z-index: -1;

          transition:
            transform 0.5s ease,
            opacity 0.5s ease;
        }

        .glamora-stat::after {
          content: "";

          position: absolute;
          right: 20px;
          bottom: 0;
          left: 20px;

          height: 3px;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              transparent,
              var(--accent),
              transparent
            );

          opacity: 0.8;

          transform: scaleX(0.25);

          transition:
            transform 0.45s ease;
        }

        .glamora-stat:hover {
          transform:
            translateY(-7px)
            scale(1.012) !important;

          border-color:
            color-mix(
              in srgb,
              var(--accent) 25%,
              transparent
            ) !important;

          box-shadow:
            0 20px 42px
              rgba(74, 21, 38, 0.11) !important;
        }

        .glamora-stat:hover::before {
          transform: scale(1.18);
        }

        .glamora-stat:hover::after {
          transform: scaleX(1);
        }

        .stat-glow {
          position: absolute;

          top: -80px;
          left: -80px;

          width: 180px;
          height: 180px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              var(--soft),
              transparent 68%
            );

          pointer-events: none;

          opacity: 0.65;
        }

        .stat-head {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-icon {
          width: 48px;
          height: 48px;

          display: grid;
          place-items: center;

          border-radius: 15px;

          color: var(--accent);
          background: var(--soft);

          box-shadow:
            inset 0 0 0 1px
              rgba(255, 255, 255, 0.7);

          transition:
            transform 0.35s
              cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s ease;
        }

        .glamora-stat:hover .stat-icon {
          transform:
            rotate(-7deg)
            scale(1.1);

          box-shadow:
            0 9px 20px
              color-mix(
                in srgb,
                var(--accent) 16%,
                transparent
              );
        }

        .stat-number {
          color: #b7a5aa;

          font-size: 0.68rem;
          font-weight: 800;

          letter-spacing: 0.12em;
        }

        .stat-content {
          position: relative;
          z-index: 2;

          display: flex;
          flex-direction: column;

          gap: 5px;

          margin-top: 15px;
        }

        .stat-content small {
          color: #806f75;

          font-size: 0.76rem;
          font-weight: 700;
        }

        .stat-content b {
          color: #2a1a1f;

          font-size: 1.95rem;
          line-height: 1;

          font-weight: 850;

          letter-spacing: -0.045em;

          transition:
            color 0.3s ease,
            transform 0.3s ease;

          transform-origin: left center;
        }

        [dir="rtl"] .stat-content b {
          transform-origin: right center;
        }

        .glamora-stat:hover
          .stat-content
          b {
          color: var(--accent);

          transform: scale(1.04);
        }

        .stat-progress {
          position: relative;
          z-index: 2;

          height: 4px;

          margin-top: 15px;

          overflow: hidden;

          border-radius: 999px;

          background: var(--soft);
        }

        .stat-progress span {
          display: block;

          width: 46%;
          height: 100%;

          border-radius: inherit;

          background: var(--accent);

          transform-origin: left;

          animation:
            glamoraProgress
            0.9s
            0.35s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        [dir="rtl"]
          .stat-progress
          span {
          transform-origin: right;
        }

        .glamora-stat.total
          .stat-progress
          span {
          width: 100%;
        }

        .glamora-stat.ok
          .stat-progress
          span {
          width: 84%;
        }

        .glamora-stat.off
          .stat-progress
          span {
          width: 45%;
        }

        .glamora-stat.bad
          .stat-progress
          span {
          width: 25%;
        }

        .glamora-stat.warn
          .stat-progress
          span {
          width: 58%;
        }

        @keyframes glamoraStatIn {
          from {
            opacity: 0;

            transform:
              translateY(20px)
              scale(0.975);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes glamoraProgress {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        /* =========================================
           DARK MODE
        ========================================= */

        :global(.dark)
          .glamora-stat,
        [data-theme="dark"]
          .glamora-stat {
          background:
            linear-gradient(
              145deg,
              #151a29,
              #101522
            ) !important;

          border-color: #2a3040 !important;

          box-shadow:
            0 14px 35px
              rgba(0, 0, 0, 0.2) !important;
        }

        :global(.dark)
          .stat-content
          small,
        [data-theme="dark"]
          .stat-content
          small {
          color: #aaa0a5;
        }

        :global(.dark)
          .stat-content
          b,
        [data-theme="dark"]
          .stat-content
          b {
          color: #f7f2f4;
        }

        :global(.dark)
          .stat-number,
        [data-theme="dark"]
          .stat-number {
          color: #716970;
        }

        @media (max-width: 1200px) {
          .glamora-stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr))
              !important;
          }

          .glamora-stat.total {
            grid-column: span 2;
          }
        }

        @media (max-width: 760px) {
          .glamora-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr))
              !important;

            gap: 12px !important;
          }

          .glamora-stat.total {
            grid-column: span 2;
          }

          .glamora-stat {
            min-height: 140px;

            padding: 17px !important;

            border-radius: 17px !important;
          }

          .stat-content b {
            font-size: 1.65rem;
          }
        }

        @media (max-width: 460px) {
          .glamora-stats {
            grid-template-columns:
              1fr !important;
          }

          .glamora-stat.total {
            grid-column: auto;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glamora-stat {
            animation: none;

            opacity: 1;

            transform: none;
          }
        }
      `}</style>

      <main
        dir={isRTL ? "rtl" : "ltr"}
        className={`gl-ad ${inter.className}`}
        data-theme={theme}
      >
        <div className="wrap">
          {/* Header */}

          <header className="hd">
            <div>
              <div className="crumb">
                <span>Glamora</span>

                <span>/</span>

                <span>{t.title}</span>
              </div>

              <h1
                className={`ttl ${playfair.className}`}
              >
                {t.title}
              </h1>

              <p className="sub">
                {t.subtitle}
              </p>
            </div>

            <div className="acts">
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  loadProducts(true)
                }
                disabled={refreshing}
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing ? "spin" : ""
                  }
                />

                <span>{t.refresh}</span>
              </button>

              <Link
                href={`${B}/create`}
                className="btn"
              >
                <Plus size={18} />

                <span>{t.addProduct}</span>
              </Link>
            </div>
          </header>

          {/* Statistics */}

          <section className="stats glamora-stats">
            {statCards.map((s, index) => (
              <div
                key={s.label}
                className={`card stat glamora-stat ${s.type}`}
              >
                <div className="stat-glow" />

                <div className="stat-head">
                  <span className="stat-icon">
                    {s.icon}
                  </span>

                  <span className="stat-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </div>

                <div className="stat-content">
                  <small>{s.label}</small>

                  <b>
                    {fmt(
                      locale,
                      s.value
                    )}
                  </b>
                </div>

                <div className="stat-progress">
                  <span />
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
                onChange={(e) =>
                  setSearchInput(
                    e.target.value
                  )
                }
                placeholder={
                  t.searchPlaceholder
                }
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchInput("")
                  }
                  aria-label="Clear"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="filters">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(
                    e.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="all">
                  {t.allCategories}
                </option>

                <option value="skincare">
                  {t.skincare}
                </option>

                <option value="makeup">
                  {t.makeup}
                </option>
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(
                    e.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="all">
                  {t.allStatus}
                </option>

                <option value="active">
                  {t.activeStatus}
                </option>

                <option value="inactive">
                  {t.inactiveStatus}
                </option>

                <option value="outOfStock">
                  {t.outOfStock}
                </option>

                <option value="lowStock">
                  {t.lowStock}
                </option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  className="btn soft"
                  onClick={resetFilters}
                >
                  <X size={15} />

                  <span>
                    {t.resetFilters}
                  </span>
                </button>
              )}
            </div>
          </section>

          {error && (
            <div className="alert bad">
              <AlertTriangle size={19} />

              <span>{error}</span>

              <button
                type="button"
                className="btn sm"
                onClick={() =>
                  loadProducts(true)
                }
              >
                {t.retry}
              </button>
            </div>
          )}

          {/* Table */}

          <section className="card tcard">
            <div className="thd">
              <h2>{t.product}</h2>

              <span>
                {t.showing} {firstItem}-
                {lastItem} {t.of} {total}{" "}
                {t.productCount}
              </span>
            </div>

            {loading ? (
              <div className="state">
                <div className="loader" />

                <span>{t.loading}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="state">
                <div className="ico">
                  <Package size={27} />
                </div>

                <h3>
                  {t.noProducts}
                </h3>

                <p>
                  {
                    t.noProductsDescription
                  }
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    className="btn sm"
                    onClick={
                      resetFilters
                    }
                  >
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
                      const st =
                        stockState(p, t);

                      return (
  <tr
  key={p.id}
  className="rowlink"
  onClick={(e) => {
    const target = e.target as HTMLElement;

    // Don't navigate when clicking any interactive element
    if (
      target.closest(
        "button, a, input, select, textarea, [role='button']"
      )
    ) {
      return;
    }

    router.push(`${B}/${p.id}`);
  }}
>
                          <td className="first">
                            <Link
                              href={`${B}/${p.id}`}
                              className="pc"
                            >
                              <div className="pimg">
                                {p.images?.[0]
                                  ?.url ? (
                                  <img
                                    src={
                                      p
                                        .images[0]
                                        .url
                                    }
                                    alt={p.name}
                                  />
                                ) : (
                                  <Package
                                    size={23}
                                  />
                                )}
                              </div>

                              <div className="pn">
                                <b>
                                  {p.name}
                                </b>

                                <span>
                                  {p.brand}
                                </span>

                                {p.sku && (
                                  <small>
                                    SKU:{" "}
                                    {p.sku}
                                  </small>
                                )}
                              </div>
                            </Link>
                          </td>

                          <td
                            data-label={
                              t.category
                            }
                          >
                            <span className="bdg">
                              {p.category ===
                              "skincare"
                                ? t.skincare
                                : t.makeup}
                            </span>
                          </td>

                          <td
                            data-label={
                              t.price
                            }
                          >
                            <div className="pr">
                              {p.discountPrice ? (
                                <>
                                  <b>
                                    {fmt(
                                      locale,
                                      p.discountPrice
                                    )}{" "}
                                    {t.egp}
                                  </b>

                                  <del>
                                    {fmt(
                                      locale,
                                      p.price
                                    )}
                                  </del>
                                </>
                              ) : (
                                <b>
                                  {fmt(
                                    locale,
                                    p.price
                                  )}{" "}
                                  {t.egp}
                                </b>
                              )}
                            </div>
                          </td>

                          <td
                            data-label={
                              t.stock
                            }
                          >
                            <div className="stk">
                              <b>{p.stock}</b>

                              <span
                                className={`t-${st.type}`}
                              >
                                {st.label}
                              </span>
                            </div>
                          </td>

                          <td
                            data-label={
                              t.status
                            }
                          >
                            <button
                              type="button"
                              className={`bdg ${
                                p.isActive
                                  ? "ok"
                                  : "off"
                              }`}
                              onClick={() =>
                                handleStatusChange(
                                  p
                                )
                              }
                              disabled={
                                updatingId ===
                                p.id
                              }
                              title={
                                p.isActive
                                  ? t.deactivate
                                  : t.activate
                              }
                            >
                              <i />

                              {p.isActive
                                ? t.activeStatus
                                : t.inactiveStatus}
                            </button>
                          </td>

                          <td
                            data-label={
                              t.features
                            }
                          >
                            <div className="feats">
                              {p.featured && (
                                <span className="bdg warn">
                                  <Star
                                    size={12}
                                  />

                                  {
                                    t.featured
                                  }
                                </span>
                              )}

                              {p.bestSeller && (
                                <span className="bdg">
                                  <ShoppingBag
                                    size={12}
                                  />

                                  {
                                    t.bestSeller
                                  }
                                </span>
                              )}

                              {!p.featured &&
                                !p.bestSeller && (
                                  <span
                                    style={{
                                      opacity: 0.5,
                                    }}
                                  >
                                    —
                                  </span>
                                )}
                            </div>
                          </td>

                          <td
                            data-label={
                              t.actions
                            }
                          >
                            <div className="am">
                              <button
                                type="button"
                                className="amb"
                                aria-label={
                                  t.actions
                                }
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setOpenMenu(
                                    (c) =>
                                      c === p.id
                                        ? null
                                        : p.id
                                  );
                                }}
                              >
                                <MoreVertical
                                  size={18}
                                />
                              </button>

                              {openMenu ===
                                p.id && (
                                <div
                                  className="menu"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <Link
                                    href={`${B}/${p.id}`}
                                  >
                                    <Eye
                                      size={15}
                                    />

                                    {t.view}
                                  </Link>

                                  <Link
                                    href={`${B}/${p.id}/edit`}
                                  >
                                    <Pencil
                                      size={15}
                                    />

                                    {t.edit}
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(
                                        p
                                      )
                                    }
                                    disabled={
                                      updatingId ===
                                      p.id
                                    }
                                  >
                                    {p.isActive ? (
                                      <PowerOff
                                        size={15}
                                      />
                                    ) : (
                                      <Power
                                        size={15}
                                      />
                                    )}

                                    {p.isActive
                                      ? t.deactivate
                                      : t.activate}
                                  </button>

                                 <button
  type="button"
  className="dg"
  disabled={deleting}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🔥 DELETE CLICKED", p.id);

    handleDelete(p);
  }}
>
  <Trash2 size={15} />
  {deleting ? "Deleting..." : t.delete}

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

            {!loading &&
              products.length > 0 && (
                <Pagination
                  t={t}
                  page={page}
                  totalPages={totalPages}
                  visiblePages={
                    visiblePages
                  }
                  setPage={setPage}
                  Prev={Prev}
                  Next={Next}
                />
              )}
          </section>
        </div>

      </main>
    </>
  );
}

function Pagination({
  t,
  page,
  totalPages,
  visiblePages,
  setPage,
  Prev,
  Next,
}: {
  t: Tx;
  page: number;
  totalPages: number;
  visiblePages: number[];
  setPage: React.Dispatch<
    React.SetStateAction<number>
  >;
  Prev: typeof ChevronLeft;
  Next: typeof ChevronRight;
}) {
  return (
    <div className="pg">
      <span>
        {t.page} {page} {t.of}{" "}
        {totalPages}
      </span>

      <div className="pgb">
        <button
          type="button"
          disabled={page === 1}
          aria-label={t.previous}
          onClick={() =>
            setPage((c) =>
              Math.max(c - 1, 1)
            )
          }
        >
          <Prev size={16} />
        </button>

        {visiblePages.map((n) => (
          <button
            key={n}
            type="button"
            className={
              n === page ? "cur" : ""
            }
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          disabled={
            page === totalPages
          }
          aria-label={t.next}
          onClick={() =>
            setPage((c) =>
              Math.min(
                c + 1,
                totalPages
              )
            )
          }
        >
          <Next size={16} />
        </button>
      </div>
    </div>
  );
}