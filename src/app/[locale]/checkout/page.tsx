"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from "lucide-react";
import {
  BASE_CSS, LABELS, REFRESH_EVENT, SUMMARY_CSS, SummaryPanel, formatPrice, unitPrice, useCart,
  type Locale,
} from "../../../lib/sharedids";

const GOVS: [string, string][] = [
  ["Cairo", "القاهرة"], ["Giza", "الجيزة"], ["Alexandria", "الإسكندرية"], ["Qalyubia", "القليوبية"],
  ["Sharqia", "الشرقية"], ["Dakahlia", "الدقهلية"], ["Gharbia", "الغربية"], ["Monufia", "المنوفية"],
  ["Beheira", "البحيرة"], ["Kafr El Sheikh", "كفر الشيخ"], ["Damietta", "دمياط"], ["Port Said", "بورسعيد"],
  ["Ismailia", "الإسماعيلية"], ["Suez", "السويس"], ["North Sinai", "شمال سيناء"], ["South Sinai", "جنوب سيناء"],
  ["Fayoum", "الفيوم"], ["Beni Suef", "بني سويف"], ["Minya", "المنيا"], ["Asyut", "أسيوط"],
  ["Sohag", "سوهاج"], ["Qena", "قنا"], ["Luxor", "الأقصر"], ["Aswan", "أسوان"],
  ["Red Sea", "البحر الأحمر"], ["New Valley", "الوادي الجديد"], ["Matrouh", "مطروح"],
];

const T = {
  en: {
    title: "Checkout", delivery: "Delivery details", fullName: "Full name", phone: "Phone number",
    phoneHint: "Egyptian mobile, e.g. 01012345678", governorate: "Governorate", choose: "Choose governorate",
    city: "City / Area", address: "Street address", addressHint: "Street, building, floor, apartment",
    notes: "Order notes (optional)", place: "Place Order", placing: "Placing order...",
    required: "This field is required", badPhone: "Enter a valid Egyptian mobile number",
    back: "Back to cart", empty: "Your cart is empty", browse: "Browse Products",
    login: "Log in to place your order", loginBtn: "Log in", qty: "Qty",
    failed: "We couldn't place your order. Please try again.",
    doneTitle: "Order placed!", doneText: "Thank you. We'll call you to confirm your order, and you'll pay when it arrives.",
    orderNo: "Order number", continue: "Continue Shopping",
  },
  ar: {
    title: "إتمام الطلب", delivery: "بيانات التوصيل", fullName: "الاسم بالكامل", phone: "رقم الهاتف",
    phoneHint: "رقم موبايل مصري، مثال: 01012345678", governorate: "المحافظة", choose: "اختر المحافظة",
    city: "المدينة / المنطقة", address: "العنوان بالتفصيل", addressHint: "الشارع، رقم العمارة، الدور، الشقة",
    notes: "ملاحظات على الطلب (اختياري)", place: "تأكيد الطلب", placing: "جاري تأكيد الطلب...",
    required: "هذا الحقل مطلوب", badPhone: "اكتب رقم موبايل مصري صحيح",
    back: "العودة للسلة", empty: "السلة فارغة", browse: "تصفح المنتجات",
    login: "سجّل الدخول لإتمام طلبك", loginBtn: "تسجيل الدخول", qty: "الكمية",
    failed: "تعذر تأكيد الطلب. حاول مرة أخرى.",
    doneTitle: "تم تأكيد طلبك!", doneText: "شكرًا لك. هنتصل بيك لتأكيد الطلب، وهتدفع عند الاستلام.",
    orderNo: "رقم الطلب", continue: "متابعة التسوق",
  },
};

type Form = { fullName: string; phone: string; governorate: string; city: string; address: string; notes: string };
const emptyForm: Form = { fullName: "", phone: "", governorate: "", city: "", address: "", notes: "" };

