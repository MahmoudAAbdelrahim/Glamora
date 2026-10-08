"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { ArrowRight, ChevronDown, Heart, Quote, Star } from "lucide-react";

import {
  Concern,
  SkinType,
  categories,
  concerns,
  products,
  skinTypes,
} from "../../data/glamora-products";

/* =========================================================
   FONTS (نفس خطوط التصميم)
========================================================= */


/* =========================================================
   STYLES — كل الستايل جوه الملف، و .gl-home / .gl-hero بيغلبوا Bootstrap
========================================================= */
const CSS = `
.gl-home{--bg:#fff;--ink:#2a1a1f;--mut:#6b5b61;--link:#8b1538;--panel:#fcf1f3;--card:#fff;--sel:#fff;--line:#f3e3e7;--circle:#fce3e8;--circle-h:#f8cdd6;--rev:#fdf3f5;--star:#f5a623;background:var(--bg);color:var(--ink);min-height:100vh}
.gl-home[data-theme="dark"]{--bg:#050505;--ink:#f5e9ed;--mut:#a89aa0;--link:#f4b6c2;--panel:#111827;--card:#111827;--sel:#050505;--line:#39212b;--circle:#1b2540;--circle-h:#8b1538;--rev:#0c0f18}
.gl-home p,.gl-home h2,.gl-home h3{margin:0}
.gl-home a{text-decoration:none}
.gl-home .gl-sec{padding-inline:clamp(16px,4.3vw,64px)}
.gl-home .gl-wrap{max-width:1320px;margin:0 auto}
.gl-home .gl-h2{font-size:clamp(1.6rem,2.6vw,2.4rem);font-weight:600;line-height:1.25;color:var(--ink)}

/* HERO */
.gl-hero{position:relative;width:100%;overflow:hidden;background:#f5bccb}
.gl-hero .gl-stage{position:relative;display:flex;align-items:center;width:100%;min-height:clamp(500px,46vw,700px)}
.gl-hero .gl-himg{object-fit:cover;object-position:center 30%}
.gl-hero[dir="rtl"] .gl-himg{transform:scaleX(-1)}
.gl-hero .gl-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(246,188,203,.55) 0%,rgba(246,188,203,.22) 38%,rgba(246,188,203,0) 58%)}
.gl-hero[dir="rtl"] .gl-shade{background:linear-gradient(270deg,rgba(246,188,203,.55) 0%,rgba(246,188,203,.22) 38%,rgba(246,188,203,0) 58%)}
.gl-hero .gl-content{position:relative;z-index:10;width:100%;padding:0 clamp(24px,7.7vw,140px)}
.gl-hero .gl-title{margin:0;font-size:clamp(2.9rem,6.6vw,6.3rem);font-weight:500;line-height:1.2;letter-spacing:0;color:#7a1331}
.gl-hero[dir="rtl"] .gl-title{line-height:1.35}
.gl-hero .gl-desc{margin:clamp(14px,1.8vw,28px) 0 0;max-width:19.5em;font-size:clamp(1rem,1.75vw,1.6rem);font-weight:500;line-height:1.6;color:#7a2540}
.gl-hero .gl-cta{display:flex;margin-top:clamp(20px,2.6vw,40px)}
.gl-hero .gl-btn{display:inline-flex;align-items:center;justify-content:center;gap:.55em;padding:.8em 2em;border-radius:1.05em;background:linear-gradient(180deg,#8f1739 0%,#6d0f2b 100%);box-shadow:0 .4em 1em rgba(122,19,49,.28),inset 0 1px 0 rgba(255,255,255,.12);color:#fff;font-family:inherit;font-size:clamp(.95rem,1.85vw,1.65rem);font-weight:600;line-height:1.2;text-decoration:none;transition:transform .25s,filter .25s}
.gl-hero .gl-btn:hover{color:#fff;transform:translateY(-2px);filter:brightness(.92)}
.gl-hero .gl-dots{position:absolute;left:50%;bottom:clamp(14px,2.6vw,38px);z-index:20;display:flex;align-items:center;gap:clamp(6px,.8vw,12px);transform:translateX(-50%)}
.gl-hero .gl-dot{display:block;width:clamp(9px,1.15vw,17px);height:clamp(9px,1.15vw,17px);padding:0;border:0;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.gl-hero .gl-dot.on{width:clamp(11px,1.3vw,19px);height:clamp(11px,1.3vw,19px);background:#8b1538}
.gl-hero .gl-dot.dim{background:rgba(255,255,255,.5)}
@media(max-width:767px){.gl-hero .gl-shade,.gl-hero[dir="rtl"] .gl-shade{background:linear-gradient(90deg,rgba(246,188,203,.8) 0%,rgba(246,188,203,.55) 100%)}}

/* FINDER */
.gl-home .gl-find{padding-top:clamp(36px,3.8vw,60px)}
.gl-home .gl-find .gl-h2,.gl-home .gl-find .gl-sub{text-align:center}
.gl-home .gl-sub{margin:.6em auto 0;max-width:46em;font-size:clamp(.85rem,1.15vw,1.05rem);color:var(--mut)}
.gl-home .gl-panels{display:grid;grid-template-columns:1fr;gap:12px;margin-top:clamp(20px,2.6vw,38px)}
.gl-home .gl-panel{padding:clamp(16px,2.2vw,32px);border-radius:20px;background:var(--panel);box-shadow:0 2px 14px rgba(139,21,56,.05)}
.gl-home .gl-fields{display:grid;grid-template-columns:1fr;gap:16px}
.gl-home .gl-lab{display:block}
.gl-home .gl-lab b{display:block;margin-bottom:.6em;font-size:clamp(.9rem,1.2vw,1.1rem);font-weight:600;color:var(--ink)}
.gl-home .gl-sel{position:relative}
.gl-home .gl-sel select{width:100%;height:clamp(48px,4.1vw,58px);padding-block:0;padding-inline:1em 2.6em;appearance:none;-webkit-appearance:none;border:1px solid var(--line);border-radius:8px;background:var(--sel);color:var(--ink);font:inherit;font-size:clamp(.88rem,1.1vw,1rem);font-weight:500;outline:0;box-shadow:0 1px 4px rgba(139,21,56,.05)}
.gl-home .gl-sel select:focus{border-color:#8b1538}
.gl-home .gl-sel svg{position:absolute;top:50%;inset-inline-end:14px;transform:translateY(-50%);color:#8b1538;pointer-events:none}
.gl-home .gl-panel.go{display:flex;align-items:center;padding:clamp(14px,1.8vw,26px)}
.gl-home .gl-go{display:inline-flex;align-items:center;justify-content:center;gap:.6em;width:100%;height:clamp(52px,5vw,70px);border:0;border-radius:14px;background:linear-gradient(180deg,#8f1739 0%,#6d0f2b 100%);box-shadow:0 .5em 1.2em rgba(122,19,49,.25),inset 0 1px 0 rgba(255,255,255,.12);color:#fff;font:inherit;font-size:clamp(.95rem,1.35vw,1.2rem);font-weight:600;cursor:pointer;transition:transform .25s,filter .25s}
.gl-home .gl-go:hover{transform:translateY(-2px);filter:brightness(.92)}

/* CATEGORIES */
.gl-home .gl-cats{display:flex;gap:18px;overflow-x:auto;padding:clamp(28px,3vw,44px) 0 8px;scrollbar-width:none}
.gl-home .gl-cats::-webkit-scrollbar{display:none}
.gl-home .gl-cat{display:flex;flex:0 0 auto;flex-direction:column;align-items:center;gap:12px;width:104px;color:var(--ink)}
.gl-home .gl-cat i{display:grid;place-items:center;width:92px;height:92px;border-radius:50%;background:var(--circle);transition:transform .3s,background .3s,box-shadow .3s}
.gl-home .gl-cat i svg{height:68%;width:auto}
.gl-home .gl-cat:hover i{transform:translateY(-4px);background:var(--circle-h);box-shadow:0 8px 18px rgba(139,21,56,.14)}
.gl-home .gl-cat span{font-size:.85rem;font-weight:500;text-align:center}

/* BEST SELLERS */
.gl-home .gl-bs{padding-top:clamp(28px,3.6vw,56px);padding-bottom:clamp(36px,4vw,64px)}
.gl-home .gl-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:clamp(16px,1.8vw,26px)}
.gl-home .gl-head .gl-h2{font-size:clamp(1.5rem,2.5vw,2.3rem)}
.gl-home .gl-all{display:inline-flex;align-items:center;gap:.5em;color:var(--link);font-size:clamp(.85rem,1.2vw,1.05rem);font-weight:600}
.gl-home .gl-all:hover{opacity:.8}
.gl-home .gl-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.gl-home .gl-card{position:relative;overflow:hidden;border-radius:14px;background:var(--card);box-shadow:0 4px 18px rgba(139,21,56,.08);transition:transform .3s,box-shadow .3s}
.gl-home .gl-card:hover{transform:translateY(-4px);box-shadow:0 10px 26px rgba(139,21,56,.14)}
.gl-home .gl-pimg{display:grid;place-items:center;aspect-ratio:4/3;background:linear-gradient(135deg,#fbe4e8,#f6c9d3)}
.gl-home .gl-pimg svg{height:78%;width:auto;filter:drop-shadow(0 6px 8px rgba(0,0,0,.15));transition:transform .5s}
.gl-home .gl-card:hover .gl-pimg svg{transform:scale(1.05)}
.gl-home .gl-fav{position:absolute;top:10px;inset-inline-end:10px;display:grid;place-items:center;width:clamp(32px,3.2vw,44px);height:clamp(32px,3.2vw,44px);padding:0;border:0;border-radius:50%;background:#fff;color:#8b1538;box-shadow:0 1px 4px rgba(0,0,0,.08);cursor:pointer;transition:background .2s,color .2s}
.gl-home .gl-fav.on{background:#8b1538;color:#fff}
.gl-home .gl-info{display:block;padding:clamp(10px,1vw,14px) clamp(10px,1vw,14px) clamp(12px,1.2vw,16px);color:inherit}
.gl-home .gl-name{min-height:3em;font-family:inherit;font-size:clamp(.85rem,1.2vw,1.05rem);font-weight:500;line-height:1.5;color:var(--ink)}
.gl-home .gl-price{margin:.3em 0;font-size:clamp(.95rem,1.4vw,1.2rem);font-weight:700;color:var(--link)}
.gl-home .gl-rate{display:flex;align-items:center;gap:3px;font-size:clamp(.75rem,1vw,.95rem);color:var(--mut)}
.gl-home .gl-rate b{margin-inline-start:4px;font-weight:600;color:var(--ink)}

/* REVIEWS */
.gl-home .gl-rev{padding-block:clamp(40px,5vw,72px);background:var(--rev)}
.gl-home .gl-pill{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:8px 20px;border:1px solid var(--line);border-radius:999px;background:var(--card);font-size:.8rem;color:var(--mut)}
.gl-home .gl-pill b{font-size:1rem;color:var(--ink)}
.gl-home .gl-rgrid{display:grid;grid-template-columns:1fr;gap:20px;margin-top:clamp(24px,3vw,40px)}
.gl-home .gl-rcard{position:relative;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card);box-shadow:0 2px 12px rgba(139,21,56,.05)}
.gl-home .gl-rcard .q{position:absolute;top:20px;inset-inline-end:20px;color:#f4b6c2}
.gl-home .gl-stars{display:flex;gap:3px;margin-bottom:14px}
.gl-home .gl-rtext{min-height:90px;font-size:.92rem;line-height:1.9;color:var(--mut)}
.gl-home .gl-who{display:flex;align-items:center;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)}
.gl-home .gl-av{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#f4b6c2;font-weight:700;color:#8b1538}
.gl-home .gl-who h3{font-family:inherit;font-size:.9rem;font-weight:700;color:var(--ink)}
.gl-home .gl-who span{font-size:.75rem;color:var(--mut)}

@media(min-width:768px){
  .gl-home .gl-fields{grid-template-columns:repeat(3,1fr);gap:clamp(18px,4vw,56px)}
  .gl-home .gl-grid{grid-template-columns:repeat(3,1fr)}
  .gl-home .gl-rgrid{grid-template-columns:repeat(3,1fr)}
}
@media(min-width:992px){
  .gl-home .gl-panels{grid-template-columns:1fr 24%}
  .gl-home .gl-cats{display:grid;grid-template-columns:repeat(7,1fr);overflow:visible}
  .gl-home .gl-cat{width:auto}
  .gl-home .gl-cat i{width:min(150px,100%);height:auto;aspect-ratio:1}
  .gl-home .gl-cat span{font-size:clamp(.95rem,1.25vw,1.15rem)}
  .gl-home .gl-grid{grid-template-columns:repeat(4,1fr);gap:clamp(16px,3.2vw,44px)}
}
`;

