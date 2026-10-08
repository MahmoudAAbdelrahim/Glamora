"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  MapPin,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  BASE_CSS,
  REFRESH_EVENT,
  SUMMARY_CSS,
  SummaryPanel,
  useCart,
  type Locale,
} from "../../../lib/sharedids";

type Form = {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  notes: string;
};

const GOVS: [string, string][] = [
  ["Cairo", "القاهرة"],
  ["Giza", "الجيزة"],
  ["Alexandria", "الإسكندرية"],
  ["Qalyubia", "القليوبية"],
  ["Sharqia", "الشرقية"],
  ["Dakahlia", "الدقهلية"],
  ["Gharbia", "الغربية"],
  ["Monufia", "المنوفية"],
  ["Beheira", "البحيرة"],
  ["Kafr El Sheikh", "كفر الشيخ"],
  ["Damietta", "دمياط"],
  ["Port Said", "بورسعيد"],
  ["Ismailia", "الإسماعيلية"],
  ["Suez", "السويس"],
  ["North Sinai", "شمال سيناء"],
  ["South Sinai", "جنوب سيناء"],
  ["Fayoum", "الفيوم"],
  ["Beni Suef", "بني سويف"],
  ["Minya", "المنيا"],
  ["Asyut", "أسيوط"],
  ["Sohag", "سوهاج"],
  ["Qena", "قنا"],
  ["Luxor", "الأقصر"],
  ["Aswan", "أسوان"],
  ["Red Sea", "البحر الأحمر"],
  ["New Valley", "الوادي الجديد"],
  ["Matrouh", "مطروح"],
];

const emptyForm: Form = {
  fullName: "",
  phone: "",
  governorate: "",
  city: "",
  address: "",
  notes: "",
};

type ApiUser = {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  profileImage?: {
    url?: string;
  };
};

