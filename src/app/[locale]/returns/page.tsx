"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  PackageCheck,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

type Locale = "ar" | "en";

interface NavbarProps {
  locale: Locale;
  cartCount?: number;
  wishCount?: number;
}
const CSS = `
  .returns-page{
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

  .returns-hero{
    padding:90px 24px 80px;
    background:
      radial-gradient(
        circle at 84% 20%,
        rgba(244,182,194,.46),
        transparent 32%
      ),
      linear-gradient(135deg,#fff 0%,#fff8fa 55%,#fbe4e8 100%);
    border-bottom:1px solid var(--line);
  }

  .returns-hero-inner{
    max-width:1100px;
    margin:auto;
  }

  .returns-kicker{
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

  .returns-kicker svg{
    width:15px;
    height:15px;
  }

  .returns-title{
    margin:0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:clamp(42px,6vw,72px);
    line-height:1;
    letter-spacing:-.045em;
    font-weight:500;
  }

  .returns-title span{
    color:var(--wine);
    font-style:italic;
  }

  .returns-intro{
    max-width:650px;
    margin:22px 0 0;
    color:var(--muted);
    font-size:14px;
    line-height:1.9;
  }

  .returns-wrap{
    max-width:1050px;
    margin:auto;
    padding:70px 24px 90px;
  }

  .returns-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:18px;
    margin-bottom:60px;
  }

  .returns-card{
    padding:28px;
    border:1px solid var(--line);
    border-radius:15px;
    background:#fff;
  }

  .returns-card-icon{
    width:45px;
    height:45px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:var(--blush);
    color:var(--wine);
    margin-bottom:18px;
  }

  .returns-card-icon svg{
    width:21px;
    height:21px;
  }

  .returns-card h3{
    margin:0 0 9px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:22px;
    font-weight:500;
  }

  .returns-card p{
    margin:0;
    color:var(--muted);
    font-size:12px;
    line-height:1.9;
  }

  .returns-section{
    display:grid;
    grid-template-columns:250px 1fr;
    gap:60px;
    margin-bottom:65px;
  }

  .returns-label{
    color:var(--wine);
    font-size:11px;
    font-weight:800;
    letter-spacing:.15em;
    text-transform:uppercase;
  }

  .returns-section-title{
    margin:8px 0 0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:31px;
    font-weight:500;
    line-height:1.2;
  }

  .returns-list{
    display:flex;
    flex-direction:column;
    gap:12px;
  }

  .returns-row{
    display:flex;
    gap:15px;
    padding:20px;
    border:1px solid var(--line);
    border-radius:12px;
  }

  .returns-row svg{
    width:20px;
    height:20px;
    flex:none;
    color:var(--wine);
    margin-top:2px;
  }

  .returns-row h4{
    margin:0 0 5px;
    font-size:13px;
  }

  .returns-row p{
    margin:0;
    color:var(--muted);
    font-size:12px;
    line-height:1.8;
  }

  .returns-excluded{
    margin-top:35px;
    padding:25px;
    border-radius:14px;
    background:#fff6f7;
    border:1px solid #f4dfe3;
  }

  .returns-excluded-title{
    display:flex;
    align-items:center;
    gap:8px;
    color:var(--wine);
    font-weight:800;
    font-size:13px;
    margin-bottom:12px;
  }

  .returns-excluded-title svg{
    width:17px;
    height:17px;
  }

  .returns-excluded ul{
    margin:0;
    padding-inline-start:20px;
    color:var(--muted);
    font-size:12px;
    line-height:2;
  }

  .returns-process{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:14px;
    margin-top:20px;
  }

  .returns-step{
    padding:22px;
    border-radius:13px;
    background:var(--navy);
    color:#fff;
  }

  .returns-step-number{
    color:var(--pink);
    font-family:Georgia,serif;
    font-size:27px;
    margin-bottom:12px;
  }

  .returns-step h4{
    margin:0 0 6px;
    font-size:13px;
  }

  .returns-step p{
    margin:0;
    color:rgba(255,255,255,.65);
    font-size:11px;
    line-height:1.8;
  }

  .returns-cta{
    margin-top:60px;
    padding:35px;
    border-radius:16px;
    background:linear-gradient(135deg,var(--wine),var(--wine-deep));
    color:#fff;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:25px;
  }

  .returns-cta h3{
    margin:0 0 7px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:27px;
    font-weight:500;
  }

  .returns-cta p{
    margin:0;
    color:rgba(255,255,255,.7);
    font-size:12px;
  }

  .returns-btn{
    flex:none;
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:12px 18px;
    background:#fff;
    color:var(--wine) !important;
    border-radius:4px;
    text-decoration:none;
    font-size:12px;
    font-weight:800;
  }

  .returns-btn svg{
    width:15px;
    height:15px;
  }

  @media(max-width:800px){
    .returns-section{
      grid-template-columns:1fr;
      gap:25px;
    }

    .returns-process{
      grid-template-columns:1fr;
    }
  }

  @media(max-width:600px){
    .returns-hero{
      padding:65px 20px 60px;
    }

    .returns-wrap{
      padding:50px 20px 65px;
    }

    .returns-grid{
      grid-template-columns:1fr;
    }

    .returns-cta{
      flex-direction:column;
      align-items:flex-start;
    }

    .returns-btn{
      width:100%;
      justify-content:center;
    }
  }
`;

