"use client";



import Link from "next/link";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";



import {

  ArrowLeft,

  ArrowRight,

  CalendarDays,


  FileText,

  Loader2,

  Package,

  PackageSearch,

  ShoppingBag,

} from "lucide-react";



import {

  BASE_CSS,

  formatPrice,

  type Locale,

} from "../../../lib/sharedids";



type Order = {

  _id: string;

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



  subtotal: number;

  shipping: number;

  total: number;



  paymentMethod: string;

  status: string;



  createdAt: string;

};



const STATUS: Record<

  string,

  {

    ar: string;

    en: string;

    className: string;

  }

> = {

  pending: {

    ar: "قيد المراجعة",

    en: "Pending",

    className:

      "order-status pending",

  },



  confirmed: {

    ar: "تم تأكيد الطلب",

    en: "Confirmed",

    className:

      "order-status confirmed",

  },



  processing: {

    ar: "جاري التجهيز",

    en: "Processing",

    className:

      "order-status processing",

  },



  shipped: {

    ar: "تم الشحن",

    en: "Shipped",

    className:

      "order-status shipped",

  },



  delivered: {

    ar: "تم التسليم",

    en: "Delivered",

    className:

      "order-status delivered",

  },



  cancelled: {

    ar: "تم الإلغاء",

    en: "Cancelled",

    className:

      "order-status cancelled",

  },

};




