"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import {
  BASE_CSS,
  formatPrice,
  type Locale,
} from "../../../../../lib/sharedids";

type Order = {
  id: string;
  orderNumber: string;

  items: {
    productId: string;
    name: string;
    brand?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];

  shippingAddress: {
    fullName: string;
    phone: string;
    governorate: string;
    city: string;
    address: string;
    notes?: string;
  };

  subtotal: number;
  shipping: number;
  total: number;

  paymentMethod: string;
  status: string;

  createdAt: string;
};

const INVOICE_CSS = `
.invoice-page {
  --iv-wine: #8b1538;
  --iv-wine-deep: #6d0f2b;
  --iv-pink: #f4b6c2;
  --iv-blush: #fbe4e8;
  --iv-rose: #d6506f;
  --iv-navy: #17213c;
  --iv-text: #263044;
  --iv-muted: #81757b;
  --iv-line: #ead9de;
  --iv-soft: #faf6f7;

  min-height: 100vh;
  background: #fff !important;
  color: var(--iv-text);
}

.invoice-page *,
.invoice-page *::before,
.invoice-page *::after {
  box-sizing: border-box;
}

.invoice-container {
  width: min(950px, calc(100% - 40px));
  margin: 0 auto;
  padding: 34px 0 90px;
}

.invoice-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.invoice-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  min-height: 44px;
  padding: 0 14px;

  border: 1px solid var(--iv-line);
  border-radius: 11px;

  background: #fff;
  color: var(--iv-navy) !important;

  text-decoration: none;
  font-size: 13px;
  font-weight: 800;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.invoice-back:hover {
  color: var(--iv-wine) !important;
  background: #fff8f9;
  border-color: #dfb7c1;
  transform: translateY(-1px);
}

.invoice-print-btn {
  min-height: 44px;
  padding: 0 17px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: 1px solid var(--iv-wine) !important;
  border-radius: 11px;

  background: linear-gradient(
    135deg,
    var(--iv-wine),
    var(--iv-wine-deep)
  ) !important;

  color: #fff !important;

  font-family: inherit;
  font-size: 13px;
  font-weight: 850;

  cursor: pointer;

  box-shadow: 0 8px 20px rgba(139, 21, 56, 0.14);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.invoice-print-btn *,
.invoice-print-btn svg {
  color: #fff !important;
}

.invoice-print-btn:hover {
  color: #fff !important;

  background: linear-gradient(
    135deg,
    #a51d45,
    #74102f
  ) !important;

  transform: translateY(-2px);

  box-shadow: 0 12px 25px rgba(139, 21, 56, 0.22);
}

.invoice-card {
  background: #fff;
  border: 1px solid var(--iv-line);
  border-radius: 24px;
  padding: 38px;

  box-shadow: 0 16px 50px rgba(70, 20, 35, 0.06);
}

.invoice-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 30px;

  padding-bottom: 25px;

  border-bottom: 2px solid var(--iv-navy);
}

.invoice-brand-wrap {
  min-width: 0;
}

.invoice-brand {
  margin: 0;

  color: var(--iv-wine);

  font-size: 31px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.invoice-tagline {
  margin-top: 8px;

  color: var(--iv-muted);

  font-size: 12px;
  line-height: 1.6;
}

.invoice-title {
  text-align: end;
}

.invoice-title h1 {
  margin: 0;

  color: var(--iv-navy);

  font-size: 28px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: 0.03em;
}

.invoice-title p {
  margin: 9px 0 0;

  color: var(--iv-wine);

  font-size: 13px;
  font-weight: 850;
}

.invoice-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  padding: 24px 0;
}

.invoice-info-card {
  min-width: 0;

  padding: 17px;

  border: 1px solid #f0e2e6;
  border-radius: 15px;

  background: linear-gradient(
    145deg,
    #fff,
    #fff9fa
  );
}

.invoice-info-card h3 {
  margin: 0 0 11px;

  color: var(--iv-navy);

  font-size: 13px;
  font-weight: 900;
}

.invoice-info-row {
  display: flex;
  align-items: flex-start;
  gap: 7px;

  margin-top: 7px;

  color: var(--iv-muted);

  font-size: 12px;
  line-height: 1.65;
}

.invoice-info-row:first-of-type {
  margin-top: 0;
}

.invoice-info-row svg {
  flex: 0 0 auto;
  margin-top: 2px;

  color: var(--iv-wine);
}

.invoice-info-row span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.invoice-items {
  overflow-x: auto;

  margin-top: 4px;

  border: 1px solid var(--iv-line);
  border-radius: 16px;
}

.invoice-table {
  width: 100%;
  min-width: 620px;

  border-collapse: collapse;
}

.invoice-table th,
.invoice-table td {
  padding: 14px 15px;

  text-align: start;

  border-bottom: 1px solid var(--iv-line);
}

.invoice-table th {
  background: var(--iv-soft);

  color: var(--iv-muted);

  font-size: 11px;
  font-weight: 850;
  white-space: nowrap;
}

.invoice-table td {
  color: var(--iv-text);

  font-size: 13px;
}

.invoice-table tbody tr:last-child td {
  border-bottom: 0;
}

.invoice-product-name {
  color: var(--iv-navy);
  font-weight: 850;
  line-height: 1.5;
}

.invoice-product-brand {
  margin-top: 3px;

  color: var(--iv-muted);

  font-size: 11px;
}

.invoice-qty {
  color: var(--iv-navy);
  font-weight: 750;
}

.invoice-price {
  color: var(--iv-wine);
  font-weight: 900;
  white-space: nowrap;
}

.invoice-summary {
  width: min(360px, 100%);
  margin-inline-start: auto;
  margin-top: 25px;
}

.invoice-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 9px 0;

  color: var(--iv-muted);

  font-size: 13px;
}

.invoice-summary-row strong {
  color: var(--iv-navy);
  font-weight: 850;
}

.invoice-summary-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-top: 9px;
  padding-top: 16px;

  border-top: 1px solid var(--iv-line);

  color: var(--iv-navy);

  font-size: 16px;
  font-weight: 900;
}

.invoice-summary-total strong {
  color: var(--iv-wine);

  font-size: 21px;
  font-weight: 950;
}

.invoice-payment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-top: 22px;
  padding: 14px 16px;

  border: 1px solid #efd0d7;
  border-radius: 14px;

  background: var(--iv-blush);
}

.invoice-payment-label {
  color: var(--iv-muted);
  font-size: 12px;
}

.invoice-payment-value {
  color: var(--iv-wine);
  font-size: 13px;
  font-weight: 900;
}

.invoice-footer {
  margin-top: 38px;
  padding-top: 20px;

  border-top: 1px solid var(--iv-line);

  text-align: center;

  color: var(--iv-muted);

  font-size: 12px;
  line-height: 1.7;
}

.invoice-loading {
  min-height: 520px;

  display: grid;
  place-items: center;
}

.invoice-loading-icon {
  color: var(--iv-wine);
}

.invoice-empty {
  width: min(600px, calc(100% - 40px));
  margin: 0 auto;

  padding: 80px 20px;

  text-align: center;
}

.invoice-empty-icon {
  width: 76px;
  height: 76px;

  margin: 0 auto 20px;

  display: grid;
  place-items: center;

  border-radius: 20px;

  background: var(--iv-blush);
  color: var(--iv-wine);

  border: 1px solid #efd0d7;
}

.invoice-empty h1 {
  margin: 0 0 22px;

  color: var(--iv-navy);

  font-size: 26px;
  font-weight: 900;
}

.invoice-empty-btn {
  min-height: 46px;
  padding: 0 20px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--iv-wine) !important;
  border-radius: 11px;

  background: linear-gradient(
    135deg,
    var(--iv-wine),
    var(--iv-wine-deep)
  ) !important;

  color: #fff !important;

  text-decoration: none;
  font-size: 13px;
  font-weight: 850;
}

.invoice-empty-btn *,
.invoice-empty-btn svg {
  color: #fff !important;
}

@media (max-width: 800px) {
  .invoice-container {
    width: min(100% - 28px, 950px);
    padding: 28px 0 65px;
  }

  .invoice-card {
    padding: 25px;
    border-radius: 19px;
  }

  .invoice-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 620px) {
  .invoice-container {
    width: calc(100% - 20px);
    padding-top: 20px;
  }

  .invoice-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .invoice-back,
  .invoice-print-btn {
    width: 100%;
  }

  .invoice-card {
    padding: 18px 14px;
    border-radius: 16px;
  }

  .invoice-header {
    flex-direction: column;
    gap: 18px;
    padding-bottom: 20px;
  }

  .invoice-title {
    width: 100%;
    text-align: start;
  }

  .invoice-brand {
    font-size: 27px;
  }

  .invoice-title h1 {
    font-size: 24px;
  }

  .invoice-info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 18px 0;
  }

  .invoice-summary {
    width: 100%;
  }

  .invoice-payment {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
}

@media print {
  @page {
    margin: 12mm;
  }

  html,
  body {
    background: #fff !important;
  }

  header,
  nav,
  footer {
    display: none !important;
  }

  .invoice-page {
    min-height: auto !important;
    background: #fff !important;
  }

  .invoice-container {
    width: 100%;
    max-width: none;
    padding: 0;
  }

  .invoice-toolbar {
    display: none !important;
  }

  .invoice-card {
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .invoice-info-card {
    break-inside: avoid;
  }

  .invoice-items {
    overflow: visible;
  }

  .invoice-table {
    min-width: 0;
  }

  .invoice-footer {
    margin-top: 25px;
  }
}
`;

