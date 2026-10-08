"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Package, Pencil, Power, PowerOff,
  Star, ShoppingBag, Trash2,
} from "lucide-react";

import {
  ADMIN_CSS, API, CONCERNS, SKIN_TYPES, T, base, fmt, fmtDate, inter,
  playfair, stockState, useGlTheme, type Locale, type Product,
} from "../../../../../../lib/shared";

export default function ProductDetailsPage() {
  const params = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const theme = useGlTheme();

  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const t = T[locale];
  const isRTL = locale === "ar";
  const B = base(locale);
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [img, setImg] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/${id}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (res.status === 404) throw new Error(t.notFound);
      if (!res.ok || !data.success) throw new Error(data.message || t.failed);

      setProduct(data.data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setLoading(false);
    }
  }, [id, t.failed, t.notFound]);

  useEffect(() => {
    load();
  }, [load]);

  /* إيقاف / تفعيل */
  async function toggleActive() {
    if (!product) return;
    try {
      setBusy(true);
      const res = await fetch(`${API}/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || t.failed);
      setProduct({ ...product, isActive: !product.isActive });
    } catch (err) {
      alert(err instanceof Error ? err.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

async function remove() {
  if (!product) return;

  try {
    console.log("🗑️ START DELETE:", product.id);

    setBusy(true);

    const res = await fetch(`${API}/${product.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    console.log("📡 DELETE STATUS:", res.status);

    const data = await res.json();

    console.log("📦 DELETE RESULT:", data);

    if (!res.ok || !data.success) {
      throw new Error(data.message || t.failed);
    }

    console.log("✅ DELETE SUCCESS:", product.id);

    router.push(B);
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);

    alert(err instanceof Error ? err.message : t.failed);
  } finally {
    setBusy(false);
  }
}
  const Back = isRTL ? ArrowRight : ArrowLeft;
  const label = <V extends string>(list: { value: V; ar: string; en: string }[], v: V) => {
    const item = list.find((x) => x.value === v);
    return item ? item[locale] : v;
  };

  const p = product;
  const st = p ? stockState(p, t) : null;
  const age = p?.suitableForAge;
  const ageText =
    age && (age.min !== undefined || age.max !== undefined)
      ? `${age.min ?? "—"} - ${age.max ?? "—"} ${t.years}`
      : "—";

  return (
    <>
      <style>{ADMIN_CSS}</style>

      <main dir={isRTL ? "rtl" : "ltr"} className={`gl-ad ${inter.className}`} data-theme={theme}>
        <div className="wrap">
          <div className="crumb">
            <Link href={B} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Back size={15} />
              {t.backToProducts}
            </Link>
          </div>

          {loading ? (
            <div className="card state">
              <div className="loader" />
              <span>{t.loading}</span>
            </div>
          ) : error || !p || !st ? (
            <div className="card state">
              <div className="ico"><AlertTriangle size={26} /></div>
              <h3>{error || t.notFound}</h3>
              <Link href={B} className="btn sm">{t.backToProducts}</Link>
            </div>
          ) : (
            <>
              <header className="hd">
                <div>
                  <h1 className={`ttl ${playfair.className}`}>{p.name}</h1>
                  <p className="sub">{p.brand}</p>
                </div>

                <div className="acts">
                  <Link href={`${B}/${p.id}/edit`} className="btn">
                    <Pencil size={16} />{t.edit}
                  </Link>
                  <button type="button" className="btn ghost" onClick={toggleActive} disabled={busy}>
                    {p.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                    {p.isActive ? t.deactivate : t.activate}
                  </button>
     <button
  type="button"
  className="btn ghost"
  style={{ color: "var(--bad)" }}
  onClick={remove}
  disabled={busy}
>
  <Trash2 size={16} />
  {busy ? "Deleting..." : t.delete}
</button>
                </div>
              </header>

              <div className="dgrid">
                {/* Gallery */}
                <section className="card gal">
                  <div className="big">
                    {p.images?.[img]?.url ? (
                      <img src={p.images[img].url} alt={p.name} />
                    ) : (
                      <Package size={46} />
                    )}
                  </div>

                  {p.images?.length > 1 && (
                    <div className="thumbs">
                      {p.images.map((im, i) => (
                        <button key={im.publicId} type="button" className={i === img ? "on" : ""} onClick={() => setImg(i)}>
                          <img src={im.url} alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                {/* Info */}
                <section className="card info">
                  <div className="tags" style={{ marginTop: 0 }}>
                    <span className={`bdg ${p.isActive ? "ok" : "off"}`}>
                      <i />{p.isActive ? t.activeStatus : t.inactiveStatus}
                    </span>
                    <span className="bdg">{p.category === "skincare" ? t.skincare : t.makeup}</span>
                    {p.featured && <span className="bdg warn"><Star size={12} />{t.featured}</span>}
                    {p.bestSeller && <span className="bdg"><ShoppingBag size={12} />{t.bestSeller}</span>}
                  </div>

                  <div className="price">
                    <b>{fmt(locale, p.discountPrice ?? p.price)} {t.egp}</b>
                    {p.discountPrice ? <del>{fmt(locale, p.price)} {t.egp}</del> : null}
                  </div>

                  <div className="kv">
                    <div>
                      <small>{t.stock}</small>
                      <b>{p.stock} <span className={`t-${st.type}`}>· {st.label}</span></b>
                    </div>
                    <div><small>{t.lowStockLimit}</small><b>{p.lowStockThreshold}</b></div>
                    <div><small>{t.sku}</small><b>{p.sku || "—"}</b></div>
                    <div><small>{t.rating}</small><b>★ {p.rating ?? 0} ({p.reviewsCount ?? 0})</b></div>
                    <div><small>{t.size}</small><b>{p.size || "—"}</b></div>
                    <div><small>{t.shade}</small><b>{p.shade || "—"}</b></div>
                    <div><small>{t.age}</small><b>{ageText}</b></div>
                    <div><small>{t.updatedAt}</small><b>{fmtDate(locale, p.updatedAt)}</b></div>
                  </div>
                </section>
              </div>

              <section className="card sec">
                <h2>{t.description}</h2>
                <p className="txt">{p.description || "—"}</p>
              </section>

              <section className="card sec">
                <h2>{t.skinType}</h2>
                {p.skinTypes?.length ? (
                  <div className="chips">
                    {p.skinTypes.map((s) => <span key={s} className="chip">{label(SKIN_TYPES, s)}</span>)}
                  </div>
                ) : <p className="none">—</p>}

                <h2 style={{ marginTop: 22 }}>{t.skinConcerns}</h2>
                {p.concerns?.length ? (
                  <div className="chips">
                    {p.concerns.map((c) => <span key={c} className="chip">{label(CONCERNS, c)}</span>)}
                  </div>
                ) : <p className="none">—</p>}
              </section>

              <section className="card sec">
                <h2>{t.ingredients}</h2>
                {p.ingredients?.length ? (
                  <div className="chips">
                    {p.ingredients.map((x) => <span key={x} className="chip">{x}</span>)}
                  </div>
                ) : <p className="none">—</p>}
              </section>

              <section className="card sec">
                <h2>{t.benefits}</h2>
                {p.benefits?.length ? (
                  <ul className="ul">{p.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
                ) : <p className="none">—</p>}
              </section>

              <section className="card sec">
                <h2>{t.howToUse}</h2>
                <p className="txt">{p.howToUse || "—"}</p>
              </section>
            </>
          )}
        </div>

      </main>
    </>
  );
}