const ORDERS_CSS = `
.gl-page{
  min-height:100vh;
  background:#fff !important;
  color:#17213c;
}

.orders-wrap{
  width:min(1200px,100%);
  margin:0 auto;
  padding:34px 24px 90px;
}

.orders-head{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:20px;
  margin-bottom:28px;
}

.orders-head h1{
  margin:0;
  color:#17213c;
  font-size:clamp(28px,4vw,40px);
  line-height:1.1;
  font-weight:900;
  letter-spacing:-.025em;
}

.orders-head p{
  margin:9px 0 0;
  color:#81757b;
  font-size:14px;
  line-height:1.7;
}

.orders-list{
  display:grid;
  gap:15px;
}

.order-card{
  position:relative;
  overflow:hidden;
  border:1px solid #ead9de;
  border-radius:18px;
  background:#fff;
  padding:20px;
  box-shadow:0 8px 28px rgba(23,33,60,.045);
  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.order-card::before{
  content:"";
  position:absolute;
  inset-inline-start:0;
  top:0;
  bottom:0;
  width:3px;
  background:linear-gradient(180deg,#8b1538,#f4b6c2);
  opacity:.8;
}

.order-card:hover{
  transform:translateY(-2px);
  border-color:#dfbcc6;
  box-shadow:0 14px 36px rgba(109,15,43,.08);
}

.order-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  padding-bottom:16px;
  border-bottom:1px solid #f0e1e5;
}

.order-number{
  display:flex;
  align-items:center;
  gap:11px;
  min-width:0;
}

.order-icon{
  width:46px;
  height:46px;
  flex:0 0 46px;
  border-radius:13px;
  background:linear-gradient(145deg,#fff0f3,#fbe4e8);
  color:#8b1538;
  border:1px solid #efd1d8;
  display:grid;
  place-items:center;
}

.order-number strong{
  display:block;
  color:#17213c;
  font-size:15px;
  font-weight:850;
}

.order-number span{
  display:flex;
  align-items:center;
  margin-top:5px;
  color:#81757b;
  font-size:12px;
}

.order-status{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:31px;
  padding:7px 12px;
  border-radius:999px;
  border:1px solid transparent;
  font-size:11px;
  font-weight:850;
  white-space:nowrap;
}

.pending{
  background:#fff4e9;
  color:#a84a12;
  border-color:#f3d4b8;
}

.confirmed{
  background:#eef3ff;
  color:#294c91;
  border-color:#d4def6;
}

.processing{
  background:#f7f0ff;
  color:#6d3b9c;
  border-color:#e3d4f3;
}

.shipped{
  background:#edf8fa;
  color:#176d7b;
  border-color:#cce7eb;
}

.delivered{
  background:#edf8f2;
  color:#21734a;
  border-color:#cce7d8;
}

.cancelled{
  background:#fff0f2;
  color:#a32945;
  border-color:#f0cbd3;
}

.order-products{
  display:flex;
  gap:10px;
  padding:18px 0;
  overflow-x:auto;
  scrollbar-width:thin;
}

.order-products::-webkit-scrollbar{
  height:5px;
}

.order-products::-webkit-scrollbar-thumb{
  background:#e5c8cf;
  border-radius:999px;
}

.order-product{
  width:68px;
  height:68px;
  flex:0 0 68px;
  overflow:hidden;
  border-radius:13px;
  background:#fff8fa;
  border:1px solid #ead9de;
  box-shadow:0 4px 12px rgba(23,33,60,.035);
}

.order-product img{
  width:100%;
  height:100%;
  display:block;
  object-fit:cover;
}

.order-product.no-image{
  display:grid;
  place-items:center;
  color:#8b1538;
  background:linear-gradient(145deg,#fff5f7,#fbe4e8);
}

.order-bottom{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
}

.order-total span{
  display:block;
  color:#81757b;
  font-size:12px;
  font-weight:600;
}

.order-total strong{
  display:block;
  margin-top:4px;
  color:#8b1538;
  font-size:19px;
  font-weight:900;
  letter-spacing:-.01em;
}

.order-actions{
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}

.order-action{
  min-height:40px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:0 13px;
  border-radius:10px;
  border:1px solid #dfcbd1;
  color:#17213c !important;
  text-decoration:none;
  font-size:12px;
  font-weight:850;
  background:#fff;
  transition:
    background .18s ease,
    color .18s ease,
    border-color .18s ease,
    transform .18s ease;
}

.order-action:hover{
  color:#8b1538 !important;
  background:#fff7f8;
  border-color:#dcaeb9;
  transform:translateY(-1px);
}

.order-action.primary{
  background:linear-gradient(135deg,#8b1538,#6d0f2b);
  color:#fff !important;
  border-color:#8b1538;
  box-shadow:0 7px 18px rgba(139,21,56,.15);
}

.order-action.primary:hover{
  background:linear-gradient(135deg,#a51d45,#74102f);
  color:#fff !important;
  border-color:#8b1538;
}

.order-action.primary *{
  color:#fff !important;
}

.orders-empty{
  min-height:350px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:60px 20px;
  border:1px dashed #e2cbd1;
  border-radius:20px;
  background:linear-gradient(145deg,#fff,#fff9fa);
}

.orders-empty h2{
  margin:0;
  color:#17213c;
  font-size:20px;
  font-weight:850;
}

.orders-empty p{
  margin:7px 0 0;
  color:#81757b;
  line-height:1.7;
}

.orders-empty-icon{
  width:72px;
  height:72px;
  border-radius:20px;
  background:linear-gradient(145deg,#fff0f3,#fbe4e8);
  color:#8b1538;
  border:1px solid #efd1d8;
  display:grid;
  place-items:center;
  margin:0 auto 17px;
}

/* Empty/loading CTA */
.gl-page .gl-btn{
  min-height:46px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0 21px;
  border:1px solid #8b1538 !important;
  border-radius:11px;
  background:linear-gradient(135deg,#8b1538,#6d0f2b) !important;
  color:#fff !important;
  font-size:13px;
  font-weight:850;
  text-decoration:none !important;
  box-shadow:0 8px 20px rgba(139,21,56,.16);
  transition:transform .18s ease,box-shadow .18s ease,background .18s ease;
}

.gl-page .gl-btn:hover{
  color:#fff !important;
  background:linear-gradient(135deg,#a51d45,#74102f) !important;
  transform:translateY(-2px);
  box-shadow:0 12px 26px rgba(139,21,56,.22);
}

.gl-spin{
  animation:orders-spin 1s linear infinite;
}

@keyframes orders-spin{
  to{transform:rotate(360deg)}
}

@media(max-width:700px){
  .orders-wrap{
    padding:24px 14px 65px;
  }

  .orders-head{
    align-items:flex-start;
    margin-bottom:21px;
  }

  .orders-head h1{
    font-size:28px;
  }

  .order-card{
    padding:16px;
    border-radius:16px;
  }

  .order-top,
  .order-bottom{
    align-items:flex-start;
    flex-direction:column;
  }

  .order-top{
    gap:12px;
  }

  .order-status{
    align-self:flex-start;
  }

  .order-actions{
    width:100%;
  }

  .order-action{
    flex:1 1 0;
    min-width:0;
    justify-content:center;
  }
}

@media(max-width:430px){
  .orders-wrap{
    padding-inline:11px;
  }

  .orders-head h1{
    font-size:24px;
  }

  .orders-head p{
    font-size:13px;
  }

  .order-card{
    padding:13px;
  }

  .order-icon{
    width:42px;
    height:42px;
    flex-basis:42px;
  }

  .order-number strong{
    font-size:14px;
  }

  .order-products{
    padding:15px 0;
  }

  .order-product{
    width:60px;
    height:60px;
    flex-basis:60px;
  }

  .order-actions{
    display:grid;
    grid-template-columns:1fr 1fr;
  }

  .order-action.primary{
    grid-column:1 / -1;
  }

  .orders-empty{
    min-height:320px;
    padding:45px 15px;
  }
}
`;

