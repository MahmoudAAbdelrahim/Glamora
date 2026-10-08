"use client";



import Link from "next/link";
import { useState, type FormEvent } from "react";

import {

  ArrowUpRight,

  Mail,

  MapPin,

  Phone,

  Sparkles,

  Play,

  MessageCircle,

} from "lucide-react";

import { useParams } from "next/navigation";



type Locale = "ar" | "en";



interface NavbarProps {

  locale: Locale;

  cartCount?: number;

  wishCount?: number;

}



const FOOTER_CSS = `

  .gf-footer{

    --wine:#9f294b;

    --wine-dark:#8b1538;

    --pink:#f4b6c2;

    --rose:#d6506f;

    --blush:#fbe4e8;

    --white:#ffffff;



    position:relative;

    overflow:hidden;

    background:

      radial-gradient(

        circle at 10% 0%,

        rgba(244,182,194,.18),

        transparent 30%

      ),

      radial-gradient(

        circle at 90% 100%,

        rgba(244,182,194,.13),

        transparent 28%

      ),

      linear-gradient(

        145deg,

        #a72f50 0%,

        #9f294b 48%,

        #952343 100%

      );



    color:#fff;

  }



  .gf-footer::before{

    content:"";

    position:absolute;

    width:520px;

    height:520px;

    border-radius:50%;

    top:-350px;

    right:-180px;

    border:1px solid rgba(255,255,255,.07);

    pointer-events:none;

  }



  .gf-footer::after{

    content:"";

    position:absolute;

    width:420px;

    height:420px;

    border-radius:50%;

    bottom:-300px;

    left:-180px;

    border:1px solid rgba(255,255,255,.06);

    pointer-events:none;

  }



  /* =========================

     NEWSLETTER

  ========================= */



  .gf-newsletter{

    position:relative;

    z-index:1;

    padding:72px 24px 64px;

    border-bottom:1px solid rgba(255,255,255,.16);

  }



  .gf-newsletter-inner{

    max-width:1180px;

    margin:0 auto;

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:60px;

    align-items:center;

  }



  .gf-eyebrow{

    display:inline-flex;

    align-items:center;

    gap:8px;

    margin-bottom:15px;

    color:var(--pink);

    font-size:11px;

    font-weight:800;

    letter-spacing:.18em;

    text-transform:uppercase;

  }



  .gf-eyebrow-dot{

    width:6px;

    height:6px;

    border-radius:50%;

    background:var(--pink);

    box-shadow:0 0 12px rgba(244,182,194,.65);

  }



  .gf-newsletter-title{

    margin:0;

    max-width:570px;

    color:#fff;

    font-family:Georgia,"Times New Roman",serif;

    font-size:clamp(34px,4vw,57px);

    font-weight:500;

    line-height:1.05;

    letter-spacing:-.035em;

  }



  .gf-newsletter-title em{

    color:var(--pink);

    font-style:italic;

    font-weight:400;

  }



  .gf-newsletter-text{

    margin:18px 0 0;

    max-width:510px;

    color:rgba(255,255,255,.74);

    font-size:14px;

    line-height:1.9;

  }



  .gf-newsletter-form{

    display:flex;

    gap:10px;

    width:100%;

    max-width:500px;

    justify-self:end;

  }



  .gf-newsletter-input{

    flex:1;

    min-width:0;

    height:56px;

    padding:0 20px;

    border:1px solid rgba(255,255,255,.2);

    border-radius:3px;

    outline:none;

    background:rgba(255,255,255,.1);

    color:#fff;

    font-size:14px;

    backdrop-filter:blur(10px);

    transition:

      border-color .25s ease,

      background .25s ease,

      box-shadow .25s ease;

  }



  .gf-newsletter-input::placeholder{

    color:rgba(255,255,255,.58);

  }



  .gf-newsletter-input:focus{

    border-color:rgba(244,182,194,.8);

    background:rgba(255,255,255,.14);

    box-shadow:0 0 0 4px rgba(244,182,194,.08);

  }



  .gf-newsletter-btn{

    position:relative;

    overflow:hidden;

    height:56px;

    padding:0 24px;

    border:0;

    border-radius:3px;

    background:#fff;

    color:var(--wine-dark) !important;

    cursor:pointer;

    display:inline-flex;

    align-items:center;

    justify-content:center;

    gap:9px;

    font-size:13px;

    font-weight:800;

    white-space:nowrap;

    transition:

      transform .25s ease,

      background .25s ease;

  }



  .gf-newsletter-btn:hover{

    transform:translateY(-2px);

    background:var(--blush);

  }



  .gf-newsletter-btn span,

  .gf-newsletter-btn svg{

    position:relative;

    z-index:1;

    color:var(--wine-dark) !important;

  }



  /* =========================

     MAIN

  ========================= */



  .gf-main{

    position:relative;

    z-index:1;

    max-width:1180px;

    margin:0 auto;

    padding:65px 24px 55px;

    display:grid;

    grid-template-columns:1.45fr 1fr 1fr 1fr;

    gap:55px;

  }



  /* =========================

     BRAND

  ========================= */



  .gf-brand{

    padding-right:25px;

  }



  .gf-logo{

    display:inline-flex;

    align-items:center;

    gap:10px;

    color:#fff;

    text-decoration:none;

  }



  /*

    نفس لوجو الـNavbar

    SVG متعدد الألوان

  */



  .gf-logo-mark{

    width:44px;

    height:44px;

    display:block;

    flex:none;

  }



  .gf-logo-mark .petal-light{

    fill:#f4b6c2;

  }



  .gf-logo-mark .petal-mid{

    fill:#d6506f;

  }



  .gf-logo-mark .petal-main{

    fill:#8b1538;

  }



  .gf-logo-mark .logo-line{

    stroke:#8b1538;

  }



  .gf-logo-text{

    font-family:Georgia,"Times New Roman",serif;

    font-size:29px;

    letter-spacing:-.045em;

    font-weight:600;

    color:#fff;

  }



  .gf-brand-desc{

    margin:20px 0 25px;

    max-width:320px;

    color:rgba(255,255,255,.73);

    font-size:13px;

    line-height:1.9;

  }



  .gf-contact-list{

    display:flex;

    flex-direction:column;

    gap:13px;

  }



  .gf-contact{

    display:flex;

    align-items:center;

    gap:10px;

    color:rgba(255,255,255,.75);

    font-size:12px;

  }



  .gf-contact svg{

    width:15px;

    height:15px;

    color:var(--pink);

    flex:none;

  }



  /* =========================

     COLUMNS

  ========================= */



  .gf-column-title{

    margin:4px 0 21px;

    color:#fff;

    font-size:12px;

    font-weight:800;

    letter-spacing:.12em;

    text-transform:uppercase;

  }



  .gf-links{

    display:flex;

    flex-direction:column;

    gap:13px;

  }



  .gf-link{

    width:max-content;

    max-width:100%;

    position:relative;

    color:rgba(255,255,255,.7);

    text-decoration:none;

    font-size:13px;

    transition:

      color .2s ease,

      transform .2s ease;

  }



  .gf-link::after{

    content:"";

    position:absolute;

    bottom:-4px;

    inset-inline-start:0;

    width:0;

    height:1px;

    background:var(--pink);

    transition:width .25s ease;

  }



  .gf-link:hover{

    color:#fff;

    transform:translateX(3px);

  }



  [dir="rtl"] .gf-link:hover{

    transform:translateX(-3px);

  }



  .gf-link:hover::after{

    width:100%;

  }



  /* =========================

     SOCIAL

  ========================= */



  .gf-socials{

    display:flex;

    gap:9px;

    margin-top:25px;

  }



  .gf-social{

    width:38px;

    height:38px;

    border:1px solid rgba(255,255,255,.2);

    border-radius:50%;

    display:flex;

    align-items:center;

    justify-content:center;

    color:#fff;

    text-decoration:none;

    transition:

      color .25s ease,

      background .25s ease,

      border-color .25s ease,

      transform .25s ease;

  }



  .gf-social svg{

    width:15px;

    height:15px;

  }



  .gf-social:hover{

    color:var(--wine-dark);

    background:var(--pink);

    border-color:var(--pink);

    transform:translateY(-3px);

  }



  /* =========================

     BOTTOM

  ========================= */



  .gf-bottom{

    position:relative;

    z-index:1;

    max-width:1180px;

    margin:0 auto;

    padding:20px 24px 25px;

    border-top:1px solid rgba(255,255,255,.15);

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:20px;

  }



  .gf-copy{

    color:rgba(255,255,255,.52);

    font-size:11px;

  }



  .gf-bottom-links{

    display:flex;

    align-items:center;

    gap:20px;

  }



  .gf-bottom-link{

    color:rgba(255,255,255,.58);

    text-decoration:none;

    font-size:11px;

    transition:color .2s ease;

  }



  .gf-bottom-link:hover{

    color:#fff;

  }



  .gf-back-top{

    display:inline-flex;

    align-items:center;

    gap:7px;

    color:var(--pink);

    text-decoration:none;

    font-size:11px;

    font-weight:700;

  }



  .gf-back-top svg{

    width:14px;

    height:14px;

    transition:transform .25s ease;

  }



  .gf-back-top:hover svg{

    transform:translateY(-3px);

  }



  /* =========================

     RESPONSIVE

  ========================= */



  @media(max-width:900px){

    .gf-newsletter-inner{

      grid-template-columns:1fr;

      gap:30px;

    }



    .gf-newsletter-form{

      justify-self:start;

    }



    .gf-main{

      grid-template-columns:1.3fr 1fr 1fr;

      gap:40px 28px;

    }



    .gf-brand{

      grid-column:1/-1;

      padding-right:0;

    }

  }



  @media(max-width:640px){

    .gf-newsletter{

      padding:55px 20px 48px;

    }



    .gf-newsletter-title{

      font-size:38px;

    }



    .gf-newsletter-form{

      flex-direction:column;

      max-width:none;

    }



    .gf-newsletter-input,

    .gf-newsletter-btn{

      width:100%;

    }



    .gf-main{

      padding:50px 20px 40px;

      grid-template-columns:1fr 1fr;

      gap:38px 25px;

    }



    .gf-brand{

      grid-column:1/-1;

    }



    .gf-bottom{

      padding:20px;

      flex-direction:column;

      align-items:flex-start;

    }



    .gf-bottom-links{

      width:100%;

      justify-content:space-between;

    }

  }



  @media(max-width:420px){

    .gf-main{

      grid-template-columns:1fr;

    }



    .gf-brand{

      grid-column:auto;

    }



    .gf-bottom-links{

      flex-wrap:wrap;

      gap:12px;

    }

  }



  @media(prefers-reduced-motion:reduce){

    .gf-newsletter-btn,

    .gf-social,

    .gf-link,

    .gf-back-top svg{

      transition:none;

    }

  }


  /* GLAMORA REDESIGN — keep every original footer section and link */
  .gf-footer {
    --wine: #8b1538;
    --wine-dark: #70102d;
    --pink: #f4b6c2;
    --blush: #fbe4e8;
    --white: #ffffff;
    --navy: #17233f;
    isolation: isolate;
    background: var(--wine);
    color: var(--white);
  }

  .gf-footer::before,
  .gf-footer::after {
    z-index: -1;
    opacity: .8;
    border-color: rgba(244, 182, 194, .28);
  }

  /* Newsletter gets its own bright, editorial panel */
  .gf-newsletter {
    position: relative;
    padding: clamp(44px, 6vw, 76px) 24px;
    background: var(--blush);
    border-bottom: 1px solid rgba(139, 21, 56, .12);
  }

  .gf-newsletter-inner {
    width: min(1120px, 100%);
    gap: clamp(28px, 5vw, 76px);
    align-items: center;
  }

  .gf-eyebrow {
    color: var(--wine);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .14em;
  }

  .gf-eyebrow-dot {
    background: var(--wine);
    box-shadow: 0 0 0 5px rgba(139, 21, 56, .09);
  }

  .gf-newsletter-title {
    margin-top: 16px;
    color: var(--navy) !important;
    line-height: 1.12;
    letter-spacing: -.035em;
    text-wrap: balance;
  }

  .gf-newsletter-title em {
    color: var(--wine);
    font-style: normal;
    text-shadow: none;
  }

  .gf-newsletter-text {
    max-width: 480px;
    color: var(--navy);
    opacity: .78;
    line-height: 1.95;
  }

  .gf-newsletter-form {
    display: flex;
    gap: 8px;
    padding: 7px;
    border: 1px solid rgba(23, 35, 63, .14);
    border-radius: 18px;
    background: var(--white);
    box-shadow: 0 16px 42px rgba(23, 35, 63, .08);
    transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
  }

  .gf-newsletter-form:focus-within {
    border-color: var(--wine);
    box-shadow: 0 18px 44px rgba(23, 35, 63, .12), 0 0 0 4px rgba(139, 21, 56, .07);
    transform: translateY(-2px);
  }

  .gf-newsletter-input {
    min-width: 0;
    height: 52px;
    padding-inline: 17px;
    border: 0;
    outline: none;
    color: var(--navy);
    background: transparent;
  }

  .gf-newsletter-input::placeholder { color: rgba(23, 35, 63, .55); }
  .gf-newsletter-input:focus { box-shadow: none; }

  .gf-newsletter-btn {
    min-height: 50px;
    padding: 0 22px;
    border-radius: 12px;
    background: var(--wine);
    color: var(--white) !important;
    font-weight: 800;
    box-shadow: 0 7px 18px rgba(139, 21, 56, .18);
    transition: transform .22s ease, background .22s ease, box-shadow .22s ease;
  }

  .gf-newsletter-btn span,
  .gf-newsletter-btn svg { color: var(--white) !important; }
  .gf-newsletter-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    background: var(--wine-dark);
    box-shadow: 0 11px 24px rgba(139, 21, 56, .22);
  }
  .gf-newsletter-btn:disabled { opacity: .68; cursor: wait; }
  .gf-newsletter-status { grid-column: 1 / -1; margin: 8px 4px 0; color: var(--wine); font-size: 13px; line-height: 1.7; }

  /* Main footer: clearer hierarchy, generous spacing, consistent brand colors */
  .gf-main {
    width: min(1200px, calc(100% - 48px));
    margin-inline: auto;
    padding: clamp(48px, 6vw, 76px) 0 52px;
    gap: clamp(28px, 4vw, 58px);
  }

  .gf-logo { gap: 12px; }
  .gf-logo-mark { filter: drop-shadow(0 5px 14px rgba(244, 182, 194, .2)); transition: transform .35s ease; }
  .gf-logo:hover .gf-logo-mark { transform: rotate(-7deg) scale(1.06); }
  .gf-logo-text { color: var(--white); letter-spacing: -.045em; }
  .gf-brand-desc { color: rgba(255, 255, 255, .78); line-height: 1.95; }
  .gf-contact-list { gap: 15px; }
  .gf-contact { color: rgba(255, 255, 255, .84); gap: 11px; line-height: 1.8; }
  .gf-contact > svg { flex: 0 0 auto; color: var(--pink); }

  .gf-column-title {
    margin-bottom: 22px;
    color: var(--white);
    font-size: 14px;
    letter-spacing: .02em;
  }
  .gf-column-title::after {
    content: "";
    display: block;
    width: 34px;
    height: 3px;
    margin-top: 12px;
    border-radius: 99px;
    background: var(--pink);
  }

  .gf-links { gap: 13px; }
  .gf-link {
    width: fit-content;
    color: rgba(255, 255, 255, .75);
    transition: color .2s ease, transform .2s ease;
  }
  .gf-link:hover { color: var(--pink); transform: translateX(-3px); }
  .gf-footer[dir="ltr"] .gf-link:hover { transform: translateX(3px); }

  .gf-socials { gap: 10px; margin-top: 25px; }
  .gf-social {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(244, 182, 194, .4);
    border-radius: 14px;
    color: var(--white);
    background: rgba(244, 182, 194, .08);
    transition: transform .25s ease, background .25s ease, border-color .25s ease, color .25s ease;
  }
  .gf-social:hover {
    transform: translateY(-4px);
    color: var(--navy);
    background: var(--pink);
    border-color: var(--pink);
  }

  .gf-bottom {
    width: min(1200px, calc(100% - 48px));
    margin-inline: auto;
    padding: 22px 0;
    border-top: 1px solid rgba(244, 182, 194, .25);
    color: rgba(255, 255, 255, .68);
    gap: 18px;
  }
  .gf-copy { color: rgba(255, 255, 255, .68); }
  .gf-bottom-link { color: rgba(255, 255, 255, .76); transition: color .2s ease; }
  .gf-bottom-link:hover { color: var(--pink); }
  .gf-back-top {
    border: 1px solid rgba(244, 182, 194, .4);
    border-radius: 999px;
    padding: 9px 14px;
    color: var(--white);
    background: rgba(244, 182, 194, .08);
    transition: background .2s ease, transform .2s ease;
  }
  .gf-back-top:hover { color: var(--navy); background: var(--pink); transform: translateY(-2px); }

  @media (max-width: 760px) {
    .gf-newsletter { padding: 44px 18px; }
    .gf-newsletter-inner { grid-template-columns: 1fr; gap: 24px; }
    .gf-newsletter-title { font-size: clamp(32px, 8vw, 44px); }
    .gf-newsletter-form { width: 100%; }
    .gf-newsletter-btn { padding-inline: 14px; white-space: nowrap; }
    .gf-main { width: calc(100% - 36px); padding: 42px 0 35px; }
    .gf-bottom { width: calc(100% - 36px); flex-wrap: wrap; justify-content: center; text-align: center; }
    .gf-bottom-links { flex-wrap: wrap; justify-content: center; }
  }

  @media (max-width: 420px) {
    .gf-newsletter-form { flex-direction: column; align-items: stretch; }
    .gf-newsletter-input, .gf-newsletter-btn { width: 100%; }
    .gf-newsletter-btn { justify-content: center; }
  }

  @media (prefers-reduced-motion: reduce) {
    .gf-newsletter-form, .gf-newsletter-btn, .gf-social, .gf-link, .gf-back-top, .gf-logo-mark { transition: none; }
  }

`;



