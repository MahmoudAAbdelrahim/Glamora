"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  BASE_CSS,
  LABELS,
  SUMMARY_CSS,
  SummaryPanel,
  formatPrice,
  unitPrice,
  useCart,
  type Locale,
} from "../../../lib/sharedids";

const T = {
  en: {
    title: "Your Cart",
    items: "items",
    checkout: "Proceed to Checkout",
    continue: "Continue Shopping",
    empty: "Your cart is empty",
    emptyText: "Add a few products and they will show up here.",
    browse: "Browse Products",
    remove: "Remove",
    error: "We couldn't load your cart.",
    retry: "Try again",
    login: "Log in to see your cart",
    loginBtn: "Log in",
    max: "Maximum available quantity",
  },
  ar: {
    title: "سلة التسوق",
    items: "منتجات",
    checkout: "إتمام الطلب",
    continue: "متابعة التسوق",
    empty: "السلة فارغة",
    emptyText: "أضف بعض المنتجات وستظهر هنا.",
    browse: "تصفح المنتجات",
    remove: "حذف",
    error: "تعذر تحميل السلة.",
    retry: "إعادة المحاولة",
    login: "سجّل الدخول لعرض سلتك",
    loginBtn: "تسجيل الدخول",
    max: "أقصى كمية متاحة",
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

  const message = (
    icon: React.ReactNode,
    title: string,
    text: string,
    href: string,
    cta: string
  ) => (
    <div className="gc-state">
      <div className="gc-state-icon">{icon}</div>

      <h2>{title}</h2>

      {text && <p>{text}</p>}

      <Link href={href} className="gs-btn gc-main-btn">
        {cta}
      </Link>
    </div>
  );

  let body: React.ReactNode;

  if (cart.loading) {
    body = (
      <div className="gc-list">
        {[0, 1, 2].map((i) => (
          <div key={i} className="gc-skel" />
        ))}
      </div>
    );
  } else if (cart.needLogin) {
    body = message(
      <ShoppingBag size={40} />,
      t.login,
      "",
      `/${locale}/login?redirect=/${locale}/cart`,
      t.loginBtn
    );
  } else if (cart.error) {
    body = (
      <div className="gc-state">
        <div className="gc-state-icon">
          <AlertCircle size={40} />
        </div>

        <h2>{t.error}</h2>

        <button
          type="button"
          className="gs-btn gc-main-btn"
          onClick={cart.reload}
        >
          {t.retry}
        </button>
      </div>
    );
  } else if (cart.items.length === 0) {
    body = message(
      <ShoppingBag size={40} />,
      t.empty,
      t.emptyText,
      `/${locale}/products`,
      t.browse
    );
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
                <article
                  className="gc-row"
                  key={p.id}
                  aria-busy={busy}
                >
                  {/* PRODUCT IMAGE */}
                  <Link
                    href={`/${locale}/products/${p.id}`}
                    className="gc-img"
                  >
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                      />
                    ) : (
                      <ShoppingBag size={25} />
                    )}
                  </Link>

                  {/* PRODUCT NAME */}
                  <div className="gc-name">
                    <Link href={`/${locale}/products/${p.id}`}>
                      {p.name}
                    </Link>

                    <strong>{money(unit)}</strong>
                  </div>

                  {/* QUANTITY */}
                  <div className="gc-qty">
                    <button
                      type="button"
                      aria-label="-"
                      disabled={busy || item.quantity <= 1}
                      onClick={() =>
                        cart.update(p.id, item.quantity - 1)
                      }
                    >
                      <Minus size={15} strokeWidth={2.2} />
                    </button>

                    <span>
                      {formatPrice(item.quantity, locale)}
                    </span>

                    <button
                      type="button"
                      aria-label="+"
                      title={
                        item.quantity >= p.stock
                          ? t.max
                          : undefined
                      }
                      disabled={
                        busy || item.quantity >= p.stock
                      }
                      onClick={() =>
                        cart.update(p.id, item.quantity + 1)
                      }
                    >
                      <Plus size={15} strokeWidth={2.2} />
                    </button>
                  </div>

                  {/* TOTAL */}
                  <b className="gc-line">
                    {money(unit * item.quantity)}
                  </b>

                  {/* DELETE */}
                  <button
                    type="button"
                    className="gc-del"
                    aria-label={t.remove}
                    disabled={busy}
                    onClick={() => cart.remove(p.id)}
                  >
                    <Trash2
                      size={18}
                      strokeWidth={1.9}
                    />
                  </button>
                </article>
              );
            })}
          </div>

          {/* CONTINUE SHOPPING */}
          <Link
            href={`/${locale}/products`}
            className="gc-continue"
          >
            <span className="gc-continue-icon">
              <Back size={17} />
            </span>

            <span>{t.continue}</span>
          </Link>
        </section>

        {/* SUMMARY */}
        <SummaryPanel
          locale={locale}
          subtotal={cart.subtotal}
          shipping={cart.shipping}
          action={
            <Link
              href={`/${locale}/checkout`}
              className="gs-btn gc-checkout-btn"
            >
              {t.checkout}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <main
      className="gl-store gc-page"
      dir={isAr ? "rtl" : "ltr"}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `${BASE_CSS}\n${SUMMARY_CSS}\n${CSS}`,
        }}
      />

      <div className="gc-wrap">
        <div className="gc-heading">
          <div>
            <span className="gc-eyebrow">
              GLAMORA
            </span>

            <h1>
              {t.title}

              {!cart.loading &&
                cart.items.length > 0 && (
                  <span>
                    {" "}
                    ({formatPrice(cart.count, locale)}{" "}
                    {t.items})
                  </span>
                )}
            </h1>
          </div>

          {!cart.loading &&
            cart.items.length > 0 && (
              <div className="gc-heading-badge">
                <ShoppingBag size={17} />
                <span>
                  {formatPrice(cart.count, locale)}
                </span>
              </div>
            )}
        </div>

        {body}
      </div>
    </main>
  );
}