/* =========================================================
   PRODUCT ART (رسمات SVG مؤقتة لحد ما تحط صور حقيقية)
========================================================= */
const CAT_COLOR: Record<string, string> = {
  Foundation: "#d9a77c",
  Lipstick: "#9b1030",
  Mascara: "#2a2a2a",
  Blush: "#e0607a",
  "Skin Care": "#e8c9a0",
  Concealer: "#d4a373",
  "Makeup Sets": "#b0305a",
};

const SHAPES: Record<string, (c: string) => ReactNode> = {
  Foundation: (c) => (
    <>
      <rect x="30" y="50" width="40" height="80" rx="8" fill={c} />
      <rect x="38" y="20" width="24" height="30" rx="4" fill="#222" />
      <rect x="36" y="78" width="28" height="30" rx="3" fill="#fff" opacity=".6" />
    </>
  ),
  Lipstick: (c) => (
    <>
      <rect x="35" y="80" width="30" height="50" rx="4" fill="#222" />
      <rect x="38" y="40" width="24" height="40" fill="#c9a24b" />
      <path d="M38 40q12-30 24 0z" fill={c} />
    </>
  ),
  Mascara: (c) => (
    <>
      <rect x="42" y="20" width="16" height="50" rx="4" fill="#222" />
      <rect x="38" y="70" width="24" height="60" rx="5" fill={c} />
      <rect x="38" y="90" width="24" height="6" fill="#c9a24b" />
    </>
  ),
  Blush: (c) => (
    <>
      <circle cx="50" cy="75" r="42" fill="#eee" />
      <circle cx="50" cy="75" r="32" fill={c} />
      <circle cx="40" cy="65" r="8" fill="#fff" opacity=".3" />
    </>
  ),
  "Skin Care": (c) => (
    <>
      <rect x="30" y="70" width="40" height="60" rx="8" fill={c} />
      <rect x="42" y="45" width="16" height="25" fill="#222" />
      <path d="M42 45q8-25 16 0z" fill="#444" />
    </>
  ),
  Concealer: (c) => (
    <>
      <rect x="40" y="50" width="20" height="80" rx="8" fill={c} />
      <rect x="38" y="20" width="24" height="30" rx="5" fill="#222" />
    </>
  ),
  "Makeup Sets": (c) => (
    <>
      <rect x="12" y="55" width="76" height="70" rx="6" fill={c} />
      <rect x="12" y="55" width="76" height="14" fill="#fff" opacity=".35" />
      <circle cx="50" cy="100" r="14" fill="#fff" opacity=".5" />
    </>
  ),
};