/* نفس علامة Glamora الموجودة في الـNavbar */

function GlamoraMark() {

  return (

    <svg

      className="gf-logo-mark"

      viewBox="0 0 40 40"

      aria-hidden="true"

    >

      <path

        d="M20 16C24 21 24 27 20 32C16 27 16 21 20 16Z"

        transform="rotate(-62 20 32)"

        className="petal-light"

      />



      <path

        d="M20 16C24 21 24 27 20 32C16 27 16 21 20 16Z"

        transform="rotate(62 20 32)"

        className="petal-light"

      />



      <path

        d="M20 12C25 18 25 26 20 32C15 26 15 18 20 12Z"

        transform="rotate(-31 20 32)"

        className="petal-mid"

      />



      <path

        d="M20 12C25 18 25 26 20 32C15 26 15 18 20 12Z"

        transform="rotate(31 20 32)"

        className="petal-mid"

      />



      <path

        d="M20 7C26 14 26 24 20 32C14 24 14 14 20 7Z"

        className="petal-main"

      />



      <path

        d="M10 35.5Q20 39 30 35.5"

        className="logo-line"

        strokeWidth="1.7"

        fill="none"

        strokeLinecap="round"

      />

    </svg>

  );

}



export default function Footer() {

  const params = useParams();



  const locale = (

    params?.locale === "en" ? "en" : "ar"

  ) as Locale;



  const isArabic = locale === "ar";



  
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  async function handleNewsletterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewsletterStatus("");
    setNewsletterLoading(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || (isArabic ? "تعذر إرسال الاشتراك الآن." : "Could not submit your subscription."));
      setNewsletterStatus(isArabic ? "تم استلام بريدك الإلكتروني بنجاح." : "Your email has been submitted successfully.");
      setNewsletterEmail("");
    } catch (error) {
      setNewsletterStatus(error instanceof Error ? error.message : (isArabic ? "حدث خطأ، حاول مرة أخرى." : "Something went wrong. Please try again."));
    } finally {
      setNewsletterLoading(false);
    }
  }