const CSS = `
/* =========================================================
   GLAMORA CART
   WHITE + PINK + WINE + NAVY
========================================================= */

.gc-page{
  --gc-wine:#8b1538;
  --gc-wine-deep:#6d0f2b;
  --gc-pink:#f4b6c2;
  --gc-blush:#fbe4e8;
  --gc-rose:#d6506f;
  --gc-navy:#17213c;
  --gc-navy-soft:#24304f;

  --gc-white:#ffffff;
  --gc-bg:#ffffff;
  --gc-card:#ffffff;
  --gc-border:#ead9de;
  --gc-text:#17213c;
  --gc-muted:#81757b;

  background:#ffffff !important;
  color:var(--gc-text);
}

/* =========================================================
   WRAPPER
========================================================= */

.gc-wrap{
  width:min(1180px,100%);
  margin:0 auto;
  padding:30px 24px 90px;
}

/* =========================================================
   HEADING
========================================================= */

.gc-heading{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:20px;
  margin-bottom:28px;
}

.gc-eyebrow{
  display:block;
  margin-bottom:7px;
  color:var(--gc-wine);
  font-size:11px;
  font-weight:900;
  letter-spacing:.22em;
  text-transform:uppercase;
}

.gc-wrap h1{
  margin:0;
  color:var(--gc-navy);
  font-size:30px;
  line-height:1.15;
  font-weight:850;
  letter-spacing:-.025em;
}

.gc-wrap h1 span{
  color:var(--gc-wine);
  font-size:18px;
  font-weight:700;
  letter-spacing:0;
}

.gc-heading-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;

  min-width:48px;
  height:42px;
  padding:0 14px;

  border:1px solid #edc7cf;
  border-radius:12px;

  background:linear-gradient(
    145deg,
    #fff,
    #fff6f8
  );

  color:var(--gc-wine);
  font-size:14px;
  font-weight:850;

  box-shadow:0 8px 22px rgba(109,15,43,.06);
}

/* =========================================================
   GRID
========================================================= */

.gc-grid{
  display:grid;
  grid-template-columns:minmax(0,1fr) 380px;
  gap:34px;
  align-items:start;
}

/* =========================================================
   LIST
========================================================= */

.gc-list{
  display:flex;
  flex-direction:column;
  gap:12px;
}

/* =========================================================
   PRODUCT ROW
========================================================= */

.gc-row{
  display:grid;
  grid-template-columns:
    76px
    minmax(0,1fr)
    auto
    120px
    42px;

  align-items:center;
  gap:18px;

  padding:13px;

  border:1px solid var(--gc-border);
  border-radius:15px;

  background:#ffffff;

  box-shadow:
    0 5px 20px rgba(23,33,60,.035);

  transition:
    transform .2s ease,
    box-shadow .2s ease,
    border-color .2s ease,
    opacity .2s ease;
}

.gc-row:hover{
  transform:translateY(-2px);

  border-color:#dfb8c2;

  box-shadow:
    0 12px 30px rgba(109,15,43,.08);
}

.gc-row[aria-busy="true"]{
  opacity:.55;
  pointer-events:none;
}

/* =========================================================
   IMAGE
========================================================= */

.gc-img{
  position:relative;

  width:76px;
  height:76px;

  overflow:hidden;

  display:grid;
  place-items:center;

  border:1px solid #efdde2;
  border-radius:12px;

  background:
    linear-gradient(
      145deg,
      #fff7f9,
      #fbe4e8
    );

  color:var(--gc-wine);

  text-decoration:none;

  transition:
    transform .2s ease,
    border-color .2s ease;
}

.gc-img:hover{
  transform:scale(1.025);
  border-color:#dcaeb9;
}

.gc-img img{
  width:100%;
  height:100%;
  object-fit:cover;
}

/* =========================================================
   PRODUCT NAME
========================================================= */

.gc-name{
  min-width:0;

  display:flex;
  flex-direction:column;
  gap:7px;
}

.gc-name a{
  overflow:hidden;

  color:var(--gc-navy);

  font-size:15px;
  font-weight:800;
  line-height:1.4;

  text-decoration:none;
  text-overflow:ellipsis;
  white-space:nowrap;

  transition:color .18s ease;
}

.gc-name a:hover{
  color:var(--gc-wine);
}

.gc-name strong{
  color:var(--gc-wine);
  font-size:14px;
  font-weight:850;
}

/* =========================================================
   QUANTITY
========================================================= */

.gc-qty{
  display:inline-flex;
  align-items:center;

  height:42px;

  overflow:hidden;

  border:1px solid #dfcbd1;
  border-radius:10px;

  background:#ffffff;

  box-shadow:
    0 3px 10px rgba(23,33,60,.04);
}

.gc-qty button{
  width:40px;
  height:100%;

  border:0;

  display:grid;
  place-items:center;

  background:#fff;

  color:var(--gc-wine);

  cursor:pointer;

  transition:
    background .18s ease,
    color .18s ease;
}

.gc-qty button:hover:not(:disabled){
  background:var(--gc-blush);
  color:var(--gc-wine-deep);
}

.gc-qty button:disabled{
  opacity:.35;
  cursor:not-allowed;
}

.gc-qty span{
  min-width:45px;

  display:grid;
  place-items:center;

  color:var(--gc-navy);

  font-size:14px;
  font-weight:850;
}

/* =========================================================
   LINE TOTAL
========================================================= */

.gc-line{
  text-align:end;

  color:var(--gc-navy);

  font-size:15px;
  font-weight:900;
  white-space:nowrap;
}

/* =========================================================
   DELETE
========================================================= */

.gc-del{
  width:40px;
  height:40px;

  border:1px solid transparent;
  border-radius:10px;

  display:grid;
  place-items:center;

  background:#fff5f7;
  color:var(--gc-wine);

  cursor:pointer;

  transition:
    background .18s ease,
    color .18s ease,
    border-color .18s ease,
    transform .18s ease;
}

.gc-del:hover:not(:disabled){
  background:var(--gc-wine);
  border-color:var(--gc-wine);
  color:#ffffff;
  transform:translateY(-1px);
}

.gc-del:disabled{
  opacity:.4;
  cursor:not-allowed;
}

/* =========================================================
   CONTINUE SHOPPING
========================================================= */

.gc-continue{
  display:inline-flex;
  align-items:center;
  gap:10px;

  margin-top:24px;

  color:var(--gc-wine);

  font-size:14px;
  font-weight:850;

  text-decoration:none;

  transition:
    color .18s ease,
    transform .18s ease;
}

.gc-continue:hover{
  color:var(--gc-wine-deep);
  transform:translateX(-2px);
}

[dir="rtl"] .gc-continue:hover{
  transform:translateX(2px);
}

.gc-continue-icon{
  width:34px;
  height:34px;

  display:grid;
  place-items:center;

  border:1px solid #e4c5cc;
  border-radius:9px;

  background:#fff7f8;
  color:var(--gc-wine);

  transition:
    background .18s ease,
    color .18s ease;
}

.gc-continue:hover .gc-continue-icon{
  background:var(--gc-wine);
  color:#ffffff;
}

/* =========================================================
   STATES
========================================================= */

.gc-state{
  min-height:390px;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  gap:10px;

  padding:40px 20px;

  text-align:center;

  border:1px solid #ead9de;
  border-radius:18px;

  background:
    linear-gradient(
      145deg,
      #ffffff,
      #fff9fa
    );

  box-shadow:
    0 10px 35px rgba(23,33,60,.04);
}

.gc-state-icon{
  width:70px;
  height:70px;

  margin-bottom:5px;

  display:grid;
  place-items:center;

  border-radius:18px;

  background:
    linear-gradient(
      145deg,
      #fff0f3,
      #fbe4e8
    );

  color:var(--gc-wine);

  box-shadow:
    inset 0 0 0 1px #f0d0d7;
}

.gc-state h2{
  margin:0;

  color:var(--gc-navy);

  font-size:21px;
  font-weight:850;
}

.gc-state p{
  max-width:430px;

  margin:0 0 14px;

  color:var(--gc-muted);

  font-size:14px;
  line-height:1.7;
}

/* =========================================================
   IMPORTANT BUTTON FIX
   WHITE TEXT ALWAYS
========================================================= */

.gc-main-btn,
.gc-checkout-btn,
.gc-page .gs-btn{
  min-height:46px;

  display:inline-flex;
  align-items:center;
  justify-content:center;

  padding:0 22px;

  border:1px solid var(--gc-wine) !important;
  border-radius:11px;

  background:
    linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    ) !important;

  color:#ffffff !important;

  font-size:14px;
  font-weight:850;

  line-height:1;
  text-decoration:none !important;

  box-shadow:
    0 8px 20px rgba(139,21,56,.16);

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    background .18s ease;
}

.gc-main-btn:hover,
.gc-checkout-btn:hover,
.gc-page .gs-btn:hover{
  color:#ffffff !important;

  background:
    linear-gradient(
      135deg,
      #a51d45,
      #74102f
    ) !important;

  transform:translateY(-2px);

  box-shadow:
    0 12px 26px rgba(139,21,56,.24);
}

.gc-main-btn:active,
.gc-checkout-btn:active,
.gc-page .gs-btn:active{
  color:#ffffff !important;
  transform:translateY(0);
}

/* Force every child inside button to stay white */
.gc-page .gs-btn *,
.gc-main-btn *,
.gc-checkout-btn *{
  color:#ffffff !important;
}

/* =========================================================
   CHECKOUT BUTTON
========================================================= */

.gc-checkout-btn{
  width:100%;
  min-height:50px;

  border-radius:12px;

  font-size:15px;
}

/* =========================================================
   SKELETON
========================================================= */

.gc-skel{
  height:102px;

  border-radius:15px;

  background:
    linear-gradient(
      90deg,
      #fbe4e8 0%,
      #ffffff 50%,
      #fbe4e8 100%
    );

  background-size:200% 100%;

  animation:gcsh 1.35s infinite ease-in-out;
}

@keyframes gcsh{
  0%{
    background-position:200% 0;
  }

  100%{
    background-position:-200% 0;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width:960px){

  .gc-grid{
    grid-template-columns:1fr;
  }

}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width:620px){

  .gc-wrap{
    padding:20px 14px 65px;
  }

  .gc-heading{
    align-items:center;
    margin-bottom:20px;
  }

  .gc-eyebrow{
    font-size:10px;
  }

  .gc-wrap h1{
    font-size:24px;
  }

  .gc-wrap h1 span{
    font-size:15px;
  }

  .gc-heading-badge{
    min-width:42px;
    height:38px;
    padding:0 11px;
    border-radius:10px;
  }

  .gc-row{
    grid-template-columns:
      68px
      minmax(0,1fr)
      40px;

    grid-template-areas:
      "img name del"
      "img qty line";

    gap:10px 12px;

    padding:11px;

    border-radius:14px;
  }

  .gc-img{
    grid-area:img;

    width:68px;
    height:68px;

    border-radius:11px;
  }

  .gc-name{
    grid-area:name;
  }

  .gc-name a{
    font-size:14px;
  }

  .gc-name strong{
    font-size:13px;
  }

  .gc-del{
    grid-area:del;

    width:38px;
    height:38px;

    align-self:start;
  }

  .gc-qty{
    grid-area:qty;

    height:37px;

    justify-self:start;
  }

  .gc-qty button{
    width:34px;
  }

  .gc-qty span{
    min-width:38px;
  }

  .gc-line{
    grid-area:line;

    align-self:center;

    font-size:13px;
  }

  .gc-state{
    min-height:330px;
    border-radius:15px;
  }

  .gc-state-icon{
    width:62px;
    height:62px;
    border-radius:16px;
  }

  .gc-main-btn{
    min-height:44px;
    padding:0 19px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width:390px){

  .gc-wrap{
    padding-inline:11px;
  }

  .gc-heading-badge{
    display:none;
  }

  .gc-wrap h1{
    font-size:22px;
  }

  .gc-row{
    grid-template-columns:
      60px
      minmax(0,1fr)
      36px;

    gap:9px 10px;
  }

  .gc-img{
    width:60px;
    height:60px;
  }

  .gc-del{
    width:36px;
    height:36px;
  }

  .gc-qty{
    height:35px;
  }

  .gc-qty button{
    width:31px;
  }

  .gc-qty span{
    min-width:34px;
  }

  .gc-line{
    font-size:12px;
  }
}
`;