function Art({ category, color }: { category: string; color: string }) {
  const draw = SHAPES[category] ?? SHAPES.Foundation;

  return (
    <svg viewBox="0 0 100 150" aria-hidden="true">
      {draw(color)}
    </svg>
  );
}

/* =========================================================
   DATA / TEXT
========================================================= */
const SKIN_AR: Record<SkinType, string> = {
  Oily: "دهنية",
  Dry: "جافة",
  Combination: "مختلطة",
  Sensitive: "حساسة",
  Normal: "عادية",
};

const CONCERN_AR: Record<Concern, string> = {
  Acne: "حب الشباب",
  Dryness: "الجفاف",
  "Oil Control": "التحكم في الدهون",
  "Dark Spots": "البقع الداكنة",
  Sensitivity: "الحساسية",
  Glow: "الإشراقة",
};

const CAT_AR: Record<string, string> = {
  Foundation: "فاونديشن",
  Lipstick: "أحمر شفاه",
  Mascara: "ماسكارا",
  Blush: "بلاشر",
  "Skin Care": "العناية بالبشرة",
  Concealer: "كونسيلر",
  "Makeup Sets": "مجموعات مكياج",
};

const REVIEWS = [
  {
    nameAr: "سارة أحمد",
    nameEn: "Sara Ahmed",
    textAr:
      "الموقع ساعدني جدًا في اختيار المنتجات المناسبة لبشرتي. الفلتر ممتاز وسهل الاستخدام.",
    textEn:
      "The website helped me choose products that actually suit my skin. The filter is simple and useful.",
    rating: 5,
  },
  {
    nameAr: "نور محمد",
    nameEn: "Nour Mohamed",
    textAr: "المنتجات والأسعار واضحة جدًا، والتجربة بشكل عام مريحة وسريعة.",
    textEn:
      "The products and prices are very clear, and the overall experience is smooth and fast.",
    rating: 5,
  },
  {
    nameAr: "منة علي",
    nameEn: "Menna Ali",
    textAr:
      "أحببت فكرة البحث حسب نوع البشرة والميزانية، وفعلًا وفرت علي وقت كبير.",
    textEn:
      "I love searching by skin type and budget. It really saved me a lot of time.",
    rating: 4,
  },
];

