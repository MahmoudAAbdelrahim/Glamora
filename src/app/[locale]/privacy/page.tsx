"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  UserRound,
  LockKeyhole,
  Database,
  Cookie,
  Eye,
  Mail,
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
  .privacy-page{
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

  .privacy-hero{
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

  .privacy-hero-inner{
    max-width:1100px;
    margin:auto;
  }

  .privacy-kicker{
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

  .privacy-kicker svg{
    width:15px;
    height:15px;
  }

  .privacy-title{
    margin:0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:clamp(42px,6vw,72px);
    line-height:1;
    letter-spacing:-.045em;
    font-weight:500;
  }

  .privacy-title span{
    color:var(--wine);
    font-style:italic;
  }

  .privacy-intro{
    max-width:650px;
    margin:22px 0 0;
    color:var(--muted);
    font-size:14px;
    line-height:1.9;
  }

  .privacy-wrap{
    max-width:1050px;
    margin:auto;
    padding:70px 24px 90px;
  }

  .privacy-overview{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:12px;
    margin-bottom:65px;
  }

  .privacy-overview-card{
    padding:20px;
    border:1px solid var(--line);
    border-radius:13px;
  }

  .privacy-overview-icon{
    width:38px;
    height:38px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:var(--blush);
    color:var(--wine);
    margin-bottom:13px;
  }

  .privacy-overview-icon svg{
    width:18px;
    height:18px;
  }

  .privacy-overview-card strong{
    display:block;
    font-size:12px;
    margin-bottom:5px;
  }

  .privacy-overview-card span{
    color:var(--muted);
    font-size:11px;
    line-height:1.6;
  }

  .privacy-section{
    display:grid;
    grid-template-columns:245px 1fr;
    gap:60px;
    padding:45px 0;
    border-top:1px solid var(--line);
  }

  .privacy-section:first-of-type{
    border-top:0;
    padding-top:0;
  }

  .privacy-label{
    color:var(--wine);
    font-size:11px;
    font-weight:800;
    letter-spacing:.15em;
    text-transform:uppercase;
  }

  .privacy-section-title{
    margin:8px 0 0;
    font-family:Georgia,"Times New Roman",serif;
    font-size:29px;
    font-weight:500;
    line-height:1.2;
  }

  .privacy-content{
    color:var(--muted);
    font-size:13px;
    line-height:2;
  }

  .privacy-content p{
    margin:0 0 16px;
  }

  .privacy-content p:last-child{
    margin-bottom:0;
  }

  .privacy-list{
    margin:0;
    padding-inline-start:20px;
  }

  .privacy-list li{
    margin-bottom:10px;
  }

  .privacy-highlight{
    margin-top:20px;
    padding:20px;
    border-radius:12px;
    background:var(--blush);
    color:#6b4050;
  }

  .privacy-highlight strong{
    display:block;
    color:var(--wine);
    margin-bottom:5px;
  }

  .privacy-contact{
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

  .privacy-contact h3{
    margin:0 0 7px;
    font-family:Georgia,"Times New Roman",serif;
    font-size:27px;
    font-weight:500;
  }

  .privacy-contact p{
    margin:0;
    color:rgba(255,255,255,.7);
    font-size:12px;
  }

  .privacy-contact-btn{
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

  .privacy-contact-btn svg{
    width:15px;
    height:15px;
  }

  @media(max-width:850px){
    .privacy-overview{
      grid-template-columns:1fr 1fr;
    }

    .privacy-section{
      grid-template-columns:1fr;
      gap:25px;
    }
  }

  @media(max-width:600px){
    .privacy-hero{
      padding:65px 20px 60px;
    }

    .privacy-wrap{
      padding:50px 20px 65px;
    }

    .privacy-overview{
      grid-template-columns:1fr;
    }

    .privacy-contact{
      flex-direction:column;
      align-items:flex-start;
    }

    .privacy-contact-btn{
      width:100%;
      justify-content:center;
    }
  }
`;

export default function PrivacyPage() {
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

      <main className="privacy-page" dir={ar ? "rtl" : "ltr"}>
        <section className="privacy-hero">
          <div className="privacy-hero-inner">
            <div className="privacy-kicker">
              <ShieldCheck />
              {ar ? "بياناتك بأمان" : "YOUR PRIVACY"}
            </div>

            <h1 className="privacy-title">
              {ar ? (
                <>
                  سياسة
                  <br />
                  <span>الخصوصية.</span>
                </>
              ) : (
                <>
                  Privacy
                  <br />
                  <span>Policy.</span>
                </>
              )}
            </h1>

            <p className="privacy-intro">
              {ar
                ? "نحترم خصوصيتك ونوضح هنا نوع المعلومات التي قد نحتاجها وكيف يتم استخدامها أثناء استخدامك لمتجر Glamora."
                : "We respect your privacy. This page explains the types of information Glamora may need and how it is used while you use our store."}
            </p>
          </div>
        </section>

        <div className="privacy-wrap">
          <div className="privacy-overview">
            {[
              {
                icon: UserRound,
                ar: "بيانات الحساب",
                en: "Account data",
              },
              {
                icon: LockKeyhole,
                ar: "حماية البيانات",
                en: "Data protection",
              },
              {
                icon: Database,
                ar: "بيانات الطلب",
                en: "Order data",
              },
              {
                icon: Cookie,
                ar: "ملفات الارتباط",
                en: "Cookies",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="privacy-overview-card"
                  key={item.en}
                >
                  <div className="privacy-overview-icon">
                    <Icon />
                  </div>

                  <strong>
                    {ar ? item.ar : item.en}
                  </strong>

                  <span>
                    {ar
                      ? "معلومات توضيحية"
                      : "Clear information"}
                  </span>
                </div>
              );
            })}
          </div>

          <section className="privacy-section">
            <div>
              <div className="privacy-label">
                01 · {ar ? "المعلومات" : "INFORMATION"}
              </div>

              <h2 className="privacy-section-title">
                {ar
                  ? "ما البيانات التي قد نجمعها؟"
                  : "What information may we collect?"}
              </h2>
            </div>

            <div className="privacy-content">
              <p>
                {ar
                  ? "عند استخدامك لمتجر Glamora، قد نحتاج إلى بيانات تساعدنا على إنشاء الحساب وتنفيذ الطلبات والتواصل معك."
                  : "When you use Glamora, we may need information that helps us create your account, process orders and communicate with you."}
              </p>

              <ul className="privacy-list">
                <li>
                  {ar
                    ? "الاسم وبيانات الحساب."
                    : "Name and account information."}
                </li>

                <li>
                  {ar
                    ? "رقم الهاتف وبيانات التواصل."
                    : "Phone number and contact details."}
                </li>

                <li>
                  {ar
                    ? "عنوان التوصيل والبيانات المرتبطة بالطلب."
                    : "Delivery address and order-related details."}
                </li>

                <li>
                  {ar
                    ? "معلومات مرتبطة باستخدام الموقع لتحسين التجربة."
                    : "Information related to site usage to improve the experience."}
                </li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <div>
              <div className="privacy-label">
                02 · {ar ? "الاستخدام" : "USE"}
              </div>

              <h2 className="privacy-section-title">
                {ar
                  ? "لماذا نستخدم بياناتك؟"
                  : "Why do we use your data?"}
              </h2>
            </div>

            <div className="privacy-content">
              <p>
                {ar
                  ? "نستخدم المعلومات اللازمة لتقديم خدمات المتجر وتشغيل حسابك وتنفيذ طلباتك."
                  : "We use the information needed to provide store services, operate your account and process your orders."}
              </p>

              <ul className="privacy-list">
                <li>
                  {ar
                    ? "تنفيذ الطلبات وتوصيل المنتجات."
                    : "Processing and delivering orders."}
                </li>

                <li>
                  {ar
                    ? "التواصل بشأن الطلبات والحساب."
                    : "Communicating about orders and your account."}
                </li>

                <li>
                  {ar
                    ? "تحسين أداء وتجربة الموقع."
                    : "Improving website performance and experience."}
                </li>

                <li>
                  {ar
                    ? "حماية الموقع من الاستخدام غير المصرح به."
                    : "Protecting the website against unauthorized use."}
                </li>
              </ul>
            </div>
          </section>

          <section className="privacy-section">
            <div>
              <div className="privacy-label">
                03 · {ar ? "الحماية" : "SECURITY"}
              </div>

              <h2 className="privacy-section-title">
                {ar
                  ? "كيف نحمي معلوماتك؟"
                  : "How do we protect your information?"}
              </h2>
            </div>

            <div className="privacy-content">
              <p>
                {ar
                  ? "نحرص على استخدام ممارسات مناسبة لحماية المعلومات من الوصول أو الاستخدام غير المصرح به."
                  : "We take appropriate measures to protect information from unauthorized access or use."}
              </p>

              <div className="privacy-highlight">
                <strong>
                  {ar
                    ? "ملاحظة مهمة"
                    : "Important note"}
                </strong>

                {ar
                  ? "لا ترسل كلمات المرور أو أي بيانات سرية عبر رسائل الدعم أو أي وسيلة غير مخصصة لذلك."
                  : "Never send passwords or sensitive credentials through support messages or any channel not intended for them."}
              </div>
            </div>
          </section>

          <section className="privacy-section">
            <div>
              <div className="privacy-label">
                04 · {ar ? "الكوكيز" : "COOKIES"}
              </div>

              <h2 className="privacy-section-title">
                {ar
                  ? "ملفات الارتباط"
                  : "Cookies"}
              </h2>
            </div>

            <div className="privacy-content">
              <p>
                {ar
                  ? "قد يستخدم الموقع ملفات ارتباط وتقنيات مشابهة للمساعدة في تشغيل بعض الوظائف وتحسين تجربة الاستخدام."
                  : "The website may use cookies and similar technologies to support certain functions and improve the user experience."}
              </p>

              <p>
                {ar
                  ? "يمكن أن تختلف إمكانية التحكم في ملفات الارتباط حسب إعدادات المتصفح والجهاز."
                  : "Your ability to control cookies may depend on your browser and device settings."}
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <div>
              <div className="privacy-label">
                05 · {ar ? "حقوقك" : "YOUR RIGHTS"}
              </div>

              <h2 className="privacy-section-title">
                {ar
                  ? "التحكم في بياناتك"
                  : "Control over your data"}
              </h2>
            </div>

            <div className="privacy-content">
              <p>
                {ar
                  ? "يمكنك مراجعة بيانات حسابك وتحديث المعلومات المتاحة من خلال حسابك، أو التواصل معنا إذا احتجت إلى مساعدة بخصوص بياناتك."
                  : "You can review and update available account information through your account, or contact us if you need help regarding your data."}
              </p>
            </div>
          </section>

          <div className="privacy-contact">
            <div>
              <h3>
                {ar
                  ? "لديك سؤال عن الخصوصية؟"
                  : "Have a privacy question?"}
              </h3>

              <p>
                {ar
                  ? "تواصل مع فريق Glamora لمزيد من المعلومات."
                  : "Contact the Glamora team for more information."}
              </p>
            </div>

            <Link
              href={`/${locale}/contact`}
              className="privacy-contact-btn"
            >
              <Mail />

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