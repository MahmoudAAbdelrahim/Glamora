"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  HelpCircle,
  Package,
  CreditCard,
  RotateCcw,
  UserRound,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

type Locale = "ar" | "en";

interface NavbarProps {
  locale: Locale;
  cartCount?: number;
  wishCount?: number;
}
const CSS = `
  .policy-page{
    --wine:#8b1538;
    --wine-deep:#6d0f2b;
    --pink:#f4b6c2;
    --rose:#d6506f;
    --blush:#fbe4e8;
    --navy:#17213c;
    --muted:#73798a;
    --line:#eee4e7;

    min-height:100vh;
    background:#fff;
    color:var(--navy);
  }

  .policy-hero{
    position:relative;
    overflow:hidden;
    padding:90px 24px 82px;
    background:
      radial-gradient(
        circle at 85% 25%,
        rgba(244,182,194,.45),
        transparent 32%
      ),
      linear-gradient(
        135deg,
        #fff 0%,
        #fff8fa 55%,
        #fbe4e8 100%
      );
    border-bottom:1px solid var(--line);
  }

  .policy-hero::before{
    content:"";
    position:absolute;
    width:360px;
    height:360px;
    border:1px solid rgba(139,21,56,.08);
    border-radius:50%;
    right:-120px;
    top:-130px;
  }

  .policy-hero-inner{
    position:relative;
    z-index:1;
    max-width:1100px;
    margin:auto;
  }

  .policy-kicker{
    display:inline-flex;
    align-items:center;
    gap:8px;
    color:var(--wine);
    font-size:11px;
    font-weight:800;
    letter-spacing:.16em;
    text-transform:uppercase;
    margin-bottom:16px;
  }

  .policy-kicker svg{
    width:15px;
    height:15px;
  }

  .policy-title{
    margin:0;
    max-width:760px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:clamp(42px,6vw,72px);
    line-height:1;
    letter-spacing:-.045em;
    font-weight:500;
    color:var(--navy);
  }

  .policy-title span{
    color:var(--wine);
    font-style:italic;
  }

  .policy-intro{
    max-width:650px;
    margin:22px 0 0;
    color:var(--muted);
    line-height:1.9;
    font-size:14px;
  }

  .policy-wrap{
    max-width:1000px;
    margin:auto;
    padding:70px 24px 90px;
  }

  .faq-layout{
    display:grid;
    grid-template-columns:260px 1fr;
    gap:60px;
    align-items:start;
  }

  .faq-side{
    position:sticky;
    top:110px;
  }

  .faq-side-label{
    color:var(--wine);
    font-size:11px;
    font-weight:800;
    letter-spacing:.14em;
    text-transform:uppercase;
    margin-bottom:14px;
  }

  .faq-side-title{
    margin:0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:27px;
    font-weight:500;
    line-height:1.2;
  }

  .faq-side-text{
    color:var(--muted);
    font-size:12px;
    line-height:1.8;
    margin-top:14px;
  }

  .faq-side-box{
    margin-top:25px;
    padding:18px;
    border-radius:12px;
    background:var(--blush);
  }

  .faq-side-box svg{
    color:var(--wine);
    width:20px;
    height:20px;
    margin-bottom:9px;
  }

  .faq-side-box p{
    margin:0;
    color:#6b4050;
    font-size:12px;
    line-height:1.7;
  }

  .faq-list{
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  .faq-item{
    border:1px solid var(--line);
    border-radius:12px;
    background:#fff;
    overflow:hidden;
    transition:
      border-color .25s ease,
      box-shadow .25s ease;
  }

  .faq-item.open{
    border-color:rgba(139,21,56,.2);
    box-shadow:0 12px 35px rgba(23,33,60,.06);
  }

  .faq-question{
    width:100%;
    min-height:70px;
    padding:18px 20px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:20px;
    background:none;
    border:0;
    color:var(--navy);
    text-align:start;
    cursor:pointer;
    font-size:14px;
    font-weight:700;
  }

  .faq-question svg{
    flex:none;
    color:var(--wine);
    transition:transform .25s ease;
  }

  .faq-item.open .faq-question svg{
    transform:rotate(180deg);
  }

  .faq-answer{
    padding:0 20px 20px;
    color:var(--muted);
    font-size:13px;
    line-height:1.9;
  }

  .faq-categories{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:12px;
    margin-bottom:35px;
  }

  .faq-category{
    padding:18px;
    border:1px solid var(--line);
    border-radius:12px;
    background:#fff;
  }

  .faq-category-icon{
    width:38px;
    height:38px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:var(--blush);
    color:var(--wine);
    margin-bottom:12px;
  }

  .faq-category-icon svg{
    width:18px;
    height:18px;
  }

  .faq-category strong{
    display:block;
    font-size:12px;
    margin-bottom:5px;
  }

  .faq-category span{
    color:var(--muted);
    font-size:11px;
  }

  .policy-cta{
    margin-top:60px;
    padding:35px;
    border-radius:16px;
    background:linear-gradient(135deg,var(--wine),var(--wine-deep));
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:25px;
  }

  .policy-cta h3{
    margin:0 0 7px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:27px;
    font-weight:500;
  }

  .policy-cta p{
    margin:0;
    color:rgba(255,255,255,.72);
    font-size:12px;
  }

  .policy-cta-btn{
    flex:none;
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:12px 18px;
    border-radius:4px;
    background:#fff;
    color:var(--wine) !important;
    text-decoration:none;
    font-size:12px;
    font-weight:800;
  }

  .policy-cta-btn svg{
    width:15px;
    height:15px;
  }

  @media(max-width:800px){
    .faq-layout{
      grid-template-columns:1fr;
      gap:35px;
    }

    .faq-side{
      position:static;
    }

    .faq-categories{
      grid-template-columns:1fr 1fr 1fr;
    }
  }

  @media(max-width:600px){
    .policy-hero{
      padding:65px 20px 60px;
    }

    .policy-wrap{
      padding:50px 20px 65px;
    }

    .faq-categories{
      grid-template-columns:1fr;
    }

    .policy-cta{
      flex-direction:column;
      align-items:flex-start;
    }

    .policy-cta-btn{
      width:100%;
      justify-content:center;
    }
  }
`;