const TEXT = {
  ar: {
    heroTitle: (
      <>
        جمال
        <br />
        يناسبك
      </>
    ),
    heroDesc: "اكتشفي منتجات المكياج المختارة خصيصًا لتناسب نوع بشرتك.",
    heroBtn: "تسوقي الآن",
    findTitle: "اكتشفي منتجاتك المثالية",
    findDesc: "اختاري نوع بشرتك والميزانية للحصول على ترشيحات مناسبة لك.",
    skin: "نوع البشرة",
    budget: "الميزانية",
    concern: "المشكلة",
    allSkin: "كل أنواع البشرة",
    allConcern: "كل المشاكل",
    upTo: (n: number) => `حتى ${n} جنيه`,
    show: "عرض المنتجات",
    bsTitle: "الأكثر مبيعًا",
    viewAll: "عرض الكل",
    revTitle: "آراء عملائنا",
    revSub: "تجارب حقيقية من الأشخاص الذين اختاروا Glamora.",
    based: "بناءً على أكثر من 500 تقييم",
  },
  en: {
    heroTitle: (
      <>
        Beauty
        <br />
        That Fits You
      </>
    ),
    heroDesc:
      "Discover makeup products specially selected for your skin type.",
    heroBtn: "Shop Now",
    findTitle: "Find Your Perfect Products",
    findDesc:
      "Tell us about your skin type and budget to get personalized recommendations.",
    skin: "Skin Type",
    budget: "Budget",
    concern: "Concern",
    allSkin: "All Skin Types",
    allConcern: "All Concerns",
    upTo: (n: number) => `Up to ${n} EGP`,
    show: "Show Products",
    bsTitle: "Best Sellers",
    viewAll: "View All",
    revTitle: "What Our Customers Say",
    revSub: "Real experiences from people who chose Glamora.",
    based: "Based on 500+ reviews",
  },
};

