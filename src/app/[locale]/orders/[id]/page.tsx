"use client";

import Link from "next/link";



import { useEffect, useState } from "react";



import { useParams, useRouter } from "next/navigation";

import {



  FileText,



  Loader2,



  MapPin,



  Package,



  PackageSearch,



  User,



} from "lucide-react";

import {



  BASE_CSS,



  formatPrice,



  type Locale,



} from "../../../../lib/sharedids";

type Order = {



  id: string;



  orderNumber: string;

  items: {



    productId: string;



    name: string;



    brand?: string;



    image?: string;



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

const DETAILS_CSS = `
.details-page{
  --dp-wine:#8b1538;
  --dp-wine-deep:#6d0f2b;
  --dp-pink:#f4b6c2;
  --dp-blush:#fbe4e8;
  --dp-rose:#d6506f;
  --dp-navy:#17213c;
  --dp-text:#17213c;
  --dp-muted:#7b7075;
  --dp-line:#eadde1;
  min-height:100vh;
  background:#fff !important;
  color:var(--dp-text);
}
.details-page *{box-sizing:border-box}
.details-wrap{max-width:1180px;margin:0 auto;padding:34px 20px 80px}
.details-head{
  display:flex;align-items:flex-end;justify-content:space-between;gap:24px;
  margin-bottom:24px;
}
.details-head-main{min-width:0}
.details-kicker{
  display:inline-flex;align-items:center;gap:7px;
  color:var(--dp-wine);font-size:12px;font-weight:800;margin-bottom:8px;
}
.details-head h1{margin:0;color:var(--dp-navy);font-size:clamp(28px,4vw,40px);line-height:1.1;font-weight:900;letter-spacing:-.03em}
.details-head p{margin:9px 0 0;color:var(--dp-muted);font-size:13px}
.details-actions{display:flex;gap:9px;flex-shrink:0}
.small-action{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  min-height:42px;padding:0 15px;border:1px solid var(--dp-line);
  border-radius:12px;text-decoration:none;color:var(--dp-navy);
  background:#fff;font-size:12px;font-weight:800;transition:.2s ease;
}
.small-action:hover{border-color:#d6a8b4;color:var(--dp-wine);background:#fff7f8;transform:translateY(-1px)}
.status-strip{
  display:flex;align-items:center;justify-content:space-between;gap:15px;
  padding:15px 18px;margin-bottom:20px;border:1px solid var(--dp-line);
  border-radius:16px;background:#fffafb;
}
.status-label{font-size:12px;color:var(--dp-muted);font-weight:700}
.status-badge{
  display:inline-flex;align-items:center;justify-content:center;
  min-height:32px;padding:0 12px;border-radius:999px;
  background:var(--dp-blush);color:var(--dp-wine);
  border:1px solid #efd0d7;font-size:12px;font-weight:900;
}
.details-grid{display:grid;grid-template-columns:minmax(0,1fr) 350px;gap:20px;align-items:start}
.details-card{
  background:#fff;border:1px solid var(--dp-line);border-radius:20px;
  padding:22px;box-shadow:0 10px 30px rgba(70,20,35,.045);
}
.details-card + .details-card{margin-top:20px}
.details-card h2{margin:0 0 18px;color:var(--dp-navy);font-size:17px;font-weight:900}
.detail-item{
  display:grid;grid-template-columns:76px minmax(0,1fr);gap:15px;
  padding:15px 0;border-bottom:1px solid var(--dp-line);
}
.detail-item:last-child{border-bottom:0;padding-bottom:0}
.detail-img{
  width:76px;height:76px;border-radius:14px;overflow:hidden;
  background:linear-gradient(145deg,#fff4f6,#fbe4e8);
  border:1px solid #efdce1;display:grid;place-items:center;color:var(--dp-wine);
}
.detail-img img{width:100%;height:100%;object-fit:cover}
.detail-name{color:var(--dp-navy);font-weight:850;margin-bottom:5px;line-height:1.45}
.detail-brand{color:var(--dp-muted);font-size:12px}
.detail-meta{margin-top:9px;color:var(--dp-muted);font-size:12px}
.detail-price{margin-top:7px;color:var(--dp-wine);font-weight:900;font-size:15px}
.address-row{display:flex;gap:11px;margin-bottom:16px}
.address-row:last-child{margin-bottom:0}
.address-icon{
  width:38px;height:38px;flex:0 0 auto;border-radius:11px;
  background:var(--dp-blush);color:var(--dp-wine);display:grid;place-items:center;
  border:1px solid #efd0d7;
}
.address-row strong{display:block;margin-bottom:4px;color:var(--dp-navy);font-size:13px}
.address-row span{display:block;color:var(--dp-muted);font-size:13px;line-height:1.7}
.summary-row{
  display:flex;justify-content:space-between;gap:15px;padding:11px 0;
  color:var(--dp-muted);font-size:13px
}
.summary-row strong{color:var(--dp-navy)}
.summary-total{
  display:flex;justify-content:space-between;gap:15px;
  border-top:1px solid var(--dp-line);padding-top:16px;margin-top:8px;
  color:var(--dp-navy);font-weight:900
}
.summary-total strong{color:var(--dp-wine);font-size:21px}
.details-page .gl-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:46px;padding:0 20px;border:1px solid var(--dp-wine)!important;
  border-radius:12px;background:linear-gradient(135deg,var(--dp-wine),var(--dp-wine-deep))!important;
  color:#fff!important;font-weight:850;text-decoration:none;
  box-shadow:0 8px 20px rgba(139,21,56,.15);transition:.2s ease
}
.details-page .gl-btn:hover{color:#fff!important;transform:translateY(-2px);box-shadow:0 12px 25px rgba(139,21,56,.22)}
.details-page .gl-btn *{color:#fff!important}
.details-empty{max-width:600px;margin:0 auto;padding:90px 20px;text-align:center}
.details-empty h1{color:var(--dp-navy);margin:18px 0 20px;font-size:28px}
.details-empty-icon{
  width:76px;height:76px;margin:0 auto;display:grid;place-items:center;
  border-radius:20px;background:var(--dp-blush);color:var(--dp-wine);border:1px solid #efd0d7
}
.details-loading{min-height:520px;display:grid;place-items:center}
@media(max-width:850px){.details-grid{grid-template-columns:1fr}}
@media(max-width:650px){
  .details-wrap{padding:24px 14px 60px}
  .details-head{align-items:flex-start;flex-direction:column;margin-bottom:18px}
  .details-actions{width:100%}
  .small-action{flex:1;min-height:40px}
  .status-strip{align-items:flex-start;flex-direction:column}
  .details-card{padding:18px;border-radius:17px}
  .detail-item{grid-template-columns:64px minmax(0,1fr);gap:12px}
  .detail-img{width:64px;height:64px}
}
@media(max-width:390px){
  .details-actions{gap:7px}
  .small-action{padding:0 9px;font-size:11px}
}
`;


function getStatusLabel(status: string, isAr: boolean) {
  const key = status.toLowerCase();
  const labels: Record<string, [string, string]> = {
    pending: ["قيد المراجعة", "Pending"],
    confirmed: ["تم التأكيد", "Confirmed"],
    processing: ["جاري التجهيز", "Processing"],
    shipped: ["تم الشحن", "Shipped"],
    delivered: ["تم التسليم", "Delivered"],
    cancelled: ["ملغي", "Cancelled"],
  };
  return labels[key]?.[isAr ? 0 : 1] || status;
}

export default function OrderDetailsPage() {



  const params = useParams();



  const router = useRouter();

  const locale = (



    params?.locale === "en" ? "en" : "ar"



  ) as Locale;

  const id = String(



    params?.id || ""



  );

  const isAr = locale === "ar";

  const [order, setOrder] =



    useState<Order | null>(null);

  const [loading, setLoading] =



    useState(true);

  const [error, setError] =



    useState("");

  useEffect(() => {



    async function load() {



      try {



        const res = await fetch(



          `/api/orders/${id}`,



          {



            credentials: "include",



            cache: "no-store",



          }



        );

        if (res.status === 401) {



          router.push(



            `/${locale}/login?redirect=/${locale}/orders/${id}`



          );

          return;



        }

        const data = await res.json();

        if (!res.ok || !data.success) {



          throw new Error(



            data?.message ||



              "Order not found"



          );



        }

        setOrder(data.data.order);



      } catch (err) {



        console.error(err);

        setError(



          isAr



            ? "تعذر تحميل الطلب."



            : "Unable to load order."



        );



      } finally {



        setLoading(false);



      }



    }

    if (id) load();



  }, [id, locale, router, isAr]);

  if (loading) {



    return (



      <>
        <style dangerouslySetInnerHTML={{ __html: `${BASE_CSS}\n${DETAILS_CSS}` }} />

        <main



          dir={isAr ? "rtl" : "ltr"}



          className="gl-page details-page"



        >



          <div



            style={{



              minHeight: 500,



              display: "grid",



              placeItems: "center",



            }}



          >



            <Loader2



              size={38}



              className="gl-spin"



              color="var(--w)"



            />



          </div>



        </main>



      </>



    );



  }

  if (!order || error) {



    return (



      <>
        <style dangerouslySetInnerHTML={{ __html: `${BASE_CSS}\n${DETAILS_CSS}` }} />

        <main



          dir={isAr ? "rtl" : "ltr"}



          className="gl-page details-page"



        >



          <div



            style={{



              maxWidth: 600,



              margin: "0 auto",



              padding: "80px 20px",



              textAlign: "center",



            }}



          >



            <Package



              size={50}



              color="var(--w)"



            />

            <h1>



              {error ||



                (isAr



                  ? "الطلب غير موجود"



                  : "Order not found")}



            </h1>

            <Link



              href={`/${locale}/orders`}



              className="gl-btn"



            >



              {isAr



                ? "العودة لأوردراتي"



                : "Back to my orders"}



            </Link>



          </div>



        </main>



      </>



    );



  }

  return (



    <>
        <style dangerouslySetInnerHTML={{ __html: `${BASE_CSS}\n${DETAILS_CSS}` }} />

      <main



        dir={isAr ? "rtl" : "ltr"}



        className="gl-page details-page"



      >



        <div className="details-wrap">



          <div className="details-head">



            <div>



              <h1>



                {isAr



                  ? "تفاصيل الطلب"



                  : "Order details"}



              </h1>

              <p>



                {order.orderNumber}



              </p>



            </div>

            <div className="details-actions">



              <Link



                href={`/${locale}/orders/${id}/track`}



                className="small-action"



              >



                <PackageSearch size={16} />

                {isAr



                  ? "تتبع"



                  : "Track"}



              </Link>

              <Link



                href={`/${locale}/orders/${id}/invoice`}



                className="small-action"



              >



                <FileText size={16} />

                {isAr



                  ? "الفاتورة"



                  : "Invoice"}



              </Link>



            </div>



          </div>

          <div className="status-strip">
            <span className="status-label">
              {isAr ? "حالة الطلب" : "Order status"}
            </span>
            <span className="status-badge">
              {getStatusLabel(order.status, isAr)}
            </span>
          </div>

          <div className="details-grid">



            <section className="details-card">



              <h2>



                {isAr



                  ? "المنتجات"



                  : "Products"}



              </h2>

              {order.items.map(



                (item) => (



                  <div



                    className="detail-item"



                    key={item.productId}



                  >



                    <div className="detail-img">



                      {item.image && (



                        <img



                          src={item.image}



                          alt={item.name}



                        />



                      )}



                    </div>

                    <div>



                      <div className="detail-name">



                        {item.name}



                      </div>

                      {item.brand && (



                        <div className="detail-brand">



                          {item.brand}



                        </div>



                      )}

                      <div className="detail-meta">



                        {isAr



                          ? `الكمية: ${item.quantity}`



                          : `Quantity: ${item.quantity}`}



                      </div>

                      <div className="detail-price">



                        {formatPrice(item.lineTotal, locale)}



                      </div>



                    </div>



                  </div>



))}



            </section>

            <aside>



              <div



                className="details-card"



                style={{



                  marginBottom: 20,



                }}



              >



                <h2>



                  {isAr



                    ? "عنوان التوصيل"



                    : "Delivery address"}



                </h2>

                <div className="address-row">



                  <div className="address-icon">



                    <User size={17} />



                  </div>

                  <div>



                    <strong>



                      {order.shippingAddress.fullName}



                    </strong>

                    <span>



                      {order.shippingAddress.phone}



                    </span>



                  </div>



                </div>

                <div className="address-row">



                  <div className="address-icon">



                    <MapPin size={17} />



                  </div>

                  <div>



                    <strong>



                      {order.shippingAddress.governorate}



                      {" - "}



                      {order.shippingAddress.city}



                    </strong>

                    <span>



                      {order.shippingAddress.address}



                    </span>



                  </div>



                </div>

                {order.shippingAddress.notes && (



                  <div className="address-row">



                    <div className="address-icon">



                      <Package size={17} />



                    </div>

                    <div>



                      <strong>



                        {isAr



                          ? "ملاحظات"



                          : "Notes"}



                      </strong>

                      <span>



                        {order.shippingAddress.notes}



                      </span>



                    </div>



                  </div>



                )}



              </div>

              <div className="details-card">



                <h2>



                  {isAr



                    ? "ملخص الطلب"



                    : "Order summary"}



                </h2>

                <div className="summary-row">



                  <span>



                    {isAr



                      ? "المنتجات"



                      : "Subtotal"}



                  </span>

                  <strong>



                    {formatPrice(order.subtotal, locale)}



                  </strong>



                </div>

                <div className="summary-row">



                  <span>



                    {isAr



                      ? "الشحن"



                      : "Shipping"}



                  </span>

                  <strong>



                    {formatPrice(order.shipping, locale)}



                  </strong>



                </div>

                <div className="summary-row">
                  <span>
                    {isAr ? "طريقة الدفع" : "Payment"}
                  </span>
                  <strong>
                    {order.paymentMethod}
                  </strong>
                </div>

                <div className="summary-total">



                  <span>



                    {isAr



                      ? "الإجمالي"



                      : "Total"}



                  </span>

                  <strong>



                    {formatPrice(order.total, locale)}



                  </strong>



                </div>



              </div>



            </aside>



          </div>



        </div>



      </main>



    </>



  );



}