export default function InvoicePage() {
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
            `/${locale}/login?redirect=/${locale}/orders/${id}/invoice`
          );

          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data?.message || "Invoice unavailable"
          );
        }

        setOrder(data.data.order);
      } catch (err) {
        console.error(err);

        setError(
          isAr
            ? "تعذر تحميل الفاتورة."
            : "Unable to load invoice."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id, locale, router, isAr]);

  function printInvoice() {
    window.print();
  }

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  if (loading) {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `${BASE_CSS}\n${INVOICE_CSS}`,
          }}
        />

        <main
          className="gl-page invoice-page"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="invoice-loading">
            <Loader2
              size={40}
              className="gl-spin invoice-loading-icon"
            />
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `${BASE_CSS}\n${INVOICE_CSS}`,
          }}
        />

        <main
          className="gl-page invoice-page"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="invoice-empty">
            <div className="invoice-empty-icon">
              <FileText size={42} />
            </div>

            <h1>
              {error ||
                (isAr
                  ? "الفاتورة غير متاحة"
                  : "Invoice unavailable")}
            </h1>

            <Link
              href={`/${locale}/orders`}
              className="invoice-empty-btn"
            >
              {isAr ? "أوردراتي" : "My orders"}
            </Link>
          </div>
        </main>
      </>
    );
  }

  const date = new Intl.DateTimeFormat(
    isAr ? "ar-EG" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(order.createdAt));

  const paymentText =
    order.paymentMethod === "cash_on_delivery"
      ? isAr
        ? "الدفع عند الاستلام"
        : "Cash on delivery"
      : order.paymentMethod;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `${BASE_CSS}\n${INVOICE_CSS}`,
        }}
      />

      <main
        className="gl-page invoice-page"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="invoice-container">
          <div className="invoice-toolbar">
            <Link
              href={`/${locale}/orders/${id}`}
              className="invoice-back"
            >
              <Arrow size={17} />

              {isAr
                ? "العودة للطلب"
                : "Back to order"}
            </Link>

            <button
              type="button"
              className="invoice-print-btn"
              onClick={printInvoice}
            >
              <Download size={17} />

              {isAr
                ? "طباعة / حفظ الفاتورة"
                : "Print / Save invoice"}
            </button>
          </div>

          <section className="invoice-card">
            <div className="invoice-header">
              <div className="invoice-brand-wrap">
                <div className="invoice-brand">
                  Glamora
                </div>

                <div className="invoice-tagline">
                  {isAr
                    ? "الجمال يبدأ من هنا"
                    : "Beauty starts here"}
                </div>
              </div>

              <div className="invoice-title">
                <h1>
                  {isAr ? "فاتورة" : "INVOICE"}
                </h1>

                <p>{order.orderNumber}</p>
              </div>
            </div>

            <div className="invoice-info-grid">
              <div className="invoice-info-card">
                <h3>
                  {isAr
                    ? "بيانات العميل"
                    : "Customer"}
                </h3>

                <div className="invoice-info-row">
                  <User size={14} />

                  <span>
                    {order.shippingAddress.fullName}
                  </span>
                </div>

                <div className="invoice-info-row">
                  <Phone size={14} />

                  <span>
                    {order.shippingAddress.phone}
                  </span>
                </div>
              </div>

              <div className="invoice-info-card">
                <h3>
                  {isAr
                    ? "بيانات الطلب"
                    : "Order information"}
                </h3>

                <div className="invoice-info-row">
                  <FileText size={14} />

                  <span>
                    {isAr
                      ? `رقم الطلب: ${order.orderNumber}`
                      : `Order: ${order.orderNumber}`}
                  </span>
                </div>

                <div className="invoice-info-row">
                  <span>{date}</span>
                </div>

                <div className="invoice-info-row">
                  <span>
                    {isAr
                      ? `الدفع: ${paymentText}`
                      : `Payment: ${paymentText}`}
                  </span>
                </div>
              </div>

              <div className="invoice-info-card">
                <h3>
                  {isAr
                    ? "عنوان التوصيل"
                    : "Delivery address"}
                </h3>

                <div className="invoice-info-row">
                  <MapPin size={14} />

                  <span>
                    {order.shippingAddress.governorate}
                    {" - "}
                    {order.shippingAddress.city}
                  </span>
                </div>

                <div className="invoice-info-row">
                  <span>
                    {order.shippingAddress.address}
                  </span>
                </div>

                {order.shippingAddress.notes && (
                  <div className="invoice-info-row">
                    <span>
                      {order.shippingAddress.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-items">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>
                      {isAr ? "المنتج" : "Product"}
                    </th>

                    <th>
                      {isAr ? "الكمية" : "Qty"}
                    </th>

                    <th>
                      {isAr ? "السعر" : "Price"}
                    </th>

                    <th>
                      {isAr ? "الإجمالي" : "Total"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <div className="invoice-product-name">
                          {item.name}
                        </div>

                        {item.brand && (
                          <div className="invoice-product-brand">
                            {item.brand}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="invoice-qty">
                          {item.quantity}
                        </span>
                      </td>

                      <td>
                        <span className="invoice-price">
                          {formatPrice(
                            item.unitPrice,
                            locale
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="invoice-price">
                          {formatPrice(
                            item.lineTotal,
                            locale
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-summary">
              <div className="invoice-summary-row">
                <span>
                  {isAr
                    ? "الإجمالي الفرعي"
                    : "Subtotal"}
                </span>

                <strong>
                  {formatPrice(
                    order.subtotal,
                    locale
                  )}
                </strong>
              </div>

              <div className="invoice-summary-row">
                <span>
                  {isAr ? "الشحن" : "Shipping"}
                </span>

                <strong>
                  {formatPrice(
                    order.shipping,
                    locale
                  )}
                </strong>
              </div>

              <div className="invoice-summary-total">
                <span>
                  {isAr ? "الإجمالي" : "Total"}
                </span>

                <strong>
                  {formatPrice(
                    order.total,
                    locale
                  )}
                </strong>
              </div>
            </div>

            <div className="invoice-payment">
              <span className="invoice-payment-label">
                {isAr
                  ? "طريقة الدفع"
                  : "Payment method"}
              </span>

              <span className="invoice-payment-value">
                {paymentText}
              </span>
            </div>

            <div className="invoice-footer">
              {isAr
                ? "شكرًا لاختيارك Glamora."
                : "Thank you for choosing Glamora."}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}