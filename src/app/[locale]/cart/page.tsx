"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  BASE_CSS, LABELS, SUMMARY_CSS, SummaryPanel, formatPrice, unitPrice, useCart, type Locale,
} from "../../../lib/sharedids";

const T = {
  en: {
    title: "Your Cart", items: "items", checkout: "Proceed to Checkout", continue: "Continue Shopping",
    empty: "Your cart is empty", emptyText: "Add a few products and they will show up here.",
    browse: "Browse Products", remove: "Remove", error: "We couldn't load your cart.", retry: "Try again",
    login: "Log in to see your cart", loginBtn: "Log in", max: "Maximum available quantity",
  },
  ar: {
    title: "سلة التسوق", items: "منتجات", checkout: "إتمام الطلب", continue: "متابعة التسوق",
    empty: "السلة فارغة", emptyText: "أضف بعض المنتجات وستظهر هنا.",
    browse: "تصفح المنتجات", remove: "حذف", error: "تعذر تحميل السلة.", retry: "إعادة المحاولة",
    login: "سجّل الدخول لعرض سلتك", loginBtn: "تسجيل الدخول", max: "أقصى كمية متاحة",
  },
};

export default function CartPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const t = T[locale];
  const egp = LABELS[locale].egp;
  const cart = useCart();
  const Back = isAr ? ArrowRight : ArrowLeft;
  const money = (n: number) => `${formatPrice(n, locale)} ${egp}`;

  const message = (icon: React.ReactNode, title: string, text: string, href: string, cta: string) => (
    <div className="gc-state">
      {icon}
      <h2>{title}</h2>
      <p>{text}</p>
      <Link href={href} className="gs-btn" style={{ maxWidth: 260 }}>{cta}</Link>
    </div>
  );

  let body: React.ReactNode;

  if (cart.loading) {
    body = (
      <div className="gc-list">
        {[0, 1, 2].map((i) => <div key={i} className="gc-skel" />)}
      </div>
    );
  } else if (cart.needLogin) {
    body = message(<ShoppingBag size={38} />, t.login, "", `/${locale}/login?redirect=/${locale}/cart`, t.loginBtn);
  } else if (cart.error) {
    body = (
      <div className="gc-state">
        <AlertCircle size={38} />
        <h2>{t.error}</h2>
        <button type="button" className="gs-btn" style={{ maxWidth: 260 }} onClick={cart.reload}>{t.retry}</button>
      </div>
    );
  } else if (cart.items.length === 0) {
    body = message(<ShoppingBag size={38} />, t.empty, t.emptyText, `/${locale}/products`, t.browse);
  } else {
    body = (
      <div className="gc-grid">
        <section>
          <div className="gc-list">
            {cart.items.map((item) => {
              const p = item.product;
              const busy = cart.busy === p.id;
              const unit = unitPrice(item);
              return (
                <article className="gc-row" key={p.id} aria-busy={busy}>
                  <Link href={`/${locale}/products/${p.id}`} className="gc-img">
                    {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} /> : <ShoppingBag size={24} />}
                  </Link>

                  <div className="gc-name">
                    <Link href={`/${locale}/products/${p.id}`}>{p.name}</Link>
                    <strong>{money(unit)}</strong>
                  </div>

                  <div className="gc-qty">
                    <button type="button" aria-label="-" disabled={busy || item.quantity <= 1}
                      onClick={() => cart.update(p.id, item.quantity - 1)}><Minus size={15} /></button>
                    <span>{formatPrice(item.quantity, locale)}</span>
                    <button type="button" aria-label="+" title={item.quantity >= p.stock ? t.max : undefined}
                      disabled={busy || item.quantity >= p.stock}
                      onClick={() => cart.update(p.id, item.quantity + 1)}><Plus size={15} /></button>
                  </div>

                  <b className="gc-line">{money(unit * item.quantity)}</b>

                  <button type="button" className="gc-del" aria-label={t.remove} disabled={busy}
                    onClick={() => cart.remove(p.id)}><Trash2 size={19} /></button>
                </article>
              );
            })}
          </div>

          <Link href={`/${locale}/products`} className="gc-continue">
            <Back size={18} /> {t.continue}
          </Link>
        </section>

        <SummaryPanel
          locale={locale}
          subtotal={cart.subtotal}
          shipping={cart.shipping}
          action={<Link href={`/${locale}/checkout`} className="gs-btn">{t.checkout}</Link>}
        />
      </div>
    );
  }

  return (
    <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
      <style>{BASE_CSS + SUMMARY_CSS + CSS}</style>
      <div className="gc-wrap">
        <h1>
          {t.title}
          {!cart.loading && cart.items.length > 0 && <span> ({formatPrice(cart.count, locale)} {t.items})</span>}
        </h1>
        {body}
      </div>
    </main>
  );
}