const t = {

    brand: "Glamora",



    description: isArabic

      ? "جمالك يبدأ من التفاصيل. اكتشفي عالمًا مختارًا بعناية من مستحضرات التجميل والعناية بالبشرة."

      : "Your beauty begins with the details. Discover a carefully curated world of beauty and skincare.",



    newsletterLabel: isArabic

      ? "ابقَي على اطلاع"

      : "STAY IN THE KNOW",



    newsletterText: isArabic

      ? "اشتركي في النشرة البريدية واحصلي على آخر المنتجات والعروض والنصائح."

      : "Subscribe for new arrivals, exclusive offers and beauty tips.",



    emailPlaceholder: isArabic

      ? "بريدك الإلكتروني"

      : "Your email address",



    subscribe: isArabic

      ? "اشتركي"

      : "Subscribe",



    shop: isArabic

      ? "المتجر"

      : "Shop",



    categories: isArabic

      ? "التصنيفات"

      : "Categories",



    bestSellers: isArabic

      ? "الأكثر مبيعًا"

      : "Best Sellers",



    newArrivals: isArabic

      ? "وصل حديثًا"

      : "New Arrivals",



    skincare: isArabic

      ? "العناية بالبشرة"

      : "Skincare",



    makeup: isArabic

      ? "المكياج"

      : "Makeup",



    company: "Glamora",



    about: isArabic

      ? "من نحن"

      : "About Us",



    contact: isArabic

      ? "تواصل معنا"

      : "Contact Us",



    orders: isArabic

      ? "طلباتي"

      : "My Orders",



    account: isArabic

      ? "حسابي"

      : "My Account",



    support: isArabic

      ? "المساعدة"

      : "Support",



    faq: isArabic

      ? "الأسئلة الشائعة"

      : "FAQ",



    shipping: isArabic

      ? "الشحن والتوصيل"

      : "Shipping & Delivery",



    returns: isArabic

      ? "الاسترجاع والاستبدال"

      : "Returns & Exchanges",



    privacy: isArabic

      ? "الخصوصية"

      : "Privacy Policy",



    location: isArabic

      ? "القاهرة، مصر"

      : "Cairo, Egypt",



    phone: "+20 100 000 0000",



    email: "hello@glamora.com",



    rights: isArabic

      ? "© 2026 Glamora. جميع الحقوق محفوظة."

      : "© 2026 Glamora. All rights reserved.",



    terms: isArabic

      ? "الشروط والأحكام"

      : "Terms & Conditions",



    backTop: isArabic

      ? "للأعلى"

      : "Back to top",

  };



  return (

    <>

      <style

        dangerouslySetInnerHTML={{

          __html: FOOTER_CSS,

        }}

      />



      <footer

        className="gf-footer"

        dir={isArabic ? "rtl" : "ltr"}

      >

        {/* Newsletter */}

        <section className="gf-newsletter">

          <div className="gf-newsletter-inner">



            <div>

              <div className="gf-eyebrow">

                <span className="gf-eyebrow-dot" />

                {t.newsletterLabel}

              </div>



              <h2 className="gf-newsletter-title">

                {isArabic ? (

                  <>

                    خلي جمالك

                    <br />

                    <em>دايمًا في الصورة.</em>

                  </>

                ) : (

                  <>

                    Keep your beauty

                    <br />

                    <em>in the picture.</em>

                  </>

                )}

              </h2>



              <p className="gf-newsletter-text">

                {t.newsletterText}

              </p>

            </div>



            <form

              className="gf-newsletter-form"

              onSubmit={handleNewsletterSubmit}

            >

              <input

                className="gf-newsletter-input"

                type="email"
                name="email"
                autoComplete="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                aria-label={t.emailPlaceholder}
              />



              <button

                type="submit"

                className="gf-newsletter-btn"
                disabled={newsletterLoading}
              >
                <span>{newsletterLoading ? (isArabic ? "جارٍ الإرسال..." : "Sending...") : t.subscribe}</span>

                <ArrowUpRight size={16} />

              </button>

            </form>
            {newsletterStatus ? (
              <p className="gf-newsletter-status" role="status" aria-live="polite">{newsletterStatus}</p>
            ) : null}
          </div>
        </section>



        {/* Main Footer */}

        <div className="gf-main">



          {/* Brand */}

          <div className="gf-brand">



            <Link

              href={`/${locale}`}

              className="gf-logo"

            >

              <GlamoraMark />



              <span className="gf-logo-text">

                {t.brand}

              </span>

            </Link>



            <p className="gf-brand-desc">

              {t.description}

            </p>



            <div className="gf-contact-list">



              <div className="gf-contact">

                <MapPin />

                <span>{t.location}</span>

              </div>



              <div className="gf-contact">

                <Phone />

                <span dir="ltr">

                  {t.phone}

                </span>

              </div>



              <div className="gf-contact">

                <Mail />

                <span>{t.email}</span>

              </div>



            </div>



            <div className="gf-socials">



              <a

                href="#"

                className="gf-social"

                aria-label="Instagram"

              >

                <Sparkles />

              </a>



              <a

                href="#"

                className="gf-social"

                aria-label="Facebook"

              >

                <MessageCircle />

              </a>



              <a

                href="#"

                className="gf-social"

                aria-label="YouTube"

              >

                <Play />

              </a>



            </div>



          </div>



          {/* Shop */}

          <div>

            <h3 className="gf-column-title">

              {t.shop}

            </h3>



            <nav className="gf-links">



              <Link

                href={`/${locale}/products`}

                className="gf-link"

              >

                {t.categories}

              </Link>



              <Link

                href={`/${locale}/products?sort=best-selling`}

                className="gf-link"

              >

                {t.bestSellers}

              </Link>



              <Link

                href={`/${locale}/products?sort=new`}

                className="gf-link"

              >

                {t.newArrivals}

              </Link>



              <Link

                href={`/${locale}/products?category=skincare`}

                className="gf-link"

              >

                {t.skincare}

              </Link>



              <Link

                href={`/${locale}/products?category=makeup`}

                className="gf-link"

              >

                {t.makeup}

              </Link>



            </nav>

          </div>



          {/* Company */}

          <div>

            <h3 className="gf-column-title">

              {t.company}

            </h3>



            <nav className="gf-links">



              <Link

                href={`/${locale}/about`}

                className="gf-link"

              >

                {t.about}

              </Link>



              <Link

                href={`/${locale}/contact`}

                className="gf-link"

              >

                {t.contact}

              </Link>



              <Link

                href={`/${locale}/orders`}

                className="gf-link"

              >

                {t.orders}

              </Link>



              <Link

                href={`/${locale}/profile`}

                className="gf-link"

              >

                {t.account}

              </Link>



            </nav>

          </div>



          {/* Support */}

          <div>

            <h3 className="gf-column-title">

              {t.support}

            </h3>



            <nav className="gf-links">



              <Link

                href={`/${locale}/faq`}

                className="gf-link"

              >

                {t.faq}

              </Link>



              <Link

                href={`/${locale}/shipping`}

                className="gf-link"

              >

                {t.shipping}

              </Link>



              <Link

                href={`/${locale}/returns`}

                className="gf-link"

              >

                {t.returns}

              </Link>



              <Link

                href={`/${locale}/privacy`}

                className="gf-link"

              >

                {t.privacy}

              </Link>



            </nav>

          </div>



        </div>



        {/* Bottom */}

        <div className="gf-bottom">



          <div className="gf-copy">

            {t.rights}

          </div>



          <div className="gf-bottom-links">



            <Link

              href={`/${locale}/terms`}

              className="gf-bottom-link"

            >

              {t.terms}

            </Link>



            <a

              href="#"

              className="gf-back-top"

              onClick={(e) => {

                e.preventDefault();



                window.scrollTo({

                  top: 0,

                  behavior: "smooth",

                });

              }}

            >

              <span>{t.backTop}</span>

              <ArrowUpRight />

            </a>



          </div>



        </div>

      </footer>

    </>

  );

}