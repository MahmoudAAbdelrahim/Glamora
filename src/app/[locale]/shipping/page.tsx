"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Truck,
  MapPin,
  Clock3,
  PackageCheck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

type Locale = "ar" | "en";

interface NavbarProps {
  locale: Locale;
  cartCount?: number;
  wishCount?: number;
}
const CSS = `
  .shipping-page{
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

  .shipping-hero{
    padding:90px 24px 80px;
    background:
      radial-gradient(
        circle at 82% 20%,
        rgba(244,182,194,.45),
        transparent 32%
      ),
      linear-gradient(135deg,#fff 0%,#fff8fa 55%,#fbe4e8 100%);
    border-bottom:1px solid var(--line);
  }

  .shipping-hero-inner{
    max-width:1100px;
    margin:auto;
  }

  .shipping-kicker{
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

  .shipping-kicker svg{
    width:15px;
    height:15px;
  }

  .shipping-title{
    margin:0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:clamp(42px,6vw,72px);
    line-height:1;
    letter-spacing:-.045em;
    font-weight:500;
  }

  .shipping-title span{
    color:var(--wine);
    font-style:italic;
  }

  .shipping-intro{
    max-width:650px;
    margin:22px 0 0;
    color:var(--muted);
    font-size:14px;
    line-height:1.9;
  }

  .shipping-wrap{
    max-width:1050px;
    margin:auto;
    padding:70px 24px 90px;
  }

  .shipping-features{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:15px;
    margin-bottom:65px;
  }

  .shipping-feature{
    padding:25px;
    border:1px solid var(--line);
    border-radius:14px;
    background:#fff;
  }

  .shipping-feature-icon{
    width:44px;
    height:44px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:var(--blush);
    color:var(--wine);
    margin-bottom:17px;
  }

  .shipping-feature-icon svg{
    width:20px;
    height:20px;
  }

  .shipping-feature h3{
    margin:0 0 7px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:20px;
    font-weight:500;
  }

  .shipping-feature p{
    margin:0;
    color:var(--muted);
    font-size:12px;
    line-height:1.8;
  }

  .shipping-section{
    display:grid;
    grid-template-columns:250px 1fr;
    gap:60px;
    margin-bottom:65px;
  }

  .shipping-label{
    color:var(--wine);
    font-size:11px;
    font-weight:800;
    letter-spacing:.15em;
    text-transform:uppercase;
  }

  .shipping-section-title{
    margin:8px 0 0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:31px;
    font-weight:500;
    line-height:1.2;
  }

  .shipping-content{
    display:flex;
    flex-direction:column;
    gap:12px;
  }

  .shipping-card{
    display:flex;
    gap:17px;
    padding:20px;
    border:1px solid var(--line);
    border-radius:12px;
    background:#fff;
  }

  .shipping-number{
    width:30px;
    height:30px;
    border-radius:50%;
    background:var(--wine);
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    flex:none;
    font-size:11px;
    font-weight:800;
  }

  .shipping-card h4{
    margin:0 0 5px;
    font-size:13px;
  }

  .shipping-card p{
    margin:0;
    color:var(--muted);
    font-size:12px;
    line-height:1.8;
  }

  .shipping-note{
    padding:25px;
    border-radius:14px;
    background:var(--navy);
    color:#fff;
    display:flex;
    align-items:flex-start;
    gap:15px;
  }

  .shipping-note svg{
    color:var(--pink);
    width:21px;
    height:21px;
    flex:none;
  }

  .shipping-note h3{
    margin:0 0 6px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:20px;
    font-weight:500;
  }

  .shipping-note p{
    margin:0;
    color:rgba(255,255,255,.68);
    font-size:12px;
    line-height:1.8;
  }

  .shipping-cta{
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

  .shipping-cta h3{
    margin:0 0 7px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:27px;
    font-weight:500;
  }

  .shipping-cta p{
    margin:0;
    color:rgba(255,255,255,.7);
    font-size:12px;
  }

  .shipping-btn{
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

  .shipping-btn svg{
    width:15px;
    height:15px;
  }

  @media(max-width:800px){
    .shipping-features{
      grid-template-columns:1fr;
    }

    .shipping-section{
      grid-template-columns:1fr;
      gap:25px;
    }
  }

  @media(max-width:600px){
    .shipping-hero{
      padding:65px 20px 60px;
    }

    .shipping-wrap{
      padding:50px 20px 65px;
    }

    .shipping-cta{
      flex-direction:column;
      align-items:flex-start;
    }

    .shipping-btn{
      width:100%;
      justify-content:center;
    }
  }
`;