export default function ReturnsPage() {
  const params = useParams();

  const locale = (
    params?.locale === "en" ? "en" : "ar"
  ) as Locale;

  const ar = locale === "ar";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: CSS,
        }}
      />

      <main className="returns-page" dir={ar ? "rtl" : "ltr"}>
        <section className="returns-hero">
          <div className="returns-hero-inner">
            <div className="returns-kicker">
              <RotateCcw />
              {ar ? "خدمة ما بعد البيع" : "AFTER SALES"}
            </div>

            <h1 className="returns-title">
              {ar ? (
                <>
                  الاسترجاع
                  <br />
                  <span>والاستبدال.</span>
                </>
              ) : (
                <>
                  Returns &
                  <br />
                  <span>Exchanges.</span>
                </>
              )}
            </h1>

            <p className="returns-intro">
              {ar
                ? "هدفنا أن تكون تجربة الشراء مريحة وواضحة. في حالة وجود مشكلة في طلبك، تواصلي معنا لمراجعة الحالة ومساعدتك."
                : "We want your shopping experience to feel simple and clear. If there is an issue with your order, contact us so we can review it and help."}
            </p>
          </div>
        </section>

        <div className="returns-wrap">
          <div className="returns-grid">
            <div className="returns-card">
              <div className="returns-card-icon">
                <CheckCircle2 />
              </div>

              <h3>
                {ar
                  ? "متى يمكن طلب الاسترجاع؟"
                  : "When can I request a return?"}
              </h3>

              <p>
                {ar
                  ? "يمكنك التواصل معنا عند وجود مشكلة في المنتج أو وصول منتج غير صحيح أو تالف، وسيتم تقييم الحالة قبل تأكيد الاسترجاع."
                  : "Contact us if there is an issue with the product or if an incorrect or damaged item was received. The case will be reviewed before the return is confirmed."}
              </p>
            </div>

            <div className="returns-card">
              <div className="returns-card-icon">
                <PackageCheck />
              </div>

              <h3>
                {ar
                  ? "حالة المنتج"
                  : "Product condition"}
              </h3>

              <p>
                {ar
                  ? "لأسباب تتعلق بالنظافة وجودة منتجات التجميل، يجب أن تكون المنتجات المرتجعة غير مستخدمة وفي حالتها الأصلية كلما كان ذلك ممكنًا."
                  : "For hygiene and beauty-product quality reasons, returned products should be unused and in their original condition whenever possible."}
              </p>
            </div>
          </div>

          <section className="returns-section">
            <div>
              <div className="returns-label">
                {ar ? "الشروط" : "CONDITIONS"}
              </div>

              <h2 className="returns-section-title">
                {ar
                  ? "قبل أن تطلبي الاسترجاع."
                  : "Before requesting a return."}
              </h2>
            </div>

            <div className="returns-list">
              {[
                {
                  icon: CheckCircle2,
                  title: ar
                    ? "المنتج غير مستخدم"
                    : "Unused product",
                  text: ar
                    ? "يفضل أن يكون المنتج غير مستخدم ومحافظًا على حالته الأصلية."
                    : "The product should be unused and kept in its original condition whenever possible.",
                },
                {
                  icon: CheckCircle2,
                  title: ar
                    ? "بيانات الطلب"
                    : "Order information",
                  text: ar
                    ? "جهزي رقم الطلب والمنتج الذي تريدين الاستفسار عنه."
                    : "Have your order number and the product you want help with ready.",
                },
                {
                  icon: CheckCircle2,
                  title: ar
                    ? "صور واضحة عند الحاجة"
                    : "Clear photos when needed",
                  text: ar
                    ? "في حالة التلف أو الخطأ، قد نطلب صورًا واضحة للمنتج والمشكلة."
                    : "For damaged or incorrect items, we may ask for clear photos of the product and issue.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="returns-row"
                    key={item.title}
                  >
                    <Icon />

                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.text}</p>
                    </div>
                  </div>
                );
              })}

              <div className="returns-excluded">
                <div className="returns-excluded-title">
                  <XCircle />

                  {ar
                    ? "منتجات قد لا تكون قابلة للاسترجاع"
                    : "Items that may not be returnable"}
                </div>

                <ul>
                  <li>
                    {ar
                      ? "المنتجات المستخدمة أو المفتوحة لأسباب تتعلق بالنظافة."
                      : "Used or opened beauty products for hygiene reasons."}
                  </li>

                  <li>
                    {ar
                      ? "المنتجات التي تم تغيير حالتها بعد الاستلام."
                      : "Products whose condition has been changed after delivery."}
                  </li>

                  <li>
                    {ar
                      ? "الطلبات التي لا تستوفي شروط الاسترجاع بعد مراجعتها."
                      : "Orders that do not meet the return conditions after review."}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="returns-label">
              {ar ? "طريقة الطلب" : "THE PROCESS"}
            </div>

            <h2 className="returns-section-title">
              {ar
                ? "ثلاث خطوات بسيطة."
                : "Three simple steps."}
            </h2>

            <div className="returns-process">
              <div className="returns-step">
                <div className="returns-step-number">
                  01
                </div>

                <h4>
                  {ar
                    ? "تواصلي معنا"
                    : "Contact us"}
                </h4>

                <p>
                  {ar
                    ? "أرسلي تفاصيل المشكلة ورقم الطلب."
                    : "Send us the issue details and order number."}
                </p>
              </div>

              <div className="returns-step">
                <div className="returns-step-number">
                  02
                </div>

                <h4>
                  {ar
                    ? "مراجعة الحالة"
                    : "Case review"}
                </h4>

                <p>
                  {ar
                    ? "نراجع الطلب والمنتج ونوضح لك الخطوات التالية."
                    : "We review the order and explain the next steps."}
                </p>
              </div>

              <div className="returns-step">
                <div className="returns-step-number">
                  03
                </div>

                <h4>
                  {ar
                    ? "إتمام الحل"
                    : "Resolution"}
                </h4>

                <p>
                  {ar
                    ? "بعد الموافقة يتم تنفيذ الاسترجاع أو الاستبدال حسب الحالة."
                    : "Once approved, the return or exchange is handled according to the case."}
                </p>
              </div>
            </div>
          </section>

          <div className="returns-cta">
            <div>
              <h3>
                {ar
                  ? "تحتاجين إلى مساعدة؟"
                  : "Need help?"}
              </h3>

              <p>
                {ar
                  ? "تواصلي مع فريق Glamora بخصوص طلبك."
                  : "Contact the Glamora team about your order."}
              </p>
            </div>

            <Link
              href={`/${locale}/contact`}
              className="returns-btn"
            >
              <MessageCircle />

              {ar
                ? "تواصل معنا"
                : "Contact us"}

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