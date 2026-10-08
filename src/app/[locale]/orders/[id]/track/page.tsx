"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Package,
  PackageSearch,
  Truck,
  XCircle,
} from "lucide-react";

import {
  BASE_CSS,
  type Locale,
} from "../../../../../lib/sharedids";

type HistoryItem = {
  status: string;
  note?: string;
  createdAt: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  statusHistory: HistoryItem[];
  createdAt: string;
};

const STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_TEXT: Record<
  string,
  { ar: string; en: string }
> = {
  pending: {
    ar: "تم استلام الطلب",
    en: "Order received",
  },
  confirmed: {
    ar: "تم تأكيد الطلب",
    en: "Order confirmed",
  },
  processing: {
    ar: "جاري تجهيز الطلب",
    en: "Preparing order",
  },
  shipped: {
    ar: "الطلب في الطريق",
    en: "Order shipped",
  },
  delivered: {
    ar: "تم تسليم الطلب",
    en: "Order delivered",
  },
  cancelled: {
    ar: "تم إلغاء الطلب",
    en: "Order cancelled",
  },
};

const TRACK_CSS = `
.track-page {
  --tr-wine: #8b1538;
  --tr-wine-deep: #6d0f2b;
  --tr-pink: #f4b6c2;
  --tr-blush: #fbe4e8;
  --tr-rose: #d6506f;
  --tr-navy: #17213c;
  --tr-text: #263044;
  --tr-muted: #81757b;
  --tr-line: #ead9de;
  --tr-soft: #faf6f7;

  min-height: 100vh;
  background: #fff !important;
  color: var(--tr-text);
}

.track-page *,
.track-page *::before,
.track-page *::after {
  box-sizing: border-box;
}

.track-wrap {
  width: min(920px, calc(100% - 40px));
  margin: 0 auto;
  padding: 42px 0 90px;
}

.track-head {
  text-align: center;
  margin-bottom: 28px;
}

.track-head h1 {
  margin: 0;
  color: var(--tr-navy);
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.track-head p {
  margin: 10px 0 0;
  color: var(--tr-muted);
  font-size: 14px;
  line-height: 1.7;
}

.track-card {
  background: #fff;
  border: 1px solid var(--tr-line);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 14px 45px rgba(70, 20, 35, 0.06);
}

.tracking-number {
  text-align: center;
  padding: 4px 0 25px;
  border-bottom: 1px solid var(--tr-line);
}

.tracking-number span {
  display: block;
  color: var(--tr-muted);
  font-size: 12px;
  margin-bottom: 6px;
}

.tracking-number strong {
  display: block;
  color: var(--tr-wine);
  font-size: 21px;
  font-weight: 900;
  letter-spacing: 0.01em;
}

.timeline {
  padding: 28px 8px 4px;
}

.timeline-step {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 16px;
  min-height: 105px;
}

.timeline-step:last-child {
  min-height: auto;
}

.timeline-line {
  position: absolute;
  top: 54px;
  bottom: -3px;
  inset-inline-start: 27px;
  width: 2px;
  background: var(--tr-line);
}

.timeline-dot {
  position: relative;
  z-index: 2;

  width: 54px;
  height: 54px;

  display: grid;
  place-items: center;

  border-radius: 17px;
  background: #f7f3f4;
  color: #9b8d92;

  border: 1px solid #eee3e6;

  transition:
    background 0.25s ease,
    color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.timeline-dot.active {
  background: linear-gradient(
    135deg,
    var(--tr-wine),
    var(--tr-wine-deep)
  );

  color: #fff;

  border-color: transparent;

  box-shadow:
    0 8px 20px rgba(139, 21, 56, 0.2),
    0 0 0 5px rgba(244, 182, 194, 0.2);
}

.timeline-content {
  padding: 4px 0 25px;
}

.timeline-content strong {
  display: block;
  color: var(--tr-navy);
  font-size: 15px;
  line-height: 1.5;
  font-weight: 850;
}

.timeline-content span {
  display: block;
  margin-top: 6px;
  color: var(--tr-muted);
  font-size: 12px;
  line-height: 1.7;
}

.timeline-content span + span {
  color: #9a7f88;
}

.cancelled-box {
  margin-top: 26px;

  display: flex;
  align-items: flex-start;
  gap: 13px;

  padding: 17px;

  background: #fff5f6;
  color: #8f2037;

  border: 1px solid #f0cdd5;
  border-radius: 17px;
}

.cancelled-box-icon {
  width: 40px;
  height: 40px;

  flex: 0 0 auto;

  display: grid;
  place-items: center;

  border-radius: 12px;
  background: #fbe4e8;
  color: #a51d45;
}

.cancelled-box strong {
  display: block;
  color: #8f2037;
  font-size: 14px;
  font-weight: 900;
}

.cancelled-box p {
  margin: 5px 0 0;
  color: #a65b6c;
  font-size: 13px;
  line-height: 1.7;
}

.track-actions {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 10px;

  margin-top: 28px;
  padding-top: 24px;

  border-top: 1px solid var(--tr-line);
}

.track-secondary,
.track-primary {
  min-height: 46px;
  padding: 0 19px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 12px;

  text-decoration: none;

  font-size: 13px;
  font-weight: 850;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.track-secondary {
  color: var(--tr-navy) !important;
  background: #fff;
  border: 1px solid var(--tr-line);
}

.track-secondary:hover {
  color: var(--tr-wine) !important;
  background: #fff8f9;
  border-color: #dfb7c1;
  transform: translateY(-1px);
}

.track-primary {
  color: #fff !important;
  background: linear-gradient(
    135deg,
    var(--tr-wine),
    var(--tr-wine-deep)
  ) !important;

  border: 1px solid var(--tr-wine) !important;

  box-shadow: 0 8px 20px rgba(139, 21, 56, 0.15);
}

.track-primary *,
.track-primary svg {
  color: #fff !important;
}

.track-primary:hover {
  color: #fff !important;

  background: linear-gradient(
    135deg,
    #a51d45,
    #74102f
  ) !important;

  transform: translateY(-2px);

  box-shadow: 0 12px 25px rgba(139, 21, 56, 0.22);
}

.track-empty {
  width: min(600px, calc(100% - 40px));
  margin: 0 auto;

  padding: 80px 20px;

  text-align: center;
}

.track-empty-icon {
  width: 76px;
  height: 76px;

  margin: 0 auto 20px;

  display: grid;
  place-items: center;

  border-radius: 20px;

  background: var(--tr-blush);
  color: var(--tr-wine);

  border: 1px solid #efd0d7;
}

.track-empty h1 {
  margin: 0 0 22px;

  color: var(--tr-navy);

  font-size: 26px;
  font-weight: 900;
}

.track-empty .track-primary {
  display: inline-flex;
}

.track-loading {
  min-height: 520px;

  display: grid;
  place-items: center;
}

.track-loading-icon {
  color: var(--tr-wine);
}

@media (max-width: 700px) {
  .track-wrap {
    width: min(100% - 28px, 920px);
    padding: 28px 0 65px;
  }

  .track-card {
    padding: 20px;
    border-radius: 18px;
  }

  .timeline {
    padding-inline: 0;
  }

  .timeline-step {
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 13px;
    min-height: 105px;
  }

  .timeline-dot {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .timeline-line {
    inset-inline-start: 23px;
    top: 48px;
  }

  .timeline-content {
    padding-bottom: 24px;
  }

  .timeline-content strong {
    font-size: 14px;
  }

  .track-actions {
    flex-direction: column;
  }

  .track-secondary,
  .track-primary {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .track-wrap {
    width: calc(100% - 20px);
    padding-top: 22px;
  }

  .track-card {
    padding: 16px;
  }

  .track-head h1 {
    font-size: 27px;
  }

  .tracking-number strong {
    font-size: 18px;
  }

  .timeline-step {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 11px;
  }

  .timeline-dot {
    width: 44px;
    height: 44px;
  }

  .timeline-line {
    inset-inline-start: 21px;
    top: 44px;
  }

  .timeline-content strong {
    font-size: 13px;
  }

  .timeline-content span {
    font-size: 11px;
  }

  .cancelled-box {
    padding: 13px;
  }
}
`;

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (
    params?.locale === "en" ? "en" : "ar"
  ) as Locale;

  const id = String(params?.id || "");

  const isAr = locale === "ar";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          router.push(
            `/${locale}/login?redirect=/${locale}/orders/${id}/track`
          );
          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data?.message || "Order not found"
          );
        }

        setOrder(data.data.order);
      } catch (err) {
        console.error(err);

        setError(
          isAr
            ? "تعذر تحميل بيانات التتبع."
            : "Unable to load tracking information."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id, locale, router, isAr]);

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(
      isAr ? "ar-EG" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(value));
  }

  function stepIcon(status: string) {
    if (status === "pending") {
      return <Clock3 size={20} />;
    }

    if (status === "confirmed") {
      return <Check size={20} />;
    }

    if (status === "processing") {
      return <Package size={20} />;
    }

    if (status === "shipped") {
      return <Truck size={20} />;
    }

    return <CheckCircle2 size={20} />;
  }

  if (loading) {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `${BASE_CSS}\n${TRACK_CSS}`,
          }}
        />

        <main
          className="gl-page track-page"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="track-loading">
            <Loader2
              size={40}
              className="gl-spin track-loading-icon"
            />
          </div>
        </main>
      </>
    );
  }

  if (!order || error) {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `${BASE_CSS}\n${TRACK_CSS}`,
          }}
        />

        <main
          className="gl-page track-page"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="track-empty">
            <div className="track-empty-icon">
              <PackageSearch size={42} />
            </div>

            <h1>
              {error ||
                (isAr
                  ? "الطلب غير موجود"
                  : "Order not found")}
            </h1>

            <Link
              href={`/${locale}/orders`}
              className="track-primary"
            >
              {isAr ? "أوردراتي" : "My orders"}
            </Link>
          </div>
        </main>
      </>
    );
  }

  const cancelled = order.status === "cancelled";

  const currentIndex = STEPS.indexOf(order.status);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `${BASE_CSS}\n${TRACK_CSS}`,
        }}
      />

      <main
        className="gl-page track-page"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="track-wrap">
          <header className="track-head">
            <h1>
              {isAr
                ? "تتبع طلبك"
                : "Track your order"}
            </h1>

            <p>
              {isAr
                ? "تابع حالة طلبك خطوة بخطوة."
                : "Follow your order status step by step."}
            </p>
          </header>

          <section className="track-card">
            <div className="tracking-number">
              <span>
                {isAr ? "رقم الطلب" : "Order number"}
              </span>

              <strong>{order.orderNumber}</strong>
            </div>

            {cancelled ? (
              <div className="cancelled-box">
                <div className="cancelled-box-icon">
                  <XCircle size={21} />
                </div>

                <div>
                  <strong>
                    {isAr
                      ? "تم إلغاء هذا الطلب"
                      : "This order has been cancelled"}
                  </strong>

                  <p>
                    {isAr
                      ? "تم إلغاء الطلب ولا توجد خطوات توصيل إضافية."
                      : "This order was cancelled and will not proceed to delivery."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="timeline">
                {STEPS.map((status, index) => {
                  const history =
                    order.statusHistory?.find(
                      (item) => item.status === status
                    );

                  const active =
                    currentIndex >= index;

                  const text =
                    STATUS_TEXT[status];

                  return (
                    <div
                      className="timeline-step"
                      key={status}
                    >
                      {index < STEPS.length - 1 && (
                        <div className="timeline-line" />
                      )}

                      <div
                        className={
                          "timeline-dot" +
                          (active ? " active" : "")
                        }
                      >
                        {stepIcon(status)}
                      </div>

                      <div className="timeline-content">
                        <strong>
                          {isAr ? text.ar : text.en}
                        </strong>

                        {history ? (
                          <>
                            <span>
                              {history.note ||
                                (isAr
                                  ? "تم تحديث حالة الطلب."
                                  : "Order status updated.")}
                            </span>

                            <span>
                              {formatDate(
                                history.createdAt
                              )}
                            </span>
                          </>
                        ) : (
                          <span>
                            {isAr
                              ? "في انتظار هذه الخطوة."
                              : "Waiting for this step."}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="track-actions">
              <Link
                href={`/${locale}/orders/${id}`}
                className="track-secondary"
              >
                <Arrow size={16} />

                {isAr
                  ? "تفاصيل الطلب"
                  : "Order details"}
              </Link>

              <Link
                href={`/${locale}/orders/${id}/invoice`}
                className="track-primary"
              >
                <FileText size={16} />

                {isAr ? "الفاتورة" : "Invoice"}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}