export default function ShippingPage() {
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

      <main className="shipping-page" dir={ar ? "rtl" : "ltr"}>
        <section className="shipping-hero">
          <div className="shipping-hero-inner">
            <div className="shipping-kicker">
              <Truck />
              {ar ? "التوصيل" : "DELIVERY"}
            </div>

            <h1 className="shipping-title">
              {ar ? (
                <>
                  الشحن
                  <br />
                  <span>والتوصيل.</span>
                </>
              ) : (
                <>
                  Shipping &
                  <br />
                  <span>Delivery.</span>
                </>
              )}
            </h1>

            <p className="shipping-intro">
              {ar
                ? "نريد أن تصل مشترياتك من Glamora إليك بسهولة ووضوح، من لحظة تأكيد الطلب وحتى وصوله إلى بابك."
                : "We want your Glamora order to reach you smoothly and clearly, from order confirmation to delivery at your door."}
            </p>
          </div>
        </section>

        <div className="shipping-wrap">
          <div className="shipping-features">
            <div className="shipping-feature">
              <div className="shipping-feature-icon">
                <MapPin />
              </div>

              <h3>
                {ar
                  ? "التوصيل داخل مصر"
                  : "Delivery in Egypt"}
              </h3>

              <p>
                {ar
                  ? "نوفر خدمة التوصيل للطلبات داخل المحافظات والمناطق التي تغطيها خدمة الشحن."
                  : "We deliver orders across covered cities and governorates in Egypt."}
              </p>
            </div>

            <div className="shipping-feature">
              <div className="shipping-feature-icon">
                <Clock3 />
              </div>

              <h3>
                {ar
                  ? "مدة التوصيل"
                  : "Delivery Time"}
              </h3>

              <p>
                {ar
                  ? "تختلف مدة الوصول حسب المحافظة وحالة شركة الشحن، وسيتم توضيح التفاصيل المتاحة أثناء الطلب."
                  : "Delivery time depends on your location and courier availability. Available details are shown during the order process."}
              </p>
            </div>

            <div className="shipping-feature">
              <div className="shipping-feature-icon">
                <PackageCheck />
              </div>

              <h3>
                {ar
                  ? "تتبع طلبك"
                  : "Track Your Order"}
              </h3>

              <p>
                {ar
                  ? "بعد إنشاء الطلب يمكنك متابعة حالته من صفحة طلباتك والتعرف على آخر تحديث."
                  : "After placing an order, you can follow its status from your Orders page."}
              </p>
            </div>
          </div>

          <section className="shipping-section">
            <div>
              <div className="shipping-label">
                {ar ? "كيف يعمل؟" : "HOW IT WORKS"}
              </div>

              <h2 className="shipping-section-title">
                {ar
                  ? "من المتجر إلى بابك."
                  : "From our store to your door."}
              </h2>
            </div>

            <div className="shipping-content">
              {[
                {
                  title: ar
                    ? "تأكيد الطلب"
                    : "Order confirmation",
                  text: ar
                    ? "بعد إتمام الطلب، تتم مراجعة بياناتك وعنوان التوصيل."
                    : "After placing your order, your details and delivery address are reviewed.",
                },
                {
                  title: ar
                    ? "تجهيز المنتجات"
                    : "Order preparation",
                  text: ar
                    ? "يتم تجهيز المنتجات المطلوبة وتجهيزها للشحن."
                    : "Your selected products are prepared and packed for delivery.",
                },
                {
                  title: ar
                    ? "التسليم"
                    : "Delivery",
                  text: ar
                    ? "يتم تسليم الطلب إلى العنوان الذي أدخلته أثناء إتمام الطلب."
                    : "Your order is delivered to the address provided during checkout.",
                },
              ].map((item, index) => (
                <div
                  className="shipping-card"
                  key={item.title}
                >
                  <div className="shipping-number">
                    {index + 1}
                  </div>

                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="shipping-note">
            <ShieldCheck />

            <div>
              <h3>
                {ar
                  ? "معلومات العنوان مهمة"
                  : "Your address matters"}
              </h3>

              <p>
                {ar
                  ? "تأكدي من كتابة الاسم ورقم الهاتف والمحافظة والمدينة والعنوان بشكل صحيح لتجنب أي تأخير في التوصيل."
                  : "Make sure your name, phone number, governorate, city and address are accurate to avoid delivery delays."}
              </p>
            </div>
          </div>

          <div className="shipping-cta">
            <div>
              <h3>
                {ar
                  ? "هل تريدين معرفة حالة طلبك؟"
                  : "Want to check your order?"}
              </h3>

              <p>
                {ar
                  ? "اذهبي إلى صفحة طلباتك لمتابعة آخر تحديث."
                  : "Go to your Orders page to see the latest update."}
              </p>
            </div>

            <Link
              href={`/${locale}/orders`}
              className="shipping-btn"
            >
              {ar ? "طلباتي" : "My orders"}

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