export default function OrdersPage() {

  const params = useParams();

  const router = useRouter();



  const locale = (

    params?.locale === "en" ? "en" : "ar"

  ) as Locale;



  const isAr = locale === "ar";



  const [orders, setOrders] =

    useState<Order[]>([]);



  const [loading, setLoading] =

    useState(true);



  const [error, setError] =

    useState("");



  useEffect(() => {

    async function loadOrders() {

      try {

        setLoading(true);

        setError("");



        const res = await fetch(

          "/api/orders",

          {

            credentials: "include",

            cache: "no-store",

          }

        );



        if (res.status === 401) {

          router.push(

            `/${locale}/login?redirect=/${locale}/orders`

          );



          return;

        }



        const data = await res.json();



        if (!res.ok || !data.success) {

          throw new Error(

            data?.message ||

              "Failed to load orders"

          );

        }



        setOrders(

          data?.data?.orders || []

        );

      } catch (err) {

        console.error(err);



        setError(

          isAr

            ? "تعذر تحميل الطلبات."

            : "Unable to load orders."

        );

      } finally {

        setLoading(false);

      }

    }



    loadOrders();

  }, [locale, router, isAr]);



  function formatDate(date: string) {

    return new Intl.DateTimeFormat(

      isAr ? "ar-EG" : "en-US",

      {

        dateStyle: "medium",

        timeStyle: "short",

      }

    ).format(new Date(date));

  }



  const Arrow = isAr

    ? ArrowLeft

    : ArrowRight;



  return (

    <>

      <style dangerouslySetInnerHTML={{ __html: `${BASE_CSS}
${ORDERS_CSS}` }} />



      <main

        dir={isAr ? "rtl" : "ltr"}

        className="gl-page"

      >

        <div className="orders-wrap">

          <div className="orders-head">

            <h1>

              {isAr

                ? "أوردراتي"

                : "My Orders"}

            </h1>



            <p>

              {isAr

                ? "تابع جميع طلباتك السابقة والحالية."

                : "View and track all your previous and current orders."}

            </p>

          </div>



          {loading ? (

            <div className="orders-empty">

              <Loader2

                size={36}

                className="gl-spin"

                color="var(--w)"

              />



              <p>

                {isAr

                  ? "جاري تحميل الطلبات..."

                  : "Loading orders..."}

              </p>

            </div>

          ) : error ? (

            <div className="orders-empty">

              <p>{error}</p>

            </div>

          ) : !orders.length ? (

            <div className="orders-empty">

              <div className="orders-empty-icon">

                <ShoppingBag size={30} />

              </div>



              <h2>

                {isAr

                  ? "لا توجد طلبات حتى الآن"

                  : "No orders yet"}

              </h2>



              <p

                style={{

                  color: "var(--mu)",

                }}

              >

                {isAr

                  ? "ابدأ التسوق وستظهر طلباتك هنا."

                  : "Start shopping and your orders will appear here."}

              </p>



              <Link

                href={`/${locale}`}

                className="gl-btn"

                style={{

                  marginTop: 15,

                }}

              >

                {isAr

                  ? "ابدأ التسوق"

                  : "Start shopping"}

              </Link>

            </div>

          ) : (

            <div className="orders-list">

              {orders.map((order) => {

                const status =

                  STATUS[order.status] ||

                  STATUS.pending;



                return (

                  <article

                    key={order.id}

                    className="order-card"

                  >

                    <div className="order-top">

                      <div className="order-number">

                        <div className="order-icon">

                          <Package size={21} />

                        </div>



                        <div>

                          <strong>

                            {order.orderNumber}

                          </strong>



                          <span>

                            <CalendarDays

                              size={12}

                              style={{

                                verticalAlign:

                                  "middle",

                                marginInlineEnd: 4,

                              }}

                            />



                            {formatDate(

                              order.createdAt

                            )}

                          </span>

                        </div>

                      </div>



                      <span

                        className={

                          status.className

                        }

                      >

                        {isAr

                          ? status.ar

                          : status.en}

                      </span>

                    </div>



                    <div className="order-products">

                      {order.items.map(

                        (item, index) => (

                          <div

                            className={

                              "order-product" +

                              (!item.image

                                ? " no-image"

                                : "")

                            }

                            key={

                              item.productId +

                              "-" +

                              index

                            }

                            title={

                              item.name

                            }

                          >

                            {item.image ? (

                              <img

                                src={item.image}

                                alt={item.name}

                              />

                            ) : (

                              <Package

                                size={23}

                              />

                            )}

                          </div>

                        )

                      )}

                    </div>



                    <div className="order-bottom">

                      <div className="order-total">

                        <span>

                          {isAr

                            ? "إجمالي الطلب"

                            : "Order total"}

                        </span>



                        <strong>

                          {formatPrice(order.total, locale)}

                        </strong>

                      </div>



                      <div className="order-actions">

                        <Link

                          href={`/${locale}/orders/${order.id}/track`}

                          className="order-action"

                        >

                          <PackageSearch

                            size={15}

                          />



                          {isAr

                            ? "تتبع"

                            : "Track"}

                        </Link>



                        <Link

                          href={`/${locale}/orders/${order.id}/invoice`}

                          className="order-action"

                        >

                          <FileText

                            size={15}

                          />



                          {isAr

                            ? "الفاتورة"

                            : "Invoice"}

                        </Link>



                        <Link

                          href={`/${locale}/orders/${order.id}`}

                          className="order-action primary"

                        >

                          {isAr

                            ? "التفاصيل"

                            : "Details"}



                          <Arrow size={15} />

                        </Link>

                      </div>

                    </div>

                  </article>

                );

              })}

            </div>

          )}

        </div>

      </main>

    </>

  );

}