export default function FAQPage() {
  const params = useParams();

  const locale = (
    params?.locale === "en" ? "en" : "ar"
  ) as Locale;

  const ar = locale === "ar";

  const [open, setOpen] = useState<number | null>(0);

  const faqs = ar
    ? [
        {
          q: "كيف يمكنني إنشاء حساب؟",
          a: "يمكنك إنشاء حساب من خلال صفحة التسجيل وإدخال بياناتك الأساسية. بعد التسجيل يمكنك إدارة بياناتك ومتابعة طلباتك بسهولة.",
        },
        {
          q: "هل يمكنني الطلب بدون إنشاء حساب؟",
          a: "في النسخة الحالية من Glamora، تحتاج إلى تسجيل الدخول لإتمام الطلب ومتابعته من حسابك.",
        },
        {
          q: "ما طريقة الدفع المتاحة؟",
          a: "الدفع عند الاستلام هو طريقة الدفع المتاحة حاليًا في المشروع.",
        },
        {
          q: "كيف أتابع طلبي؟",
          a: "بعد إنشاء الطلب يمكنك الدخول إلى صفحة طلباتك واختيار الطلب المطلوب للوصول إلى صفحة التفاصيل والتتبع.",
        },
        {
          q: "ماذا أفعل إذا وصل المنتج تالفًا؟",
          a: "تواصل مع خدمة العملاء في أسرع وقت، ويفضل إرسال صور واضحة للمنتج والطلب حتى نتمكن من مساعدتك.",
        },
        {
          q: "هل يمكنني تعديل عنوان الطلب؟",
          a: "إذا احتجت إلى تعديل بيانات التوصيل، تواصل مع الدعم في أسرع وقت ممكن. إمكانية التعديل تعتمد على حالة الطلب.",
        },
        {
          q: "كيف أعرف المنتج المناسب لنوع بشرتي؟",
          a: "يمكنك استخدام Product Finder الموجود في المتجر لتحديد نوع البشرة والميزانية والوصول إلى المنتجات المناسبة.",
        },
        {
          q: "هل المنتجات أصلية؟",
          a: "Glamora مخصص لعرض وبيع منتجات التجميل من العلامات التجارية المدرجة في المتجر. تفاصيل كل منتج تكون موضحة في صفحة المنتج.",
        },
      ]
    : [
        {
          q: "How can I create an account?",
          a: "Create an account from the registration page using your basic information. Your account lets you manage your details and follow your orders.",
        },
        {
          q: "Can I order without creating an account?",
          a: "In the current Glamora project, you need to sign in before completing and tracking an order.",
        },
        {
          q: "Which payment method is available?",
          a: "Cash on delivery is currently the available payment method in the project.",
        },
        {
          q: "How can I track my order?",
          a: "Open your Orders page and select the order you want. From there you can access the order details and tracking page.",
        },
        {
          q: "What if my product arrives damaged?",
          a: "Contact customer support as soon as possible and provide clear photos of the product and order so we can assist you.",
        },
        {
          q: "Can I change my delivery address?",
          a: "Contact support as soon as possible. Address changes depend on the current status of your order.",
        },
        {
          q: "How do I find products for my skin type?",
          a: "Use the Product Finder to select your skin type and budget and discover products that fit your preferences.",
        },
        {
          q: "Are the products authentic?",
          a: "Glamora is designed to showcase and sell beauty products from the brands listed in the store. Product details are available on each product page.",
        },
      ];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: CSS,
        }}
      />

      <main className="policy-page" dir={ar ? "rtl" : "ltr"}>
        <section className="policy-hero">
          <div className="policy-hero-inner">
            <div className="policy-kicker">
              <HelpCircle />
              {ar ? "مركز المساعدة" : "HELP CENTER"}
            </div>

            <h1 className="policy-title">
              {ar ? (
                <>
                  الأسئلة
                  <br />
                  <span>الشائعة.</span>
                </>
              ) : (
                <>
                  Frequently
                  <br />
                  <span>Asked.</span>
                </>
              )}
            </h1>

            <p className="policy-intro">
              {ar
                ? "كل ما تحتاجين معرفته عن الحسابات والطلبات والدفع والتوصيل والاسترجاع وتجربة التسوق على Glamora."
                : "Everything you need to know about your account, orders, payment, delivery, returns and your Glamora shopping experience."}
            </p>
          </div>
        </section>

        <div className="policy-wrap">
          <div className="faq-categories">
            {[
              {
                icon: Package,
                ar: "الطلبات",
                en: "Orders",
              },
              {
                icon: CreditCard,
                ar: "الدفع",
                en: "Payment",
              },
              {
                icon: RotateCcw,
                ar: "الاسترجاع",
                en: "Returns",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div className="faq-category" key={item.en}>
                  <div className="faq-category-icon">
                    <Icon />
                  </div>

                  <strong>
                    {ar ? item.ar : item.en}
                  </strong>

                  <span>
                    {ar
                      ? "معلومات وإجابات مفيدة"
                      : "Helpful information and answers"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="faq-layout">
            <aside className="faq-side">
              <div className="faq-side-label">
                {ar ? "Glamora Support" : "Glamora Support"}
              </div>

              <h2 className="faq-side-title">
                {ar
                  ? "مساعدة بسيطة، تجربة أسهل."
                  : "Simple help. A better experience."}
              </h2>

              <p className="faq-side-text">
                {ar
                  ? "لم تجدي إجابة لسؤالك؟ تواصلي معنا وسنساعدك في أقرب وقت."
                  : "Didn't find what you were looking for? Contact us and we'll help you as soon as possible."}
              </p>

              <div className="faq-side-box">
                <MessageCircle />

                <p>
                  {ar
                    ? "فريق Glamora موجود لمساعدتك في أي استفسار متعلق بطلبك."
                    : "The Glamora team is here to help with any question about your order."}
                </p>
              </div>
            </aside>

            <section className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = open === index;

                return (
                  <div
                    className={`faq-item ${
                      isOpen ? "open" : ""
                    }`}
                    key={faq.q}
                  >
                    <button
                      className="faq-question"
                      onClick={() =>
                        setOpen(isOpen ? null : index)
                      }
                    >
                      <span>{faq.q}</span>
                      <ChevronDown />
                    </button>

                    {isOpen && (
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </div>

          <div className="policy-cta">
            <div>
              <h3>
                {ar
                  ? "ما زال لديك سؤال؟"
                  : "Still have a question?"}
              </h3>

              <p>
                {ar
                  ? "تواصلي مع فريق Glamora وسنساعدك."
                  : "Contact the Glamora team and we'll help you."}
              </p>
            </div>

            <Link
              href={`/${locale}/contact`}
              className="policy-cta-btn"
            >
              {ar ? "تواصل معنا" : "Contact us"}

              {ar ? (
                <ArrowLeft />
              ) : (
                <ArrowRight />
              )}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}