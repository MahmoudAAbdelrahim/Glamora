"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";

import {
  BASE_CSS,
  type Locale,
} from "../../../../lib/sharedids";

const SUCCESS_CSS = `
  .gc-success-page {
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
    --gc-success: #16803d;

    min-height: 100vh;
    background: #ffffff;
    color: var(--gc-text);
  }

  .gc-success-page *,
  .gc-success-page *::before,
  .gc-success-page *::after {
    box-sizing: border-box;
  }

  .gc-success-wrap {
    width: min(940px, calc(100% - 40px));
    margin: 0 auto;
    padding: 70px 0 100px;
  }

  .gc-success-card {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--gc-line);
    border-radius: 32px;
    padding: 48px 34px 42px;
    background: #ffffff;
    text-align: center;
    box-shadow: 0 24px 70px rgba(70, 20, 35, .08);
  }

  .gc-success-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(
      90deg,
      var(--gc-wine),
      var(--gc-pink),
      var(--gc-wine)
    );
  }

  .gc-success-icon {
    width: 96px;
    height: 96px;
    margin: 0 auto 25px;
    display: grid;
    place-items: center;
    border-radius: 30px;
    background: #edf9f1;
    color: var(--gc-success);
    box-shadow:
      0 14px 35px rgba(22, 128, 61, .10),
      inset 0 0 0 1px rgba(22, 128, 61, .08);
  }

  .gc-success-icon svg {
    color: var(--gc-success);
  }

  .gc-success-title {
    margin: 0;
    color: var(--gc-navy);
    font-size: clamp(30px, 5vw, 46px);
    line-height: 1.12;
    font-weight: 950;
    letter-spacing: -.8px;
  }

  .gc-success-description {
    max-width: 600px;
    margin: 15px auto 30px;
    color: var(--gc-muted);
    font-size: 14px;
    line-height: 1.9;
  }

  .gc-success-number {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    min-width: 180px;
    margin-bottom: 35px;
    padding: 14px 25px;
    border: 1px solid rgba(139, 21, 56, .10);
    border-radius: 17px;
    background: var(--gc-blush);
  }

  .gc-success-number span {
    color: var(--gc-muted);
    font-size: 12px;
    font-weight: 700;
  }

  .gc-success-number strong {
    color: var(--gc-wine);
    font-size: 19px;
    font-weight: 950;
    letter-spacing: .5px;
    word-break: break-all;
  }

  .gc-success-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .gc-success-action {
    min-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 22px 18px;
    border: 1px solid var(--gc-line);
    border-radius: 22px;
    background: #ffffff;
    color: var(--gc-text);
    text-decoration: none;
    transition:
      transform .22s ease,
      border-color .22s ease,
      box-shadow .22s ease,
      background .22s ease;
  }

  .gc-success-action:hover {
    transform: translateY(-5px);
    border-color: rgba(139, 21, 56, .25);
    background: #fffafb;
    box-shadow: 0 18px 38px rgba(70, 20, 35, .09);
  }

  .gc-success-action-icon {
    width: 52px;
    height: 52px;
    margin-bottom: 13px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      var(--gc-wine),
      var(--gc-wine-deep)
    );
    color: #ffffff;
    box-shadow: 0 9px 22px rgba(139, 21, 56, .18);
    transition: transform .22s ease;
  }

  .gc-success-action:hover .gc-success-action-icon {
    transform: translateY(-2px) scale(1.04);
  }

  .gc-success-action-icon svg {
    color: #ffffff;
  }

  .gc-success-action strong {
    color: var(--gc-navy);
    font-size: 15px;
    font-weight: 900;
  }

  .gc-success-action span {
    margin-top: 5px;
    color: var(--gc-muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .gc-continue-shopping {
    margin-top: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--gc-muted);
    font-size: 14px;
    font-weight: 850;
    text-decoration: none;
    transition:
      color .2s ease,
      transform .2s ease;
  }

  .gc-continue-shopping:hover {
    color: var(--gc-wine);
    transform: translateX(-2px);
  }

  [dir="rtl"] .gc-continue-shopping:hover {
    transform: translateX(2px);
  }

  @media (max-width: 760px) {
    .gc-success-wrap {
      width: min(100% - 28px, 600px);
      padding: 42px 0 70px;
    }

    .gc-success-card {
      padding: 36px 18px 30px;
      border-radius: 25px;
    }

    .gc-success-actions {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .gc-success-action {
      min-height: 112px;
      flex-direction: row;
      justify-content: flex-start;
      text-align: start;
      gap: 14px;
      padding: 16px;
    }

    .gc-success-action-icon {
      width: 48px;
      height: 48px;
      min-width: 48px;
      margin: 0;
    }

    .gc-success-action-content {
      min-width: 0;
    }
  }

  @media (max-width: 430px) {
    .gc-success-wrap {
      width: min(100% - 20px, 600px);
      padding-top: 28px;
    }

    .gc-success-card {
      padding: 32px 14px 27px;
      border-radius: 22px;
    }

    .gc-success-icon {
      width: 82px;
      height: 82px;
      border-radius: 25px;
    }

    .gc-success-title {
      font-size: 29px;
    }

    .gc-success-description {
      font-size: 13px;
    }

    .gc-success-number {
      width: 100%;
      margin-bottom: 27px;
    }

    .gc-success-action {
      min-height: 100px;
    }
  }
`;