/* =========================================================
   SMALL PARTS
========================================================= */
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="gl-lab">
      <b>{label}</b>
      <div className="gl-sel">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} />
      </div>
    </label>
  );
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={i < Math.round(rating) ? 0 : 1.5}
          fill={i < Math.round(rating) ? "var(--star)" : "none"}
          color={i < Math.round(rating) ? "var(--star)" : "#d1c4c8"}
        />
      ))}
    </>
  );
}

/* =========================================================
   HOME (كل أقسام الصفحة في مكان واحد)
========================================================= */
export default function HomeClient({ locale }: { locale: "ar" | "en" }) {
  const router = useRouter();
  const isAr = locale === "ar";
  const t = TEXT[locale];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  const [skin, setSkin] = useState<SkinType | "">("");
  const [budget, setBudget] = useState<number>(2000);
  const [concern, setConcern] = useState<Concern | "">("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const bestSellers = [...products]
    .sort((a, b) =>
      b.rating !== a.rating ? b.rating - a.rating : b.reviews - a.reviews
    )
    .slice(0, 4);

  const toggleFavorite = (id: number) =>
    setFavorites((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

  function handleSubmit() {
    const params = new URLSearchParams();
    if (skin) params.set("skin", skin);
    if (budget) params.set("budget", String(budget));
    if (concern) params.set("concern", concern);
    router.push(`/${locale}/products?${params.toString()}`);
  }

  const displayName = (p: (typeof products)[number]) =>
    p.name.toLowerCase().startsWith(p.brand.toLowerCase())
      ? p.name
      : `${p.brand} ${p.name}`;

  return (
    <>
      <style>{CSS}</style>

      <main
        dir={isAr ? "rtl" : "ltr"}
        className={`gl-home `}
        data-theme={dark ? "dark" : "light"}
      >
        {/* ================= 1. HERO ================= */}
        <section dir={isAr ? "rtl" : "ltr"} className="gl-hero">
          <div className="gl-stage">
            <Image
              src="/images/hero/hero-main.png"
              alt="Glamora Beauty"
              fill
              priority
              sizes="100vw"
              className="gl-himg"
            />
            <div className="gl-shade" />

            <div className="gl-content">
              <h1 className={`gl-title `}>{t.heroTitle}</h1>
              <p className="gl-desc">{t.heroDesc}</p>
              <div className="gl-cta">
                <Link href={`/${locale}/products`} className="gl-btn">
                  <span>{t.heroBtn}</span>
                  <ArrowRight
                    size="1.15em"
                    strokeWidth={2.2}
                    style={isAr ? { transform: "rotate(180deg)" } : undefined}
                  />
                </Link>
              </div>
            </div>

            <div className="gl-dots">
              <button type="button" aria-label="Slide 1" className="gl-dot on" />
              <button type="button" aria-label="Slide 2" className="gl-dot" />
              <button type="button" aria-label="Slide 3" className="gl-dot dim" />
            </div>
          </div>
        </section>

        {/* ================= 2. PRODUCT FINDER ================= */}
        <section className="gl-sec gl-find">
          <div className="gl-wrap">
            <h2 className={`gl-h2 `}>{t.findTitle}</h2>
            <p className="gl-sub">{t.findDesc}</p>

            <div className="gl-panels">
              <div className="gl-panel">
                <div className="gl-fields">
                  <Select
                    label={t.skin}
                    value={skin}
                    onChange={(v) => setSkin(v as SkinType | "")}
                    options={[
                      { value: "", label: t.allSkin },
                      ...skinTypes.map((s) => ({
                        value: s,
                        label: isAr ? SKIN_AR[s] : s,
                      })),
                    ]}
                  />
                  <Select
                    label={t.budget}
                    value={String(budget)}
                    onChange={(v) => setBudget(Number(v))}
                    options={[500, 1000, 1500, 2000].map((n) => ({
                      value: String(n),
                      label: t.upTo(n),
                    }))}
                  />
                  <Select
                    label={t.concern}
                    value={concern}
                    onChange={(v) => setConcern(v as Concern | "")}
                    options={[
                      { value: "", label: t.allConcern },
                      ...concerns.map((c) => ({
                        value: c,
                        label: isAr ? CONCERN_AR[c] : c,
                      })),
                    ]}
                  />
                </div>
              </div>

              <div className="gl-panel go">
                <button type="button" className="gl-go" onClick={handleSubmit}>
                  <span>{t.show}</span>
                  <ArrowRight
                    size="1.1em"
                    strokeWidth={2.2}
                    style={isAr ? { transform: "rotate(180deg)" } : undefined}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. CATEGORIES ================= */}
        <section className="gl-sec">
          <div className="gl-wrap">
            <div className="gl-cats">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/${locale}/products?category=${encodeURIComponent(
                    category
                  )}`}
                  className="gl-cat"
                >
                  <i>
                    <Art
                      category={category}
                      color={CAT_COLOR[category] ?? "#d9a77c"}
                    />
                  </i>
                  <span>{isAr ? CAT_AR[category] ?? category : category}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 4. BEST SELLERS ================= */}
        <section className="gl-sec gl-bs">
          <div className="gl-wrap">
            <div className="gl-head">
              <h2 className={`gl-h2 `}>{t.bsTitle}</h2>
              <Link href={`/${locale}/products`} className="gl-all">
                <span>{t.viewAll}</span>
                <ArrowRight
                  size="1.1em"
                  strokeWidth={2.2}
                  style={isAr ? { transform: "rotate(180deg)" } : undefined}
                />
              </Link>
            </div>

            <div className="gl-grid">
              {bestSellers.map((p) => {
                const fav = favorites.includes(p.id);
                const href = `/${locale}/products/${p.id}`;

                return (
                  <article key={p.id} className="gl-card">
                    <Link href={href} className="gl-pimg" aria-label={p.name}>
                      <Art category={p.category} color={p.color} />
                    </Link>

                    <button
                      type="button"
                      aria-label="Favorite"
                      onClick={() => toggleFavorite(p.id)}
                      className={`gl-fav${fav ? " on" : ""}`}
                    >
                      <Heart size={18} fill={fav ? "currentColor" : "none"} />
                    </button>

                    <Link href={href} className="gl-info">
                      <h3 className="gl-name">{displayName(p)}</h3>
                      <div className="gl-price">
                        {p.price.toLocaleString("en-US")} EGP
                      </div>
                      <div className="gl-rate">
                        <Stars rating={p.rating} />
                        <b>{p.rating}</b>
                        <span>({p.reviews})</span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 5. REVIEWS ================= */}
        <section className="gl-sec gl-rev">
          <div className="gl-wrap">
            <div style={{ textAlign: "center" }}>
              <h2 className={`gl-h2 `}>{t.revTitle}</h2>
              <p className="gl-sub">{t.revSub}</p>
              <div className="gl-pill">
                <Star size={18} fill="var(--star)" strokeWidth={0} />
                <b>4.8</b>
                <span>{t.based}</span>
              </div>
            </div>

            <div className="gl-rgrid">
              {REVIEWS.map((r) => {
                const name = isAr ? r.nameAr : r.nameEn;

                return (
                  <article key={r.nameEn} className="gl-rcard">
                    <Quote size={30} className="q" />
                    <div className="gl-stars">
                      <Stars rating={r.rating} size={16} />
                    </div>
                    <p className="gl-rtext">
                      &ldquo;{isAr ? r.textAr : r.textEn}&rdquo;
                    </p>
                    <div className="gl-who">
                      <div className="gl-av">{name.charAt(0)}</div>
                      <div>
                        <h3>{name}</h3>
                        <span>Glamora Customer</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