const CSS = `
.gc-wrap{max-width:1180px;margin:0  auto;padding:26px 24px 80px}
.gc-wrap h1{margin:0 0 26px;font-size:26px;font-weight:800}
.gc-wrap h1 span{color:var(--mu);font-size:20px;font-weight:600}
.gc-grid{display:grid;
grid-template-columns:minmax(0,1fr) 380px;gap:34px;align-items:start}
.gc-list{display:flex;flex-direction:column;gap:10px}
.gc-row{display:grid;grid-template-columns:76px minmax(0,1fr) auto 120px 40px;align-items:center;gap:20px;padding:12px;border:1px solid var(--ln);border-radius:12px;background:var(--card);transition:opacity .2s}
.gc-row[aria-busy=true]{opacity:.6}
.gc-img{width:76px;height:76px;border-radius:10px;overflow:hidden;background:var(--soft);display:grid;place-items:center;color:var(--w)}
.gc-img img{width:100%;height:100%;object-fit:cover}
.gc-name{min-width:0;display:flex;flex-direction:column;gap:6px}
.gc-name a{font-size:15px;font-weight:700;line-height:1.4}
.gc-name a:hover{color:var(--w)}
.gc-name strong{color:var(--w);font-size:15px;font-weight:800}
.gc-qty{display:inline-flex;height:42px;border:1px solid var(--ln);border-radius:8px;overflow:hidden;background:var(--card)}
.gc-qty button{width:42px;border:0;background:var(--side);color:var(--w);display:grid;place-items:center}
.gc-qty button:hover:not(:disabled){background:var(--soft)}
.gc-qty button:disabled{opacity:.4;cursor:not-allowed}
.gc-qty span{min-width:54px;display:grid;place-items:center;font-weight:700;font-size:14px}
.gc-line{text-align:end;font-size:15px;font-weight:800}
.gc-del{width:40px;height:40px;border:0;border-radius:50%;background:none;color:var(--w);display:grid;place-items:center;transition:background .2s}
.gc-del:hover:not(:disabled){background:var(--soft);}
.gc-del:disabled{opacity:.4}
.gc-continue{display:inline-flex;align-items:center;gap:10px;margin-top:26px;color:var(--w);font-size:15px;font-weight:800}
.gc-continue:hover{text-decoration:underline}
.gc-state{min-height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;color:var(--mu)}
.gc-state svg{color:var(--w);margin-bottom:6px}
.gc-state h2{margin:0;color:var(--ink);font-size:21px}
.gc-state p{margin:0 0 14px}
.gc-state .gs-btn{text-decoration:none}
.gc-skel{height:100px;border-radius:12px;background:linear-gradient(90deg,var(--soft),var(--ln),var(--soft));background-size:200% 100%;animation:gcsh 1.3s infinite}
@keyframes gcsh{to{background-position:-200% 0}}
@media (max-width:960px){.gc-grid{grid-template-columns:1fr}}
@media (max-width:620px){
 .gc-wrap{padding:18px 14px 60px}
 .gc-row{grid-template-columns:72px minmax(0,1fr) 40px;grid-template-areas:"img name del" "img qty line";gap:10px 12px}
 .gc-img{grid-area:img;width:72px;height:72px}
 .gc-name{grid-area:name}
 .gc-del{grid-area:del;align-self:start}
 .gc-qty{grid-area:qty;height:38px}
 .gc-qty button{width:36px}.gc-qty span{min-width:40px}
 .gc-line{grid-area:line;align-self:center}
}
`;