const CHECKOUT_CSS = `
  .gc-checkout-page {
    --gc-wine: #8b1538;
    --gc-wine-deep: #6d0f2b;
    --gc-pink: #f4b6c2;
    --gc-blush: #fbe4e8;
    --gc-rose: #d6506f;
    --gc-navy: #17213c;
    --gc-text: #263047;
    --gc-muted: #788196;
    --gc-line: #eadde1;
    --gc-soft: #fff8fa;
    --gc-danger: #b42318;

    min-height: 100vh;
    background: #ffffff;
    color: var(--gc-text);
  }

  .gc-checkout-page *,
  .gc-checkout-page *::before,
  .gc-checkout-page *::after {
    box-sizing: border-box;
  }

  .gc-checkout-wrap {
    width: min(1240px, calc(100% - 40px));
    margin: 0 auto;
    padding: 34px 0 90px;
  }

  .gc-checkout-hero {
    margin-bottom: 28px;
  }

  .gc-checkout-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--gc-muted);
    text-decoration: none;
    font-size: 14px;
    font-weight: 800;
    transition: color .2s ease, transform .2s ease;
  }

  .gc-checkout-back:hover {
    color: var(--gc-wine);
    transform: translateX(-2px);
  }

  [dir="rtl"] .gc-checkout-back:hover {
    transform: translateX(2px);
  }

  .gc-checkout-heading {
    margin: 18px 0 6px;
    color: var(--gc-navy);
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.1;
    font-weight: 950;
    letter-spacing: -.8px;
  }

  .gc-checkout-subtitle {
    margin: 0;
    color: var(--gc-muted);
    font-size: 14px;
    line-height: 1.8;
  }

  .gc-checkout-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    gap: 24px;
    align-items: start;
  }

  .gc-checkout-card {
    border: 1px solid var(--gc-line);
    border-radius: 28px;
    background: #ffffff;
    padding: 28px;
    box-shadow: 0 18px 55px rgba(70, 20, 35, .07);
  }

  .gc-checkout-title {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 22px;
  }

  .gc-checkout-title-icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    );
    color: #ffffff;
    box-shadow: 0 10px 22px rgba(139, 21, 56, .18);
  }

  .gc-checkout-title h2 {
    margin: 0;
    color: var(--gc-navy);
    font-size: 21px;
    line-height: 1.3;
    font-weight: 900;
  }

  .gc-checkout-title p {
    margin: 4px 0 0;
    color: var(--gc-muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .gc-account-note {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    padding: 13px 15px;
    border: 1px solid rgba(139, 21, 56, .10);
    border-radius: 15px;
    background: var(--gc-blush);
    color: var(--gc-wine-deep);
    font-size: 13px;
    font-weight: 750;
    line-height: 1.7;
  }

  .gc-account-note svg {
    flex: 0 0 auto;
  }

  .gc-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 17px;
  }

  .gc-field-full {
    grid-column: 1 / -1;
  }

  .gc-field label {
    display: block;
    margin-bottom: 8px;
    color: var(--gc-navy);
    font-size: 13px;
    font-weight: 850;
  }

  .gc-field input,
  .gc-field select,
  .gc-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--gc-line);
    border-radius: 14px;
    outline: none;
    background: #ffffff;
    color: var(--gc-text);
    padding: 13px 14px;
    font: inherit;
    font-size: 14px;
    line-height: 1.5;
    transition:
      border-color .2s ease,
      box-shadow .2s ease,
      background .2s ease;
  }

  .gc-field input,
  .gc-field select {
    min-height: 48px;
  }

  .gc-field textarea {
    min-height: 112px;
    resize: vertical;
  }

  .gc-field input::placeholder,
  .gc-field textarea::placeholder {
    color: #a6acb9;
  }

  .gc-field input:focus,
  .gc-field select:focus,
  .gc-field textarea:focus {
    border-color: var(--gc-wine);
    box-shadow: 0 0 0 4px rgba(139, 21, 56, .08);
  }

  .gc-field .gc-locked {
    background: #faf7f8;
    color: #6f7788;
    cursor: not-allowed;
  }

  .gc-field-error {
    margin-top: 6px;
    color: var(--gc-danger);
    font-size: 12px;
    font-weight: 750;
  }

  .gc-payment-box {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 17px;
    border: 1px solid rgba(139, 21, 56, .22);
    border-radius: 18px;
    background: linear-gradient(
      135deg,
      #fff8fa,
      #fbe4e8
    );
  }

  .gc-payment-icon {
    width: 46px;
    height: 46px;
    flex: 0 0 46px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    );
    color: #ffffff;
  }

  .gc-payment-content strong {
    display: block;
    margin-bottom: 3px;
    color: var(--gc-navy);
    font-size: 14px;
    font-weight: 900;
  }

  .gc-payment-content span {
    color: var(--gc-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .gc-error-box {
    margin-top: 18px;
    padding: 13px 15px;
    border: 1px solid #fecaca;
    border-radius: 14px;
    background: #fff5f5;
    color: #991b1b;
    font-size: 13px;
    font-weight: 750;
    line-height: 1.7;
  }

  .gc-checkout-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 25px;
  }

  .gc-edit-cart {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    color: var(--gc-muted);
    text-decoration: none;
    font-size: 14px;
    font-weight: 850;
    transition: color .2s ease;
  }

  .gc-edit-cart:hover {
    color: var(--gc-wine);
  }

  .gc-place-order {
    min-height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border: 0 !important;
    border-radius: 14px;
    padding: 0 22px;
    background: linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    ) !important;
    color: #ffffff !important;
    box-shadow: 0 12px 28px rgba(139, 21, 56, .22);
    font: inherit;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    transition:
      transform .2s ease,
      box-shadow .2s ease,
      opacity .2s ease;
  }

  .gc-place-order *,
  .gc-place-order svg {
    color: #ffffff !important;
  }

  .gc-place-order:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(139, 21, 56, .28);
  }

  .gc-place-order:active:not(:disabled) {
    transform: translateY(0);
  }

  .gc-place-order:disabled {
    opacity: .62;
    cursor: not-allowed;
    box-shadow: none;
  }

  .gc-empty-state,
  .gc-auth-state,
  .gc-loading-state {
    width: min(600px, calc(100% - 32px));
    margin: 0 auto;
    padding: 90px 0;
    text-align: center;
  }

  .gc-state-icon {
    width: 78px;
    height: 78px;
    margin: 0 auto 20px;
    display: grid;
    place-items: center;
    border-radius: 24px;
    background: linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    );
    color: #ffffff;
    box-shadow: 0 14px 30px rgba(139, 21, 56, .18);
  }

  .gc-state-icon svg {
    color: #ffffff;
  }

  .gc-state-title {
    margin: 0;
    color: var(--gc-navy);
    font-size: 30px;
    font-weight: 950;
  }

  .gc-state-text {
    max-width: 470px;
    margin: 12px auto 26px;
    color: var(--gc-muted);
    line-height: 1.8;
    font-size: 14px;
  }

  .gc-login-button,
  .gc-shopping-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 20px;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    );
    color: #ffffff !important;
    text-decoration: none;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 12px 26px rgba(139, 21, 56, .18);
  }

  .gc-login-button *,
  .gc-shopping-button * {
    color: #ffffff !important;
  }

  .gc-spin {
    animation: gc-checkout-spin .85s linear infinite;
  }

  @keyframes gc-checkout-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 980px) {
    .gc-checkout-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 650px) {
    .gc-checkout-wrap {
      width: min(100% - 28px, 600px);
      padding: 24px 0 65px;
    }

    .gc-checkout-card {
      padding: 19px;
      border-radius: 22px;
    }

    .gc-form-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .gc-field-full {
      grid-column: auto;
    }

    .gc-checkout-actions {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .gc-edit-cart,
    .gc-place-order {
      width: 100%;
    }

    .gc-place-order {
      min-height: 52px;
    }

    .gc-checkout-title h2 {
      font-size: 19px;
    }

    .gc-checkout-heading {
      font-size: 32px;
    }
  }

  @media (max-width: 430px) {
    .gc-checkout-wrap {
      width: min(100% - 22px, 600px);
    }

    .gc-checkout-card {
      padding: 16px;
    }

    .gc-checkout-title-icon {
      width: 44px;
      height: 44px;
      flex-basis: 44px;
    }

    .gc-account-note {
      align-items: flex-start;
    }

    .gc-payment-box {
      align-items: flex-start;
    }
  }
`;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (
    params?.locale === "en" ? "en" : "ar"
  ) as Locale;

  const isAr = locale === "ar";
  const cart = useCart();

  const [form, setForm] = useState<Form>(emptyForm);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setLoadingUser(true);

        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.status === 401) {
          if (!cancelled) {
            setAuthError(true);
          }
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || "Failed to load user"
          );
        }

        const user: ApiUser =
          data?.user ||
          data?.data?.user ||
          null;

        if (!user) {
          setAuthError(true);
          return;
        }

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            fullName: user.fullName || "",
            phone: user.phone || "",
            address:
              typeof user.address === "string"
                ? user.address
                : "",
            city: user.city || "",
          }));
        }
      } catch (error) {
        console.error(
          "LOAD CHECKOUT USER ERROR:",
          error
        );

        if (!cancelled) {
          setAuthError(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cart.needLogin) {
      setAuthError(true);
    }
  }, [cart.needLogin]);

  function updateField(
    field: keyof Form,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = isAr
        ? "الاسم مطلوب"
        : "Full name is required";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = isAr
        ? "رقم الهاتف مطلوب"
        : "Phone is required";
    }

    if (!form.governorate) {
      nextErrors.governorate = isAr
        ? "اختر المحافظة"
        : "Select governorate";
    }

    if (!form.city.trim()) {
      nextErrors.city = isAr
        ? "المدينة مطلوبة"
        : "City is required";
    }

    if (!form.address.trim()) {
      nextErrors.address = isAr
        ? "العنوان مطلوب"
        : "Address is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function placeOrder() {
    if (authError) {
      router.push(
        `/${locale}/login?redirect=/${locale}/checkout`
      );
      return;
    }

    if (!validate()) return;

    if (!cart.items.length) return;

    try {
      setSubmitting(true);
      setFailed(false);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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

      if (res.status === 401) {
        router.push(
          `/${locale}/login?redirect=/${locale}/checkout`
        );
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to create order"
        );
      }

      const order = data?.data?.order;

      if (!order?._id) {
        throw new Error(
          "Order created but order ID is missing."
        );
      }

      cart.clear();

      window.dispatchEvent(
        new Event(REFRESH_EVENT)
      );

      router.replace(
        `/${locale}/order-success/${order._id}`
      );
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  const BackIcon = isAr ? ArrowRight : ArrowLeft;
  const NextIcon = isAr ? ArrowLeft : ArrowRight;

  const style = (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          ${BASE_CSS}
          ${SUMMARY_CSS}
          ${CHECKOUT_CSS}
        `,
      }}
    />
  );

  if (loadingUser) {
    return (
      <>
        {style}

        <main
          dir={isAr ? "rtl" : "ltr"}
          className="gc-checkout-page gl-page"
        >
          <div className="gc-loading-state">
            <div className="gc-state-icon">
              <Loader2
                size={34}
                className="gc-spin"
              />
            </div>

            <p className="gc-state-text">
              {isAr
                ? "جاري تحميل بيانات حسابك..."
                : "Loading your account data..."}
            </p>
          </div>
        </main>
      </>
    );
  }

  if (authError) {
    return (
      <>
        {style}

        <main
          dir={isAr ? "rtl" : "ltr"}
          className="gc-checkout-page gl-page"
        >
          <div className="gc-auth-state">
            <div className="gc-state-icon">
              <Lock size={32} />
            </div>

            <h1 className="gc-state-title">
              {isAr
                ? "يجب تسجيل الدخول أولًا"
                : "Login required"}
            </h1>

            <p className="gc-state-text">
              {isAr
                ? "لا يمكن إتمام عملية الشراء قبل تسجيل الدخول إلى حسابك."
                : "You need to login before completing your order."}
            </p>

            <Link
              href={`/${locale}/login?redirect=/${locale}/checkout`}
              className="gc-login-button"
            >
              <User size={18} />

              {isAr
                ? "تسجيل الدخول"
                : "Login"}
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!cart.loading && !cart.items.length) {
    return (
      <>
        {style}

        <main
          dir={isAr ? "rtl" : "ltr"}
          className="gc-checkout-page gl-page"
        >
          <div className="gc-empty-state">
            <div className="gc-state-icon">
              <ShoppingBag size={40} />
            </div>

            <h1 className="gc-state-title">
              {isAr
                ? "السلة فارغة"
                : "Your cart is empty"}
            </h1>

            <Link
              href={`/${locale}`}
              className="gc-shopping-button"
              style={{ marginTop: 24 }}
            >
              {isAr
                ? "العودة للتسوق"
                : "Continue shopping"}
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {style}

      <main
        dir={isAr ? "rtl" : "ltr"}
        className="gc-checkout-page gl-page"
      >
        <div className="gc-checkout-wrap">
          <header className="gc-checkout-hero">
            <Link
              href={`/${locale}/cart`}
              className="gc-checkout-back"
            >
              <BackIcon size={18} />

              {isAr
                ? "العودة للسلة"
                : "Back to cart"}
            </Link>

            <h1 className="gc-checkout-heading">
              {isAr
                ? "إتمام الطلب"
                : "Checkout"}
            </h1>

            <p className="gc-checkout-subtitle">
              {isAr
                ? "بيانات حسابك تم تحميلها تلقائيًا."
                : "Your account information has been loaded automatically."}
            </p>
          </header>

          <div className="gc-checkout-grid">
            <section className="gc-checkout-card">
              <div className="gc-checkout-title">
                <div className="gc-checkout-title-icon">
                  <MapPin size={22} />
                </div>

                <div>
                  <h2>
                    {isAr
                      ? "بيانات التوصيل"
                      : "Delivery information"}
                  </h2>

                  <p>
                    {isAr
                      ? "بياناتك الأساسية مأخوذة من حسابك."
                      : "Your basic details come from your account."}
                  </p>
                </div>
              </div>

              <div className="gc-account-note">
                <Lock size={17} />

                <span>
                  {isAr
                    ? "الاسم ورقم الهاتف مأخوذان من الحساب المسجل."
                    : "Name and phone are taken from your registered account."}
                </span>
              </div>

              <div className="gc-form-grid">
                <div className="gc-field">
                  <label>
                    {isAr
                      ? "الاسم بالكامل"
                      : "Full name"}
                  </label>

                  <input
                    value={form.fullName}
                    readOnly
                    className="gc-locked"
                  />

                  {errors.fullName && (
                    <div className="gc-field-error">
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div className="gc-field">
                  <label>
                    {isAr
                      ? "رقم الهاتف"
                      : "Phone"}
                  </label>

                  <input
                    value={form.phone}
                    readOnly
                    className="gc-locked"
                  />

                  {errors.phone && (
                    <div className="gc-field-error">
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div className="gc-field">
                  <label>
                    {isAr
                      ? "المحافظة"
                      : "Governorate"}
                  </label>

                  <select
                    value={form.governorate}
                    onChange={(e) =>
                      updateField(
                        "governorate",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      {isAr
                        ? "اختر المحافظة"
                        : "Select governorate"}
                    </option>

                    {GOVS.map(([en, ar]) => (
                      <option
                        key={en}
                        value={en}
                      >
                        {isAr ? ar : en}
                      </option>
                    ))}
                  </select>

                  {errors.governorate && (
                    <div className="gc-field-error">
                      {errors.governorate}
                    </div>
                  )}
                </div>

                <div className="gc-field">
                  <label>
                    {isAr
                      ? "المدينة"
                      : "City"}
                  </label>

                  <input
                    value={form.city}
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder={
                      isAr
                        ? "اكتب المدينة"
                        : "Enter city"
                    }
                  />

                  {errors.city && (
                    <div className="gc-field-error">
                      {errors.city}
                    </div>
                  )}
                </div>

                <div className="gc-field gc-field-full">
                  <label>
                    {isAr
                      ? "العنوان بالتفصيل"
                      : "Full address"}
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      updateField(
                        "address",
                        e.target.value
                      )
                    }
                    placeholder={
                      isAr
                        ? "الشارع، رقم المنزل، الدور، الشقة..."
                        : "Street, building, floor, apartment..."
                    }
                  />

                  {errors.address && (
                    <div className="gc-field-error">
                      {errors.address}
                    </div>
                  )}
                </div>

                <div className="gc-field gc-field-full">
                  <label>
                    {isAr
                      ? "ملاحظات إضافية"
                      : "Additional notes"}
                  </label>

                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      updateField(
                        "notes",
                        e.target.value
                      )
                    }
                    placeholder={
                      isAr
                        ? "أي ملاحظات خاصة بالتوصيل..."
                        : "Any delivery notes..."
                    }
                  />
                </div>

                <div className="gc-field gc-field-full">
                  <label>
                    {isAr
                      ? "طريقة الدفع"
                      : "Payment method"}
                  </label>

                  <div className="gc-payment-box">
                    <div className="gc-payment-icon">
                      <ShoppingBag size={23} />
                    </div>

                    <div className="gc-payment-content">
                      <strong>
                        {isAr
                          ? "الدفع عند الاستلام"
                          : "Cash on delivery"}
                      </strong>

                      <span>
                        {isAr
                          ? "ادفع قيمة الطلب عند وصوله."
                          : "Pay when your order arrives."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {failed && (
                <div className="gc-error-box">
                  {isAr
                    ? "حدث خطأ أثناء إنشاء الطلب. حاول مرة أخرى."
                    : "Something went wrong while creating your order. Please try again."}
                </div>
              )}

              <div className="gc-checkout-actions">
                <Link
                  href={`/${locale}/cart`}
                  className="gc-edit-cart"
                >
                  <BackIcon size={18} />

                  {isAr
                    ? "تعديل السلة"
                    : "Edit cart"}
                </Link>

                <button
                  type="button"
                  className="gc-place-order"
                  onClick={placeOrder}
                  disabled={
                    submitting ||
                    cart.loading ||
                    !cart.items.length
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="gc-spin"
                      />

                      {isAr
                        ? "جاري إنشاء الطلب..."
                        : "Creating order..."}
                    </>
                  ) : (
                    <>
                      <Check size={18} />

                      {isAr
                        ? "تأكيد الطلب"
                        : "Place order"}

                      <NextIcon size={18} />
                    </>
                  )}
                </button>
              </div>
            </section>

            <aside>
              <SummaryPanel
                locale={locale}
                items={cart.items}
                subtotal={cart.subtotal}
                shipping={cart.shipping}
                total={cart.total}
              />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}