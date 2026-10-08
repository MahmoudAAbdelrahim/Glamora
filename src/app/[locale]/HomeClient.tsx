"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import { Inter, Playfair_Display } from "next/font/google";
import { ArrowRight, ChevronDown, Heart, Quote, ShoppingBag, Star } from "lucide-react";
import { useAuth } from "@/src/components/providers/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* =========================================================
   صور الكاتيجوريز: لو عندك روابط صور حقيقية حطها هنا (بتغلب أي حاجة)
   مثال: Foundation: "https://res.cloudinary.com/.../foundation.jpg"
   لو فاضية بياخد صورة أول منتج مطابق من الداتابيز، ولو مفيش بيرسم SVG
========================================================= */
const CATEGORY_IMAGES: Record<string, string> = {};

/* =========================================================
   STYLES
========================================================= */
const CSS = `
.gl-home{--bg:#fff;--ink:#2a1a1f;--mut:#6b5b61;--link:#8b1538;--panel:#fcf1f3;--card:#fff;--sel:#fff;--line:#f3e3e7;--circle:#fce3e8;--circle-h:#f8cdd6;--rev:#fdf3f5;--star:#f5a623;--soft:#fbe4e8;background:var(--bg);color:var(--ink);min-height:100vh}
.gl-home *{box-sizing:border-box}
.gl-home p,.gl-home h2,.gl-home h3{margin:0}
.gl-home a{text-decoration:none}
.gl-home .gl-sec{padding-inline:clamp(16px,4.3vw,64px)}
.gl-home .gl-wrap{max-width:1320px;margin:0 auto}
.gl-home .gl-h2{font-size:clamp(1.6rem,2.6vw,2.4rem);font-weight:600;line-height:1.25;color:var(--ink)}
.gl-home .gl-muted{color:var(--mut);font-size:.95rem}

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

/* FINDER */
.gl-home .gl-find{padding-top:clamp(36px,3.8vw,60px)}
.gl-home .gl-find .gl-h2,.gl-home .gl-find .gl-sub{text-align:center}
.gl-home .gl-sub{margin:.6em auto 0;max-width:46em;font-size:clamp(.85rem,1.15vw,1.05rem);color:var(--mut)}
.gl-home .gl-panels{display:grid;grid-template-columns:1fr;gap:12px;margin-top:clamp(20px,2.6vw,38px)}
.gl-home .gl-panel{padding:clamp(16px,2.2vw,32px);border-radius:20px;background:var(--panel);box-shadow:0 2px 14px rgba(139,21,56,.05)}
.gl-home .gl-fields{display:grid;grid-template-columns:1fr;gap:16px}
.gl-home .gl-lab{display:block;margin:0}
.gl-home .gl-lab b{display:block;margin-bottom:.6em;font-size:clamp(.9rem,1.2vw,1.1rem);font-weight:600;color:var(--ink)}
.gl-home .gl-sel{position:relative}
.gl-home .gl-sel select{width:100%;height:clamp(48px,4.1vw,58px);padding-block:0;padding-inline:1em 2.6em;appearance:none;-webkit-appearance:none;border:1px solid var(--line);border-radius:8px;background:var(--sel);color:var(--ink);font:inherit;font-size:clamp(.88rem,1.1vw,1rem);font-weight:500;outline:0;box-shadow:0 1px 4px rgba(139,21,56,.05)}
.gl-home .gl-sel select:focus{border-color:#8b1538}
.gl-home .gl-sel svg{position:absolute;top:50%;inset-inline-end:14px;transform:translateY(-50%);color:#8b1538;pointer-events:none}
.gl-home .gl-panel.go{display:flex;align-items:center;padding:clamp(14px,1.8vw,26px)}
.gl-home .gl-go{display:inline-flex;align-items:center;justify-content:center;gap:.6em;width:100%;height:clamp(52px,5vw,70px);border:0;border-radius:14px;background:linear-gradient(180deg,#8f1739 0%,#6d0f2b 100%);box-shadow:0 .5em 1.2em rgba(122,19,49,.25),inset 0 1px 0 rgba(255,255,255,.12);color:#fff;font:inherit;font-size:clamp(.95rem,1.35vw,1.2rem);font-weight:600;cursor:pointer;transition:transform .25s,filter .25s}
.gl-home .gl-go:hover{transform:translateY(-2px);filter:brightness(.92)}
.gl-home .gl-go:disabled{opacity:.6;cursor:not-allowed;transform:none}

/* RESULTS */
.gl-home .gl-res{padding-top:clamp(24px,3vw,44px)}
.gl-home .gl-resh{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:clamp(16px,1.8vw,26px)}
.gl-home .gl-resh h2{font-size:clamp(1.4rem,2.3vw,2rem)}
.gl-home .gl-resh small{display:block;margin-top:4px;color:var(--mut);font-size:.85rem;font-weight:500}
.gl-home .gl-rbtns{display:flex;flex-wrap:wrap;gap:10px}
.gl-home .gl-lnk{display:inline-flex;align-items:center;gap:.45em;padding:0;border:0;background:transparent;color:var(--link);font:inherit;font-size:clamp(.85rem,1.15vw,1rem);font-weight:600;cursor:pointer}
.gl-home .gl-lnk:hover{opacity:.8}
.gl-home .gl-state{display:grid;place-items:center;min-height:160px;padding:20px;border-radius:16px;background:var(--panel);color:var(--mut);font-size:.95rem;text-align:center}

/* CATEGORIES */
.gl-home .gl-cats{display:flex;gap:18px;overflow-x:auto;padding:clamp(28px,3vw,44px) 4px 8px;scrollbar-width:none;scroll-snap-type:x proximity}
.gl-home .gl-cats::-webkit-scrollbar{display:none}
.gl-home .gl-cat{display:flex;flex:0 0 auto;flex-direction:column;align-items:center;gap:12px;width:104px;color:var(--ink);scroll-snap-align:start}
.gl-home .gl-cat i{display:grid;place-items:center;width:92px;height:92px;overflow:hidden;border-radius:50%;background:var(--circle);transition:transform .3s,background .3s,box-shadow .3s}
.gl-home .gl-cat i svg{height:68%;width:auto}
.gl-home .gl-cat i img{width:100%;height:100%;object-fit:cover}
.gl-home .gl-cat:hover i{transform:translateY(-4px);background:var(--circle-h);box-shadow:0 8px 18px rgba(139,21,56,.14)}
.gl-home .gl-cat span{font-size:.85rem;font-weight:500;text-align:center}

/* BEST SELLERS + RESULTS GRID */
.gl-home .gl-bs{padding-top:clamp(28px,3.6vw,56px);padding-bottom:clamp(36px,4vw,64px)}
.gl-home .gl-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:clamp(16px,1.8vw,26px)}
.gl-home .gl-head .gl-h2{font-size:clamp(1.5rem,2.5vw,2.3rem)}
.gl-home .gl-all{display:inline-flex;align-items:center;gap:.5em;color:var(--link);font-size:clamp(.85rem,1.2vw,1.05rem);font-weight:600}
.gl-home .gl-all:hover{opacity:.8}
.gl-home .gl-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.gl-home .gl-card{position:relative;min-width:0;overflow:hidden;border-radius:14px;background:var(--card);box-shadow:0 4px 18px rgba(139,21,56,.08);transition:transform .3s,box-shadow .3s}
.gl-home .gl-card:hover{transform:translateY(-4px);box-shadow:0 10px 26px rgba(139,21,56,.14)}
.gl-home .gl-pimg{display:grid;place-items:center;aspect-ratio:4/3;overflow:hidden;background:linear-gradient(135deg,#fbe4e8,#f6c9d3);color:var(--link)}
.gl-home .gl-pimg img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.gl-home .gl-card:hover .gl-pimg img{transform:scale(1.05)}
.gl-home .gl-fav{position:absolute;top:10px;inset-inline-end:10px;z-index:2;display:grid;place-items:center;width:clamp(32px,3.2vw,44px);height:clamp(32px,3.2vw,44px);padding:0;border:0;border-radius:50%;background:#fff;color:#8b1538;box-shadow:0 1px 4px rgba(0,0,0,.08);cursor:pointer;transition:background .2s,color .2s,transform .2s}
.gl-home .gl-fav:hover{transform:scale(1.07)}
.gl-home .gl-fav.on{background:#8b1538;color:#fff}
.gl-home .gl-info{padding:clamp(10px,1vw,14px) clamp(10px,1vw,14px) clamp(12px,1.2vw,16px)}
.gl-home .gl-nm{display:block;min-height:3em;color:var(--ink);font-size:clamp(.85rem,1.2vw,1.05rem);font-weight:500;line-height:1.5}
.gl-home .gl-nm:hover{color:var(--link)}
.gl-home .gl-prow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:.3em 0}
.gl-home .gl-price{font-size:clamp(.95rem,1.4vw,1.2rem);font-weight:700;color:var(--link)}
.gl-home .gl-price del{margin-inline-start:8px;color:var(--mut);font-size:.72em;font-weight:500}
.gl-home .gl-cart{display:grid;flex:0 0 auto;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:var(--soft);color:var(--link);cursor:pointer;transition:background .2s,color .2s}
.gl-home .gl-cart:hover:not(:disabled){background:#8b1538;color:#fff}
.gl-home .gl-cart:disabled{opacity:.4;cursor:not-allowed}
.gl-home .gl-rate{display:flex;align-items:center;gap:3px;font-size:clamp(.75rem,1vw,.95rem);color:var(--mut)}
.gl-home .gl-rate b{margin-inline-start:4px;font-weight:600;color:var(--ink)}
.gl-home .gl-out{margin-inline-start:auto;color:#bf3349;font-size:.85em;font-weight:700}

/* REVIEWS */
.gl-home .gl-rev{padding-block:clamp(40px,5vw,72px);background:var(--rev)}
.gl-home .gl-pill{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:8px 20px;border:1px solid var(--line);border-radius:999px;background:var(--card);font-size:.8rem;color:var(--mut)}
.gl-home .gl-pill b{font-size:1rem;color:var(--ink)}
.gl-home .gl-rgrid{display:grid;grid-template-columns:1fr;gap:20px;margin-top:clamp(24px,3vw,40px)}
.gl-home .gl-rcard{position:relative;min-width:0;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card);box-shadow:0 2px 12px rgba(139,21,56,.05)}
.gl-home .gl-rcard .q{position:absolute;top:20px;inset-inline-end:20px;color:#f4b6c2}
.gl-home .gl-stars{display:flex;gap:3px;margin-bottom:14px}
.gl-home .gl-rtext{min-height:90px;font-size:.92rem;line-height:1.9;color:var(--mut);overflow-wrap:anywhere}
.gl-home .gl-who{display:flex;align-items:center;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)}
.gl-home .gl-av{display:grid;flex:0 0 auto;place-items:center;width:40px;height:40px;border-radius:50%;background:#f4b6c2;font-weight:700;color:#8b1538}
.gl-home .gl-who h3{font-family:inherit;font-size:.9rem;font-weight:700;color:var(--ink)}
.gl-home .gl-who span{font-size:.75rem;color:var(--mut)}
.gl-home .gl-more{display:flex;justify-content:center;margin-top:24px}

/* RATE US */
.gl-home .gl-rate-card{max-width:680px;margin:clamp(28px,3.5vw,48px) auto 0;padding:clamp(20px,3vw,34px);border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:0 4px 18px rgba(139,21,56,.07)}
.gl-home .gl-rate-card h3{font-size:clamp(1.15rem,1.8vw,1.4rem);font-weight:700;text-align:center}
.gl-home .gl-rate-card .gl-muted{margin-top:6px;text-align:center}
.gl-home .gl-starin{display:flex;justify-content:center;gap:8px;margin:18px 0}
.gl-home .gl-starin button{padding:2px;border:0;background:transparent;line-height:0;cursor:pointer;transition:transform .15s}
.gl-home .gl-starin button:hover{transform:scale(1.15)}
.gl-home .gl-ta{display:block;width:100%;min-height:120px;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--sel);color:var(--ink);font:inherit;font-size:.92rem;line-height:1.7;resize:vertical;outline:0;transition:border-color .2s,box-shadow .2s}
.gl-home .gl-ta:focus{border-color:#8b1538;box-shadow:0 0 0 3px rgba(139,21,56,.08)}
.gl-home .gl-sendrow{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-top:14px}
.gl-home .gl-as{color:var(--mut);font-size:.82rem}
.gl-home .gl-as b{color:var(--ink)}
.gl-home .gl-send{display:inline-flex;align-items:center;justify-content:center;gap:.5em;min-height:46px;padding:0 26px;border:0;border-radius:12px;background:linear-gradient(180deg,#8f1739 0%,#6d0f2b 100%);color:#fff;font:inherit;font-size:.92rem;font-weight:600;cursor:pointer;transition:filter .2s}
.gl-home .gl-send:hover:not(:disabled){filter:brightness(.92)}
.gl-home .gl-send:disabled{opacity:.6;cursor:not-allowed}
.gl-home .gl-login{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;margin-top:18px;padding:16px;border-radius:12px;background:var(--panel);color:var(--mut);font-size:.9rem;text-align:center}
.gl-home .gl-login a{color:var(--link);font-weight:700}

.gl-home .gl-toast{position:fixed;bottom:24px;inset-inline-end:24px;z-index:100;display:flex;align-items:center;gap:9px;max-width:calc(100vw - 32px);padding:13px 17px;border:1px solid var(--line);border-radius:12px;background:var(--card);box-shadow:0 16px 40px rgba(0,0,0,.18);color:var(--ink);font-size:.85rem;font-weight:700}
.gl-home .gl-toast i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#8b1538}

@media(max-width:767px){
  .gl-hero .gl-himg{object-position:78% 30%}
  .gl-hero .gl-shade,.gl-hero[dir="rtl"] .gl-shade{background:linear-gradient(90deg,rgba(246,188,203,.82) 0%,rgba(246,188,203,.5) 100%)}
  .gl-home .gl-toast{inset-inline:16px;bottom:16px}
}
@media(max-width:380px){.gl-home .gl-grid{grid-template-columns:1fr}}
@media(min-width:768px){
  .gl-home .gl-fields{grid-template-columns:repeat(3,1fr);gap:clamp(18px,4vw,56px)}
  .gl-home .gl-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .gl-home .gl-rgrid{grid-template-columns:repeat(2,1fr)}
}
@media(min-width:992px){
  .gl-home .gl-panels{grid-template-columns:1fr 24%}
  .gl-home .gl-cats{display:grid;grid-template-columns:repeat(7,1fr);overflow:visible}
  .gl-home .gl-cat{width:auto}
  .gl-home .gl-cat i{width:min(150px,100%);height:auto;aspect-ratio:1}
  .gl-home .gl-cat span{font-size:clamp(.95rem,1.25vw,1.15rem)}
  .gl-home .gl-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(16px,3.2vw,44px)}
  .gl-home .gl-rgrid{grid-template-columns:repeat(3,1fr)}
}
@media(prefers-reduced-motion:reduce){.gl-home *{transition:none!important}}
`;

