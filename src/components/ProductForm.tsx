"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle, ArrowLeft, ArrowRight, Banknote, Check, CheckCircle2,
  CloudUpload, Eye, FileText, Flame, Images, Info, Plus, Save,
  SlidersHorizontal, Star, UserRound, X,
} from "lucide-react";

import {
  ADMIN_CSS, API, CONCERNS, SKIN_TYPES, T, base, inter, playfair, useGlTheme,
  type Concern, type Locale, type Product, type ProductImage, type SkinType,
} from "../lib/shared";

type Mode = "create" | "edit";

const EMPTY = {
  name: "", brand: "", category: "skincare", description: "",
  price: "", discountPrice: "", stock: "0", lowStockThreshold: "5", sku: "",
  size: "", shade: "", ingredients: "", benefits: "", howToUse: "",
  ageMin: "", ageMax: "",
  skinTypes: ["all"] as SkinType[],
  concerns: [] as Concern[],
  featured: false, bestSeller: false, isActive: true,
};

type FormState = typeof EMPTY;

export default function ProductForm({ mode }: { mode: Mode }) {
  const params = useParams<{ locale: string; id?: string }>();
  const router = useRouter();
  const theme = useGlTheme();

  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const t = T[locale];
  const isRTL = locale === "ar";
  const B = base(locale);
  const id = params.id;
  const isEdit = mode === "edit";

  const [form, setForm] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [fetching, setFetching] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* تحميل بيانات المنتج في وضع التعديل */
  useEffect(() => {
    if (!isEdit) return;
    let off = false;

    (async () => {
      try {
        const res = await fetch(`${API}/${id}`, { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (res.status === 404) throw new Error(t.notFound);
        if (!res.ok || !data.success) throw new Error(data.message || t.failed);

        const p: Product = data.data.product;
        if (off) return;

        setImages(p.images || []);
        setForm({
          name: p.name || "",
          brand: p.brand || "",
          category: p.category || "skincare",
          description: p.description || "",
          price: String(p.price ?? ""),
          discountPrice: p.discountPrice ? String(p.discountPrice) : "",
          stock: String(p.stock ?? 0),
          lowStockThreshold: String(p.lowStockThreshold ?? 5),
          sku: p.sku || "",
          size: p.size || "",
          shade: p.shade || "",
          ingredients: (p.ingredients || []).join(", "),
          benefits: (p.benefits || []).join("\n"),
          howToUse: p.howToUse || "",
          ageMin: p.suitableForAge?.min !== undefined ? String(p.suitableForAge.min) : "",
          ageMax: p.suitableForAge?.max !== undefined ? String(p.suitableForAge.max) : "",
          skinTypes: p.skinTypes?.length ? p.skinTypes : ["all"],
          concerns: p.concerns || [],
          featured: !!p.featured,
          bestSeller: !!p.bestSeller,
          isActive: p.isActive !== false,
        });
      } catch (err) {
        if (!off) setError(err instanceof Error ? err.message : t.failed);
      } finally {
        if (!off) setFetching(false);
      }
    })();

    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSkin(type: SkinType) {
    setForm((prev) => {
      if (type === "all") return { ...prev, skinTypes: ["all"] };
      const current = prev.skinTypes.filter((s) => s !== "all");
      if (current.includes(type)) {
        const next = current.filter((s) => s !== type);
        return { ...prev, skinTypes: next.length ? next : ["all"] };
      }
      return { ...prev, skinTypes: [...current, type] };
    });
  }

  function toggleConcern(c: Concern) {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(c)
        ? prev.concerns.filter((x) => x !== c)
        : [...prev.concerns, c],
    }));
  }

  async function uploadImages(files: FileList | null) {
    if (!files) return;

    const available = 5 - images.length;
    if (available <= 0) return setError(t.vMax);

    setUploading(true);
    setError("");

    try {
      const uploaded: ProductImage[] = [];

      for (const file of Array.from(files).slice(0, available)) {
        if (!file.type.startsWith("image/")) throw new Error(t.vOnlyImages);

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(`${API}/upload`, { method: "POST", body: fd, credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || t.failed);

        uploaded.push({ url: data.data.url, publicId: data.data.publicId });
      }

      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) return setError(t.vName);
    if (!form.brand.trim()) return setError(t.vBrand);
    if (!form.description.trim()) return setError(t.vDesc);
    if (!form.price || Number(form.price) <= 0) return setError(t.vPrice);
    if (form.discountPrice && Number(form.discountPrice) >= Number(form.price)) return setError(t.vDiscount);
    if (!images.length) return setError(t.vImages);

    setLoading(true);

    try {
      /* في التعديل: القيم الفاضية بتتبعت null / "" عشان تتمسح فعلًا من الداتا */
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : isEdit ? null : undefined,
        currency: "EGP",
        images,
        skinTypes: form.skinTypes,
        concerns: form.concerns,
        ingredients: form.ingredients.split(",").map((x) => x.trim()).filter(Boolean),
        benefits: form.benefits.split("\n").map((x) => x.trim()).filter(Boolean),
        howToUse: form.howToUse.trim(),
        suitableForAge: {
          min: form.ageMin ? Number(form.ageMin) : undefined,
          max: form.ageMax ? Number(form.ageMax) : undefined,
        },
        shade: form.shade.trim() || (isEdit ? "" : undefined),
        size: form.size.trim() || (isEdit ? "" : undefined),
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        sku: form.sku.trim() || (isEdit ? "" : undefined),
        featured: form.featured,
        bestSeller: form.bestSeller,
        isActive: form.isActive,
      };

      const res = await fetch(isEdit ? `${API}/${id}` : API, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || t.failed);

      setSuccess(isEdit ? t.saved : t.created);
      setTimeout(() => router.push(isEdit ? `${B}/${id}` : B), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setLoading(false);
    }
  }

  const Back = isRTL ? ArrowRight : ArrowLeft;
  const MoveL = isRTL ? ArrowRight : ArrowLeft;
  const MoveR = isRTL ? ArrowLeft : ArrowRight;
  const backHref = isEdit ? `${B}/${id}` : B;

  return (
    <>
      <style>{ADMIN_CSS}</style>

      <main dir={isRTL ? "rtl" : "ltr"} className={`gl-ad ${inter.className}`} data-theme={theme}>
        <div className="wrap" style={{ maxWidth: 1180 }}>
          <div className="crumb">
            <Link href={backHref} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Back size={15} />
              {t.backToProducts}
            </Link>
          </div>

          <header className="hd">
            <div>
              <h1 className={`ttl ${playfair.className}`}>{isEdit ? t.editTitle : t.createTitle}</h1>
              <p className="sub">{isEdit ? t.editSub : t.createSub}</p>
            </div>
          </header>

          {error && (
            <div className="alert bad">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert ok">
              <CheckCircle2 size={19} />
              <span>{success}</span>
            </div>
          )}

          {fetching ? (
            <div className="card state">
              <div className="loader" />
              <span>{t.loading}</span>
            </div>
          ) : isEdit && !form.name && error ? null : (
            <form onSubmit={handleSubmit}>
              {/* BASIC */}
              <section className="card sec">
                <SecHead icon={<Info size={20} />} title={t.basic} sub={t.basicSub} />

                <div className="g2">
                  <Fld label={t.name} required value={form.name} onChange={(v) => set("name", v)} placeholder={t.namePh} />
                  <Fld label={t.brand} required value={form.brand} onChange={(v) => set("brand", v)} placeholder="Glamora" />
                </div>

                <div className="g2">
                  <div className="fld">
                    <label>{t.category}<em>*</em></label>
                    <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                      <option value="skincare">{t.skincare}</option>
                      <option value="makeup">{t.makeup}</option>
                    </select>
                  </div>
                  <Fld label={t.sku} value={form.sku} onChange={(v) => set("sku", v)} placeholder={t.optional} />
                </div>

                <div className="fld" style={{ marginBottom: 0 }}>
                  <label>{t.description}<em>*</em></label>
                  <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={t.descPh} />
                </div>
              </section>

              {/* IMAGES */}
              <section className="card sec">
                <SecHead icon={<Images size={20} />} title={t.images} sub={t.imagesSub} />

                <div className="imgs">
                  {images.map((image, i) => (
                    <div className="imc" key={image.publicId}>
                      <img src={image.url} alt={`${i + 1}`} />
                      {i === 0 && <div className="mark">{t.mainImage}</div>}

                      <button type="button" className="rm" title={t.removeImage} onClick={() => setImages((p) => p.filter((_, k) => k !== i))}>
                        <X size={15} />
                      </button>

                      <div className="mv">
                        <button type="button" disabled={i === 0} onClick={() => moveImage(i, -1)}><MoveL size={15} /></button>
                        <button type="button" disabled={i === images.length - 1} onClick={() => moveImage(i, 1)}><MoveR size={15} /></button>
                      </div>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="upl">
                      <input type="file" accept="image/*" multiple hidden onChange={(e) => { uploadImages(e.target.files); e.target.value = ""; }} />
                      {uploading ? (
                        <>
                          <div className="loader" />
                          <span>{t.uploading}</span>
                        </>
                      ) : (
                        <>
                          <div className="ico"><CloudUpload size={22} /></div>
                          <span>{t.upload}</span>
                          <small>{t.imgFormats}</small>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </section>

              {/* PRICING */}
              <section className="card sec">
                <SecHead icon={<Banknote size={20} />} title={t.pricing} sub={t.pricingSub} />

                <div className="g4">
                  <Fld label={`${t.price} (EGP)`} required type="number" value={form.price} onChange={(v) => set("price", v)} placeholder="0.00" />
                  <Fld label={`${t.discountPrice} (EGP)`} type="number" value={form.discountPrice} onChange={(v) => set("discountPrice", v)} placeholder="0.00" />
                  <Fld label={t.stock} type="number" value={form.stock} onChange={(v) => set("stock", v)} placeholder="0" />
                  <Fld label={t.lowStockThreshold} type="number" value={form.lowStockThreshold} onChange={(v) => set("lowStockThreshold", v)} placeholder="5" />
                </div>

                <div className="g2" style={{ marginBottom: 0 }}>
                  <Fld label={t.size} value={form.size} onChange={(v) => set("size", v)} placeholder="50ml" />
                  <Fld label={t.shade} value={form.shade} onChange={(v) => set("shade", v)} placeholder="Rose Nude" />
                </div>
              </section>

              {/* SUITABILITY */}
              <section className="card sec">
                <SecHead icon={<UserRound size={20} />} title={t.suitability} sub={t.suitabilitySub} />

                <div className="grp">
                  <h3>{t.skinType}</h3>
                  <div className="chl">
                    {SKIN_TYPES.map((s) => (
                      <Chip key={s.value} selected={form.skinTypes.includes(s.value)} onClick={() => toggleSkin(s.value)}>
                        {s[locale]}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="grp">
                  <h3>{t.skinConcerns}</h3>
                  <div className="chl">
                    {CONCERNS.map((c) => (
                      <Chip key={c.value} selected={form.concerns.includes(c.value)} onClick={() => toggleConcern(c.value)}>
                        {c[locale]}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="g2" style={{ maxWidth: 600, marginBottom: 0 }}>
                  <Fld label={t.ageMin} type="number" value={form.ageMin} onChange={(v) => set("ageMin", v)} placeholder="18" />
                  <Fld label={t.ageMax} type="number" value={form.ageMax} onChange={(v) => set("ageMax", v)} placeholder="60" />
                </div>
              </section>

              {/* DETAILS */}
              <section className="card sec">
                <SecHead icon={<FileText size={20} />} title={t.details} sub={t.detailsSub} />

                <div className="fld">
                  <label>{t.ingredients}</label>
                  <textarea rows={4} value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} placeholder="Vitamin C, Hyaluronic Acid, Niacinamide..." />
                  <span className="hint">{t.ingredientsHint}</span>
                </div>

                <div className="fld">
                  <label>{t.benefits}</label>
                  <textarea rows={5} value={form.benefits} onChange={(e) => set("benefits", e.target.value)} />
                  <span className="hint">{t.benefitsHint}</span>
                </div>

                <div className="fld" style={{ marginBottom: 0 }}>
                  <label>{t.howToUse}</label>
                  <textarea rows={5} value={form.howToUse} onChange={(e) => set("howToUse", e.target.value)} />
                </div>
              </section>

              {/* SETTINGS */}
              <section className="card sec">
                <SecHead icon={<SlidersHorizontal size={20} />} title={t.settings} sub={t.settingsSub} />

                <Toggle icon={<Star size={18} />} title={t.featured} desc={t.featuredDesc} checked={form.featured} onChange={(v) => set("featured", v)} />
                <Toggle icon={<Flame size={18} />} title={t.bestSeller} desc={t.bestSellerDesc} checked={form.bestSeller} onChange={(v) => set("bestSeller", v)} />
                <Toggle icon={<Eye size={18} />} title={t.activeTitle} desc={t.activeDesc} checked={form.isActive} onChange={(v) => set("isActive", v)} />
              </section>

              <div className="fa">
                <Link href={backHref} className="btn ghost">{t.cancel}</Link>

                <button type="submit" className="btn" disabled={loading || uploading}>
                  {loading ? (
                    <>{isEdit ? t.saving : t.creating}</>
                  ) : isEdit ? (
                    <><Save size={17} />{t.save}</>
                  ) : (
                    <><Plus size={17} />{t.create}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

/* ===================== PARTS ===================== */
function SecHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="sh">
      <i>{icon}</i>
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}

function Fld({
  label, value, onChange, placeholder, type = "text", required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="fld">
      <label>
        {label}
        {required && <em>*</em>}
      </label>
      <input type={type} min={type === "number" ? 0 : undefined} step={type === "number" ? "any" : undefined} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`ch${selected ? " sel" : ""}`} onClick={onClick}>
      <i>{selected && <Check size={11} />}</i>
      {children}
    </button>
  );
}

function Toggle({
  icon, title, desc, checked, onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="set">
      <div>
        <span className="si">{icon}</span>
        <div>
          <b>{title}</b>
          <small>{desc}</small>
        </div>
      </div>

      <button type="button" className={`tg${checked ? " on" : ""}`} aria-label={title} aria-pressed={checked} onClick={() => onChange(!checked)}>
        <span />
      </button>
    </div>
  );
}