export default function CheckoutPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";
  const t = T[locale];
  const egp = LABELS[locale].egp;
  const cart = useCart();
  const Back = isAr ? ArrowRight : ArrowLeft;

  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er: Partial<Record<keyof Form, string>> = {};
    (["fullName", "governorate", "city", "address"] as const).forEach((k) => {
      if (!form[k].trim()) er[k] = t.required;
    });
    if (!form.phone.trim()) er.phone = t.required;
    else if (!/^01[0125]\d{8}$/.test(form.phone.trim())) er.phone = t.badPhone;
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setFailed(false);
    try {
      // NOTE: adjust the URL / body to match your orders API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cod",
          shippingAddress: {
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            governorate: form.governorate,
            city: form.city.trim(),
            address: form.address.trim(),
            notes: form.notes.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      const order = data.data?.order ?? {};
      setOrderNumber(order.orderNumber ?? order.id ?? null);
      cart.clear();
      window.dispatchEvent(new Event(REFRESH_EVENT));
      setDone(true);
    } catch (e) {
      console.error(e);
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const state = (icon: React.ReactNode, title: string, text: string, href: string, cta: string) => (
    <div className="gk-state">
      {icon}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      <Link href={href} className="gs-btn" style={{ maxWidth: 260 }}>{cta}</Link>
    </div>
  );

  let body: React.ReactNode;

  if (done) {
    body = state(
      <span className="gk-ok"><Check size={34} strokeWidth={3} /></span>,
      t.doneTitle,
      `${t.doneText}${orderNumber ? ` ${t.orderNo}: ${orderNumber}` : ""}`,
      `/${locale}/products`,
      t.continue
    );
  } else if (cart.loading) {
    body = <div className="gk-skel" />;
  } else if (cart.needLogin) {
    body = state(<ShoppingBag size={38} />, t.login, "", `/${locale}/login?redirect=/${locale}/checkout`, t.loginBtn);
  } else if (cart.items.length === 0) {
    body = state(<ShoppingBag size={38} />, t.empty, "", `/${locale}/products`, t.browse);
  } else {
    const field = (key: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
      <label className={`gk-field ${errors[key] ? "bad" : ""}`}>
        <span>{label}</span>
        <input value={form[key]} onChange={set(key)} {...props} />
        {errors[key] && <em>{errors[key]}</em>}
      </label>
    );

    body = (
      <div className="gk-grid">
        <section className="gk-form">
          <h2>{t.delivery}</h2>

          <div className="gk-two">
            {field("fullName", t.fullName, { autoComplete: "name" })}
            {field("phone", t.phone, { type: "tel", inputMode: "tel", placeholder: "01xxxxxxxxx", autoComplete: "tel", dir: "ltr" })}
          </div>

          <div className="gk-two">
            <label className={`gk-field ${errors.governorate ? "bad" : ""}`}>
              <span>{t.governorate}</span>
              <select value={form.governorate} onChange={set("governorate")}>
                <option value="">{t.choose}</option>
                {GOVS.map(([en, ar]) => (
                  <option key={en} value={en}>{isAr ? ar : en}</option>
                ))}
              </select>
              {errors.governorate && <em>{errors.governorate}</em>}
            </label>
            {field("city", t.city, { autoComplete: "address-level2" })}
          </div>

          {field("address", t.address, { placeholder: t.addressHint, autoComplete: "street-address" })}

          <label className="gk-field">
            <span>{t.notes}</span>
            <textarea rows={3} value={form.notes} onChange={set("notes")} />
          </label>

          <Link href={`/${locale}/cart`} className="gk-back"><Back size={18} /> {t.back}</Link>
        </section>

        <SummaryPanel
          locale={locale}
          subtotal={cart.subtotal}
          shipping={cart.shipping}
          top={
            <ul className="gk-items">
              {cart.items.map((i) => (
                <li key={i.product.id}>
                  <span className="img">
                    {i.product.images?.[0]?.url && <img src={i.product.images[0].url} alt="" />}
                    <b>{i.quantity}</b>
                  </span>
                  <span className="n">{i.product.name}</span>
                  <span className="p">{formatPrice(unitPrice(i) * i.quantity, locale)} {egp}</span>
                </li>
              ))}
            </ul>
          }
          action={
            <>
              {failed && <p className="gk-fail" role="alert">{t.failed}</p>}
              <button type="button" className="gs-btn" onClick={placeOrder} disabled={submitting}>
                {submitting ? t.placing : t.place}
              </button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <main className="gl-store" dir={isAr ? "rtl" : "ltr"}>
      <style>{BASE_CSS + SUMMARY_CSS + CSS}</style>
      <div className="gk-wrap">
        {!done && <h1>{t.title}</h1>}
        {body}
      </div>
    </main>
  );
}

const CSS = `
.gk-wrap{max-width:1180px;margin:0 auto;padding:26px 24px 80px}
.gk-wrap h1{margin:0 0 26px;font-size:26px;font-weight:800}
.gk-grid{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:34px;align-items:start}
.gk-form h2{margin:0 0 20px;font-size:19px;font-weight:800}
.gk-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.gk-field{display:block;margin-bottom:18px}
.gk-field>span{display:block;margin-bottom:8px;font-size:14px;font-weight:700}
.gk-field input,.gk-field select,.gk-field textarea{width:100%;min-height:50px;padding:0 14px;border:1px solid var(--ln);border-radius:10px;background:var(--card);color:var(--ink);font:inherit;font-size:15px;outline:0;transition:border-color .2s,box-shadow .2s}
.gk-field textarea{padding:12px 14px;resize:vertical}
.gk-field select option{color:#2a1a1f}
.gk-field input:focus,.gk-field select:focus,.gk-field textarea:focus{border-color:var(--w);box-shadow:0 0 0 3px color-mix(in srgb,var(--w) 12%,transparent)}
.gk-field.bad input,.gk-field.bad select{border-color:#c33d4b}
.gk-field em{display:block;margin-top:6px;color:#c33d4b;font-size:12px;font-style:normal;font-weight:600}
.gk-back{display:inline-flex;align-items:center;gap:10px;margin-top:6px;color:var(--w);font-weight:800}
.gk-back:hover{text-decoration:underline}
.gk-items{list-style:none;margin:0 0 18px;padding:0 0 6px;display:grid;gap:12px;max-height:260px;overflow:auto}
.gk-items li{display:flex;align-items:center;gap:12px;font-size:14px}
.gk-items .img{position:relative;width:48px;height:48px;flex:0 0 48px;border-radius:9px;background:var(--soft);display:block}
.gk-items .img img{width:100%;height:100%;object-fit:cover;border-radius:9px}
.gk-items .img b{position:absolute;top:-6px;inset-inline-end:-6px;min-width:19px;height:19px;padding:0 4px;border-radius:10px;background:var(--w);color:#fff;font-size:11px;display:grid;place-items:center}
.gk-items .n{flex:1;min-width:0;font-weight:600;line-height:1.35}
.gk-items .p{font-weight:800;white-space:nowrap}
.gk-fail{margin:0 0 12px;padding:10px 12px;border-radius:8px;background:#fde8eb;color:#a8283a;font-size:13px;font-weight:700}
.gk-state{min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;color:var(--mu)}
.gk-state h2{margin:6px 0 0;color:var(--ink);font-size:24px}
.gk-state p{max-width:460px;margin:0 0 14px;line-height:1.8}
.gk-state svg{color:var(--w)}
.gk-state .gs-btn{text-decoration:none}
.gk-ok{width:76px;height:76px;border-radius:50%;background:var(--w);display:grid;place-items:center}
.gk-ok svg{color:#fff}
.gk-skel{height:420px;border-radius:14px;background:linear-gradient(90deg,var(--soft),var(--ln),var(--soft));background-size:200% 100%;animation:gksh 1.3s infinite}
@keyframes gksh{to{background-position:-200% 0}}
@media (max-width:960px){.gk-grid{grid-template-columns:1fr}}
@media (max-width:560px){.gk-wrap{padding:18px 14px 60px}.gk-two{grid-template-columns:1fr;gap:0}}
`;