/* =========================================================
   ART (احتياطي لو مفيش صورة)
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

function Art({ category }: { category: string }) {
  const draw = SHAPES[category] ?? SHAPES.Foundation;
  return (
    <svg viewBox="0 0 100 150" aria-hidden="true">
      {draw(CAT_COLOR[category] ?? "#d9a77c")}
    </svg>
  );
}

/* =========================================================
   TYPES + DATA
========================================================= */
type ApiProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  currency?: string;
  price: number;
  discountPrice?: number | null;
  images?: { url: string; publicId?: string }[];
  skinTypes?: string[];
  concerns?: string[];
  stock?: number;
  rating: number;
  reviewsCount: number;
  bestSeller?: boolean;
};

type ApiReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
};

type Applied = { skin: string; budget: number; concern: string };

/* [value في الداتابيز, English, Arabic] */
const SKIN_OPTS: [string, string, string][] = [
  ["oily", "Oily", "دهنية"],
  ["dry", "Dry", "جافة"],
  ["combination", "Combination", "مختلطة"],
  ["sensitive", "Sensitive", "حساسة"],
  ["normal", "Normal", "عادية"],
];

const CONCERN_OPTS: [string, string, string][] = [
  ["acne", "Acne", "حب الشباب"],
  ["dark-circles", "Dark Circles", "الهالات السوداء"],
  ["wrinkles", "Anti-Aging", "مقاومة التجاعيد"],
  ["dullness", "Brightening", "تفتيح البشرة"],
  ["pores", "Pores", "المسام"],
  ["dehydration", "Hydration", "الترطيب"],
  ["dark-spots", "Dark Spots", "البقع الداكنة"],
  ["dryness", "Dryness", "الجفاف"],
  ["oiliness", "Oil Control", "التحكم في الدهون"],
  ["redness", "Redness", "الاحمرار"],
  ["fine-lines", "Fine Lines", "الخطوط الدقيقة"],
  ["uneven-tone", "Uneven Tone", "تفاوت اللون"],
  ["blackheads", "Blackheads", "الرؤوس السوداء"],
  ["blemishes", "Blemishes", "العيوب"],
];