export default function OrderSuccessPage() {
  const params = useParams();

  const locale = (
    params?.locale === "en" ? "en" : "ar"
  ) as Locale;

  const id = String(params?.id || "");
  const isAr = locale === "ar";

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const styles = (
    <style
      dangerouslySetInnerHTML={{
        __html: `${BASE_CSS}\n${SUCCESS_CSS}`,
      }}
    />
  );

  return (
    <>
      {styles}

      <main
        dir={isAr ? "rtl" : "ltr"}
        className="gc-success-page gl-page"
      >
        <div className="gc-success-wrap">
          <section className="gc-success-card">
            <div className="gc-success-icon">
              <CheckCircle2 size={56} />
            </div>

            <h1 className="gc-success-title">
              {isAr
                ? "تم إنشاء طلبك بنجاح"
                : "Order placed successfully"}
            </h1>

            <p className="gc-success-description">
              {isAr
                ? "تم تسجيل طلبك بنجاح. يمكنك الآن تحميل الفاتورة أو متابعة حالة الطلب أو فتح جميع طلباتك."
                : "Your order has been placed successfully. You can now view your invoice, track this order, or view all your orders."}
            </p>

            <div className="gc-success-number">
              <span>
                {isAr
                  ? "رقم الطلب"
                  : "Order ID"}
              </span>

              <strong>{id}</strong>
            </div>

            <div className="gc-success-actions">
              <Link
                href={`/${locale}/orders/${id}/invoice`}
                className="gc-success-action"
              >
                <div className="gc-success-action-icon">
                  <FileText size={23} />
                </div>

                <div className="gc-success-action-content">
                  <strong>
                    {isAr
                      ? "عرض الفاتورة"
                      : "View invoice"}
                  </strong>

                  <span>
                    {isAr
                      ? "عرض وحفظ الفاتورة"
                      : "View and save your invoice"}
                  </span>
                </div>
              </Link>

              <Link
                href={`/${locale}/orders/${id}/track`}
                className="gc-success-action"
              >
                <div className="gc-success-action-icon">
                  <PackageSearch size={23} />
                </div>

                <div className="gc-success-action-content">
                  <strong>
                    {isAr
                      ? "تتبع الطلب"
                      : "Track order"}
                  </strong>

                  <span>
                    {isAr
                      ? "اعرف حالة طلبك"
                      : "Check your order status"}
                  </span>
                </div>
              </Link>

              <Link
                href={`/${locale}/orders`}
                className="gc-success-action"
              >
                <div className="gc-success-action-icon">
                  <ShoppingBag size={23} />
                </div>

                <div className="gc-success-action-content">
                  <strong>
                    {isAr
                      ? "طلباتي"
                      : "My orders"}
                  </strong>

                  <span>
                    {isAr
                      ? "كل طلباتك السابقة"
                      : "All your previous orders"}
                  </span>
                </div>
              </Link>
            </div>

            <Link
              href={`/${locale}`}
              className="gc-continue-shopping"
            >
              <Arrow size={17} />

              {isAr
                ? "العودة للتسوق"
                : "Continue shopping"}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}