const BUDGETS = [500, 1000, 1500, 2000];

/* الكاتيجوريز: kw = كلمات بنطابقها مع اسم المنتج، q = كلمة البحث في صفحة المنتجات */
const CATS: { key: string; ar: string; kw: string[]; q: string; skincare?: boolean }[] = [
  { key: "Foundation", ar: "فاونديشن", kw: ["foundation", "فاونديشن"], q: "foundation" },
  { key: "Lipstick", ar: "أحمر شفاه", kw: ["lipstick", "lip", "روج", "شفاه"], q: "lipstick" },
  { key: "Mascara", ar: "ماسكارا", kw: ["mascara", "ماسكارا"], q: "mascara" },
  { key: "Blush", ar: "بلاشر", kw: ["blush", "highlighter", "بلاشر"], q: "blush" },
  { key: "Skin Care", ar: "العناية بالبشرة", kw: ["serum", "cream", "cleanser", "moistur", "سيروم", "كريم"], q: "serum", skincare: true },
  { key: "Concealer", ar: "كونسيلر", kw: ["concealer", "كونسيلر"], q: "concealer" },
  { key: "Makeup Sets", ar: "مجموعات مكياج", kw: ["set", "kit", "palette", "مجموعة"], q: "set" },
];

/* ---------- API helpers ---------- */
function normalizeProducts(json: any): ApiProduct[] {
  const list = json?.data?.products ?? json?.products ?? (Array.isArray(json?.data) ? json.data : []);
  if (!Array.isArray(list)) return [];

  return list
    .map((p: any) => ({
      ...p,
      id: String(p?.id ?? p?._id ?? ""),
      price: Number(p?.price ?? 0),
      discountPrice: p?.discountPrice == null ? null : Number(p.discountPrice),
      rating: Number(p?.rating ?? 0),
      reviewsCount: Number(p?.reviewsCount ?? p?.reviews ?? 0),
    }))
    .filter((p: ApiProduct) => Boolean(p.id) && p.isActive !== false);
}

async function fetchAllProducts(): Promise<ApiProduct[]> {
  const get = async (page: number) => {
    const res = await fetch(`/api/products?page=${page}&limit=48`, { cache: "no-store" });
    if (!res.ok) throw new Error("products");
    const json = await res.json();
    return { list: normalizeProducts(json), pages: Number(json?.data?.pagination?.totalPages ?? 1) };
  };

  const first = await get(1);
  let list = first.list;

  if (first.pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: Math.min(first.pages, 10) - 1 }, (_, k) => get(k + 2))
    );
    rest.forEach((r) => (list = list.concat(r.list)));
  }

  return list;
}

function normalizeReviews(json: any): { list: ApiReview[]; average: number; count: number } {
  const raw = json?.data?.reviews ?? json?.reviews ?? (Array.isArray(json?.data) ? json.data : []);

  const list: ApiReview[] = (Array.isArray(raw) ? raw : [])
    .map((r: any, i: number) => ({
      id: String(r?.id ?? r?._id ?? i),
      name: String(r?.name ?? r?.userName ?? "Glamora Customer"),
      rating: Number(r?.rating ?? 0),
      comment: String(r?.comment ?? r?.text ?? r?.message ?? "").trim(),
    }))
    .filter((r: ApiReview) => r.comment);

  const count = Number(json?.data?.stats?.count ?? list.length);
  const average = Number(
    json?.data?.stats?.average ??
      (list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0)
  );

  return { list, average, count };
}

const effectivePrice = (p: ApiProduct) => p.discountPrice ?? p.price;

const displayName = (p: ApiProduct) =>
  p.name.toLowerCase().startsWith((p.brand || "").toLowerCase()) ? p.name : `${p.brand} ${p.name}`;

const userDisplayName = (u: any) =>
  u?.name ||
  u?.fullName ||
  [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
  u?.username ||
  (u?.email ? String(u.email).split("@")[0] : "");

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

function ProductCard({
  p,
  locale,
  fav,
  onFav,
  onCart,
}: {
  p: ApiProduct;
  locale: "ar" | "en";
  fav: boolean;
  onFav: (id: string) => void;
  onCart: (p: ApiProduct) => void;
}) {
  const isAr = locale === "ar";
  const href = `/${locale}/products/${p.id}`;
  const image = p.images?.[0]?.url;
  const hasDiscount = p.discountPrice != null && p.discountPrice < p.price;
  const money = (n: number) => n.toLocaleString(isAr ? "ar-EG" : "en-US");
  const cur = p.currency || "EGP";
  const soldOut = (p.stock ?? 1) <= 0;

  return (
    <article className="gl-card">
      <Link href={href} className="gl-pimg" aria-label={p.name}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={p.name} loading="lazy" decoding="async" />
        ) : (
          <ShoppingBag size={34} />
        )}
      </Link>

      <button
        type="button"
        aria-label="Favorite"
        onClick={() => onFav(p.id)}
        className={`gl-fav${fav ? " on" : ""}`}
      >
        <Heart size={18} fill={fav ? "currentColor" : "none"} />
      </button>

      <div className="gl-info">
        <Link href={href} className="gl-nm">
          {displayName(p)}
        </Link>

        <div className="gl-prow">
          <div className="gl-price">
            {money(effectivePrice(p))} {cur}
            {hasDiscount && <del>{money(p.price)}</del>}
          </div>

          <button
            type="button"
            className="gl-cart"
            aria-label={isAr ? "أضف للسلة" : "Add to cart"}
            title={isAr ? "أضف للسلة" : "Add to cart"}
            disabled={soldOut}
            onClick={() => onCart(p)}
          >
            <ShoppingBag size={16} />
          </button>
        </div>

        <div className="gl-rate">
          <Stars rating={p.rating} />
          <b>{p.rating.toFixed(1)}</b>
          <span>({p.reviewsCount})</span>
          {soldOut && <span className="gl-out">{isAr ? "نفد" : "Sold out"}</span>}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HOME
========================================================= */
export default function HomeClient({ locale }: { locale: "ar" | "en" }) {
  const isAr = locale === "ar";
  const L = (en: string, ar: string) => (isAr ? ar : en);

  const auth = useAuth() as any;
  const user = auth?.user;
  const userName = userDisplayName(user);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  /* ----- data ----- */
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [revStats, setRevStats] = useState({ average: 0, count: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  /* ----- finder ----- */
  const [skin, setSkin] = useState("");
  const [budget, setBudget] = useState(0);
  const [concern, setConcern] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  /* ----- rate us ----- */
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [toast, setToast] = useState("");
  const flash = useCallback((text: string, ms = 2600) => {
    setToast(text);
    window.setTimeout(() => setToast(""), ms);
  }, []);

  /* ----- loaders ----- */
  useEffect(() => {
    let off = false;

    (async () => {
      try {
        const list = await fetchAllProducts();
        if (!off) setProducts(list);
      } catch {
        if (!off) setProducts([]);
      } finally {
        if (!off) setProductsLoading(false);
      }
    })();

    return () => {
      off = true;
    };
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/site-reviews?limit=30", { cache: "no-store" });
      if (!res.ok) throw new Error("reviews");
      const { list, average, count } = normalizeReviews(await res.json());
      setReviews(list);
      setRevStats({ average, count });
    } catch {
      setReviews([]);
      setRevStats({ average: 0, count: 0 });
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    let off = false;

    (async () => {
      try {
        const res = await fetch("/api/favorites", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const list = json?.data?.favorites ?? json?.favorites ?? (Array.isArray(json?.data) ? json.data : []);

        const ids = (Array.isArray(list) ? list : [])
          .map((item: any) => {
            if (typeof item === "string") return item;
            if (item?.productId) {
              return String(typeof item.productId === "object" ? item.productId?._id ?? item.productId?.id ?? "" : item.productId);
            }
            if (item?.product) return String(item.product?._id ?? item.product?.id ?? "");
            return String(item?._id ?? item?.id ?? "");
          })
          .filter(Boolean);

        if (!off) setFavorites(ids);
      } catch {
        if (!off) setFavorites([]);
      }
    })();

    return () => {
      off = true;
    };
  }, [user]);

  /* ----- actions ----- */
  const refreshNavbar = () => window.dispatchEvent(new Event("glamora:refresh-navbar"));

  async function toggleFavorite(id: string) {
    if (!user) return flash(L("Login to add products to favorites.", "سجّلي الدخول لإضافة المنتجات إلى المفضلة."));

    const fav = favorites.includes(id);

    try {
      const res = await fetch(fav ? `/api/favorites?productId=${encodeURIComponent(id)}` : "/api/favorites", {
        method: fav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });

      if (!res.ok) throw new Error("fav");

      setFavorites((cur) => (fav ? cur.filter((x) => x !== id) : [...cur, id]));
      refreshNavbar();
      flash(fav ? L("Removed from favorites", "تمت إزالة المنتج من المفضلة") : L("Added to favorites", "تمت الإضافة للمفضلة"), 1800);
    } catch {
      flash(L("Something went wrong. Please try again.", "حدث خطأ، حاولي مرة أخرى."));
    }
  }

  async function addToCart(p: ApiProduct) {
    if (!user) return flash(L("Please login first", "يجب تسجيل الدخول أولًا"));

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, quantity: 1 }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "cart");
      }

      refreshNavbar();
      flash(L("Added to cart", "تمت الإضافة إلى السلة"), 1800);
    } catch (err) {
      flash(err instanceof Error && err.message !== "cart" ? err.message : L("Could not add to cart.", "تعذر إضافة المنتج للسلة."));
    }
  }

  function handleFind() {
    setApplied({ skin, budget, concern });
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function clearFind() {
    setApplied(null);
    setSkin("");
    setBudget(0);
    setConcern("");
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault();

    if (!user) return flash(L("Please login to rate us.", "سجّلي الدخول عشان تقيّمينا."));
    if (!rating) return flash(L("Please choose your rating.", "اختاري عدد النجوم."));
    if (comment.trim().length < 3) return flash(L("Please write a short message.", "اكتبي رسالة قصيرة."));

    try {
      setSending(true);

      const res = await fetch("/api/site-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.status === 401) return flash(L("Please login to rate us.", "سجّلي الدخول عشان تقيّمينا."));
      if (!res.ok || !json?.success) throw new Error(json?.message || "review");

      setComment("");
      setRating(0);
      await loadReviews();
      flash(L("Thank you for your feedback!", "شكرًا على تقييمك!"));
    } catch (err) {
      flash(err instanceof Error && err.message !== "review" ? err.message : L("Could not send your review.", "تعذر إرسال التقييم."));
    } finally {
      setSending(false);
    }
  }

  /* ----- derived ----- */
  const results = useMemo(() => {
    if (!applied) return [];

    return products.filter((p) => {
      if (applied.skin && !(p.skinTypes || []).includes("all") && !(p.skinTypes || []).includes(applied.skin)) return false;
      if (applied.concern && !(p.concerns || []).includes(applied.concern)) return false;
      if (applied.budget && effectivePrice(p) > applied.budget) return false;
      return true;
    });
  }, [applied, products]);

  const bestSellers = useMemo(() => {
    const byRating = (a: ApiProduct, b: ApiProduct) =>
      b.rating !== a.rating ? b.rating - a.rating : b.reviewsCount - a.reviewsCount;

    const flagged = products.filter((p) => p.bestSeller).sort(byRating);
    return (flagged.length ? flagged : [...products].sort(byRating)).slice(0, 4);
  }, [products]);

  /* صورة لكل كاتيجوري: روابطك > أول منتج مطابق من الداتابيز > SVG */
  const catImages = useMemo(() => {
    const out: Record<string, string> = {};

    CATS.forEach((c) => {
      if (CATEGORY_IMAGES[c.key]) {
        out[c.key] = CATEGORY_IMAGES[c.key];
        return;
      }

      const hit = products.find((p) => {
        if (!p.images?.[0]?.url) return false;
        const text = `${p.name} ${p.brand}`.toLowerCase();
        return c.kw.some((k) => text.includes(k)) || (c.skincare && p.category === "skincare");
      });

      if (hit?.images?.[0]?.url) out[c.key] = hit.images[0].url;
    });

    return out;
  }, [products]);

  const findHref = (() => {
    const q = new URLSearchParams();
    if (applied?.skin) q.set("skin", applied.skin);
    if (applied?.budget) q.set("budget", String(applied.budget));
    if (applied?.concern) q.set("concern", applied.concern);
    return `/${locale}/products${q.toString() ? `?${q.toString()}` : ""}`;
  })();

  const shownReviews = showAll ? reviews : reviews.slice(0, 6);
  const heroTitle = isAr ? (<>جمال<br />يناسبك</>) : (<>Beauty<br />That Fits You</>);
  const ArrowFlip = isAr ? { transform: "rotate(180deg)" } : undefined;

  return (
    <>
      <style>{CSS}</style>

      <main dir={isAr ? "rtl" : "ltr"} className={`gl-home ${inter.className}`} data-theme={dark ? "dark" : "light"}>
        {/* ================= 1. HERO ================= */}
        <section dir={isAr ? "rtl" : "ltr"} className="gl-hero">
          <div className="gl-stage">
            <Image
              src="/images/hero/hero-main.png"
              alt="Glamora Beauty"
              fill
              priority
              quality={95}
              sizes="100vw"
              className="gl-himg"
            />
            <div className="gl-shade" />

            <div className="gl-content">
              <h1 className={`gl-title ${playfair.className}`}>{heroTitle}</h1>
              <p className="gl-desc">
                {L(
                  "Discover makeup products specially selected for your skin type.",
                  "اكتشفي منتجات المكياج المختارة خصيصًا لتناسب نوع بشرتك."
                )}
              </p>
              <div className="gl-cta">
                <Link href={`/${locale}/products`} className="gl-btn">
                  <span>{L("Shop Now", "تسوقي الآن")}</span>
                  <ArrowRight size="1.15em" strokeWidth={2.2} style={ArrowFlip} />
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
            <h2 className={`gl-h2 ${playfair.className}`}>{L("Find Your Perfect Products", "اكتشفي منتجاتك المثالية")}</h2>
            <p className="gl-sub">
              {L(
                "Tell us about your skin type and budget to get personalized recommendations.",
                "اختاري نوع بشرتك والميزانية للحصول على ترشيحات مناسبة لك."
              )}
            </p>

            <div className="gl-panels">
              <div className="gl-panel">
                <div className="gl-fields">
                  <Select
                    label={L("Skin Type", "نوع البشرة")}
                    value={skin}
                    onChange={setSkin}
                    options={[
                      { value: "", label: L("All Skin Types", "كل أنواع البشرة") },
                      ...SKIN_OPTS.map(([v, en, ar]) => ({ value: v, label: L(en, ar) })),
                    ]}
                  />
                  <Select
                    label={L("Budget", "الميزانية")}
                    value={String(budget)}
                    onChange={(v) => setBudget(Number(v))}
                    options={[
                      { value: "0", label: L("Any budget", "أي ميزانية") },
                      ...BUDGETS.map((n) => ({ value: String(n), label: L(`Up to ${n} EGP`, `حتى ${n} جنيه`) })),
                    ]}
                  />
                  <Select
                    label={L("Concern", "المشكلة")}
                    value={concern}
                    onChange={setConcern}
                    options={[
                      { value: "", label: L("All Concerns", "كل المشاكل") },
                      ...CONCERN_OPTS.map(([v, en, ar]) => ({ value: v, label: L(en, ar) })),
                    ]}
                  />
                </div>
              </div>

              <div className="gl-panel go">
                <button type="button" className="gl-go" onClick={handleFind} disabled={productsLoading}>
                  <span>{L("Show Products", "عرض المنتجات")}</span>
                  <ArrowRight size="1.1em" strokeWidth={2.2} style={ArrowFlip} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2.5 FINDER RESULTS (بيانات حقيقية من الداتابيز) ================= */}
        {applied && (
          <section className="gl-sec gl-res" ref={resultsRef}>
            <div className="gl-wrap">
              <div className="gl-resh">
                <div>
                  <h2 className={`gl-h2 ${playfair.className}`}>{L("Recommended for you", "مناسبة لك")}</h2>
                  <small>{L(`${results.length} products match your choices`, `${results.length} منتج مناسب لاختياراتك`)}</small>
                </div>

                <div className="gl-rbtns">
                  <button type="button" className="gl-lnk" onClick={clearFind}>
                    {L("Clear", "مسح")}
                  </button>
                  <Link href={findHref} className="gl-all">
                    <span>{L("View in store", "عرض في المتجر")}</span>
                    <ArrowRight size="1.1em" strokeWidth={2.2} style={ArrowFlip} />
                  </Link>
                </div>
              </div>

              {productsLoading ? (
                <div className="gl-state">{L("Loading products...", "جاري تحميل المنتجات...")}</div>
              ) : results.length === 0 ? (
                <div className="gl-state">
                  {L("No products match your selection. Try another skin type or budget.", "لا توجد منتجات مطابقة لاختياراتك. جرّبي نوع بشرة أو ميزانية مختلفة.")}
                </div>
              ) : (
                <div className="gl-grid">
                  {results.map((p) => (
                    <ProductCard key={p.id} p={p} locale={locale} fav={favorites.includes(p.id)} onFav={toggleFavorite} onCart={addToCart} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= 3. CATEGORIES ================= */}
        <section className="gl-sec">
          <div className="gl-wrap">
            <div className="gl-cats">
              {CATS.map((c) => (
                <Link key={c.key} href={`/${locale}/products?search=${encodeURIComponent(c.q)}`} className="gl-cat">
                  <i>
                    {catImages[c.key] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={catImages[c.key]} alt={c.key} loading="lazy" decoding="async" />
                    ) : (
                      <Art category={c.key} />
                    )}
                  </i>
                  <span>{isAr ? c.ar : c.key}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 4. BEST SELLERS (من الباك) ================= */}
        <section className="gl-sec gl-bs">
          <div className="gl-wrap">
            <div className="gl-head">
              <h2 className={`gl-h2 ${playfair.className}`}>{L("Best Sellers", "الأكثر مبيعًا")}</h2>
              <Link href={`/${locale}/products`} className="gl-all">
                <span>{L("View All", "عرض الكل")}</span>
                <ArrowRight size="1.1em" strokeWidth={2.2} style={ArrowFlip} />
              </Link>
            </div>

            {productsLoading ? (
              <div className="gl-state">{L("Loading products...", "جاري تحميل المنتجات...")}</div>
            ) : bestSellers.length === 0 ? (
              <div className="gl-state">{L("No products yet.", "لا توجد منتجات حتى الآن.")}</div>
            ) : (
              <div className="gl-grid">
                {bestSellers.map((p) => (
                  <ProductCard key={p.id} p={p} locale={locale} fav={favorites.includes(p.id)} onFav={toggleFavorite} onCart={addToCart} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= 5. REVIEWS + RATE US ================= */}
        <section className="gl-sec gl-rev">
          <div className="gl-wrap">
            <div style={{ textAlign: "center" }}>
              <h2 className={`gl-h2 ${playfair.className}`}>{L("What Our Customers Say", "آراء عملائنا")}</h2>
              <p className="gl-sub">{L("Real experiences from people who chose Glamora.", "تجارب حقيقية من الأشخاص الذين اختاروا Glamora.")}</p>

              <div className="gl-pill">
                <Star size={18} fill="var(--star)" strokeWidth={0} />
                <b>{revStats.average ? revStats.average.toFixed(1) : "0.0"}</b>
                <span>{L(`Based on ${revStats.count} real reviews`, `بناءً على ${revStats.count} تقييم حقيقي`)}</span>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="gl-state" style={{ marginTop: 28 }}>{L("Loading reviews...", "جاري تحميل التقييمات...")}</div>
            ) : reviews.length === 0 ? (
              <div className="gl-state" style={{ marginTop: 28 }}>
                {L("No reviews yet. Be the first to rate us!", "لا توجد تقييمات بعد. كوني أول من يقيّمنا!")}
              </div>
            ) : (
              <>
                <div className="gl-rgrid">
                  {shownReviews.map((r) => (
                    <article key={r.id} className="gl-rcard">
                      <Quote size={30} className="q" />
                      <div className="gl-stars">
                        <Stars rating={r.rating} size={16} />
                      </div>
                      <p className="gl-rtext">&ldquo;{r.comment}&rdquo;</p>
                      <div className="gl-who">
                        <div className="gl-av">{r.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <h3>{r.name}</h3>
                          <span>Glamora Customer</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {reviews.length > 6 && (
                  <div className="gl-more">
                    <button type="button" className="gl-lnk" onClick={() => setShowAll((v) => !v)}>
                      {showAll ? L("Show less", "عرض أقل") : L(`Show all reviews (${reviews.length})`, `عرض كل التقييمات (${reviews.length})`)}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* قيّمنا */}
            <form className="gl-rate-card" onSubmit={submitReview}>
              <h3 className={playfair.className}>{L("Rate Your Experience", "قيّمي تجربتك معنا")}</h3>
              <p className="gl-muted">{L("Your opinion helps other customers choose better.", "رأيك بيساعد غيرك في الاختيار.")}</p>

              <div className="gl-starin" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
                    <Star
                      size={34}
                      strokeWidth={(hover || rating) >= n ? 0 : 1.5}
                      fill={(hover || rating) >= n ? "var(--star)" : "none"}
                      color={(hover || rating) >= n ? "var(--star)" : "#d1c4c8"}
                    />
                  </button>
                ))}
              </div>

              <textarea
                className="gl-ta"
                value={comment}
                maxLength={600}
                disabled={!user}
                onChange={(e) => setComment(e.target.value)}
                placeholder={L("Write your message here...", "اكتبي رسالتك هنا...")}
              />

              {user ? (
                <div className="gl-sendrow">
                  <span className="gl-as">
                    {L("Posting as", "سيظهر باسم")} <b>{userName || L("your account", "حسابك")}</b>
                  </span>
                  <button type="submit" className="gl-send" disabled={sending}>
                    {sending ? L("Sending...", "جاري الإرسال...") : L("Send review", "إرسال التقييم")}
                  </button>
                </div>
              ) : (
                <div className="gl-login">
                  <span>{L("Login to share your rating.", "سجّلي الدخول لمشاركة تقييمك.")}</span>
                  <Link href={`/${locale}/login`}>{L("Login", "تسجيل الدخول")}</Link>
                </div>
              )}
            </form>
          </div>
        </section>

        {toast && (
          <div className="gl-toast" role="status">
            <i />
            {toast}
          </div>
        )}
      </main>
    </>
  );
}