"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

type Locale = "ar" | "en";

type DashboardData = {
  users: {
    total: number;
    active: number;
    blocked: number;
    admins: number;
    today: number;
    thisMonth: number;
    previousMonth: number;
    growth: number;
  };

  products: {
    total: number;
    active: number;
    outOfStock: number;
  };

  orders: {
    total: number;
    completed: number;
    processing: number;
    pending: number;
    cancelled: number;
  };

  sales: {
    total: number;
    today: number;
    thisMonth: number;
    growth: number;
  };

  usersByDay: {
    _id: string;
    count: number;
  }[];

  recentUsers: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isBlocked: boolean;
    profileImage: string | null;
    createdAt: string;
  }[];
};

const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    welcome: "مرحبًا بك في Glamora",
    overview: "نظرة عامة على متجرك وإحصائياته",

    thisMonth: "هذا الشهر",

    totalSales: "إجمالي المبيعات",
    orders: "الطلبات",
    users: "المستخدمين",
    products: "المنتجات",

    comparedLastMonth: "مقارنة بالشهر الماضي",
    newOrders: "طلب جديد",
    newUsers: "مستخدم جديد",
    activeProducts: "منتج نشط",

    salesOverview: "نظرة عامة على المبيعات",
    ordersOverview: "حالة الطلبات",

    completed: "مكتملة",
    processing: "قيد التجهيز",
    pending: "قيد الانتظار",
    cancelled: "ملغاة",

    recentOrders: "أحدث الطلبات",
    recentUsers: "أحدث المستخدمين",

    viewAll: "عرض الكل",

    customer: "العميل",
    amount: "المبلغ",
    status: "الحالة",
    date: "التاريخ",

    topProducts: "الأكثر مبيعًا",

    quickActions: "إجراءات سريعة",
    addProduct: "إضافة منتج",
    manageUsers: "إدارة المستخدمين",
    manageOrders: "إدارة الطلبات",

    active: "نشط",
    blocked: "محظور",
    admin: "Admin",

    loading: "جاري تحميل البيانات...",
    error: "حدث خطأ أثناء تحميل البيانات",
    retry: "إعادة المحاولة",

    noUsers: "لا يوجد مستخدمون حتى الآن",
    noProducts: "لا توجد منتجات حتى الآن",
    noOrders: "لا توجد طلبات حتى الآن",
  },

  en: {
    dashboard: "Dashboard",
    welcome: "Welcome to Glamora",
    overview: "Overview of your store and statistics",

    thisMonth: "This Month",

    totalSales: "Total Sales",
    orders: "Orders",
    users: "Users",
    products: "Products",

    comparedLastMonth: "Compared to last month",
    newOrders: "new orders",
    newUsers: "new users",
    activeProducts: "active products",

    salesOverview: "Sales Overview",
    ordersOverview: "Orders Overview",

    completed: "Completed",
    processing: "Processing",
    pending: "Pending",
    cancelled: "Cancelled",

    recentOrders: "Recent Orders",
    recentUsers: "Recent Users",

    viewAll: "View All",

    customer: "Customer",
    amount: "Amount",
    status: "Status",
    date: "Date",

    topProducts: "Top Products",

    quickActions: "Quick Actions",
    addProduct: "Add Product",
    manageUsers: "Manage Users",
    manageOrders: "Manage Orders",

    active: "Active",
    blocked: "Blocked",
    admin: "Admin",

    loading: "Loading dashboard...",
    error: "Failed to load dashboard data",
    retry: "Try Again",

    noUsers: "No users yet",
    noProducts: "No products yet",
    noOrders: "No orders yet",
  },
};

function StatCard({
  icon: Icon,
  title,
  value,
  change,
  description,
  positive = true,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-top">
        <div className="admin-stat-icon">
          <Icon size={22} strokeWidth={1.8} />
        </div>

        <div
          className={`admin-stat-change ${
            positive ? "positive" : "negative"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={15} />
          ) : (
            <ArrowDownRight size={15} />
          )}

          {change}
        </div>
      </div>

      <div className="admin-stat-title">{title}</div>

      <div className="admin-stat-value">{value}</div>

      <div className="admin-stat-description">
        {description}
      </div>
    </div>
  );
}

function UserAvatar({
  name,
  image,
}: {
  name: string;
  image: string | null;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="admin-user-avatar-image"
      />
    );
  }

  return (
    <div className="admin-user-avatar">
      {initials}
    </div>
  );
}

export default function AdminDashboardPage() {
  const params = useParams();

  const locale: Locale =
    params.locale === "en" ? "en" : "ar";

  const t = translations[locale];

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(false);

      const response = await fetch(
        "/api/admin/dashboard",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Dashboard request failed"
        );
      }

      setData(result.data);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const usersChart = useMemo(() => {
    if (!data?.usersByDay) return [];

    const max = Math.max(
      ...data.usersByDay.map((item) => item.count),
      1
    );

    return data.usersByDay.map((item) => ({
      ...item,
      percentage: Math.max(
        8,
        (item.count / max) * 100
      ),
    }));
  }, [data]);

  if (loading) {
    return (
      <>
        <main
          className="admin-page admin-loading-page"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <style jsx>{CSS}</style>

          <div className="admin-loading">
            <div className="admin-spinner" />

            <h2>{t.dashboard}</h2>

            <p>{t.loading}</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <main
          className="admin-page admin-loading-page"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <style jsx>{CSS}</style>

          <div className="admin-loading">
            <div className="admin-error-icon">
              !
            </div>

            <h2>{t.error}</h2>

            <button
              type="button"
              className="admin-retry"
              onClick={loadDashboard}
            >
              {t.retry}
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main
        className="admin-page"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <style jsx>{CSS}</style>

        <div className="admin-container">

          <header className="admin-topbar">
            <div className="admin-heading">
              <div className="admin-kicker">
                <Sparkles size={14} />
                GLAMORA ADMIN
              </div>

              <h1 className="admin-title">
                {t.dashboard}
              </h1>

              <p className="admin-subtitle">
                {t.welcome} — {t.overview}
              </p>
            </div>

            <button
              type="button"
              className="admin-period"
            >
              <Clock3 size={16} />

              {t.thisMonth}

              <ChevronDown size={15} />
            </button>
          </header>

          <section className="admin-stats">

            <StatCard
              icon={CircleDollarSign}
              title={t.totalSales}
              value={`${data.sales.total.toLocaleString()} EGP`}
              change={`${data.sales.growth}%`}
              description={t.comparedLastMonth}
              positive={data.sales.growth >= 0}
            />

            <StatCard
              icon={ShoppingCart}
              title={t.orders}
              value={data.orders.total.toLocaleString()}
              change="0%"
              description={`+0 ${t.newOrders}`}
            />

            <StatCard
              icon={Users}
              title={t.users}
              value={data.users.total.toLocaleString()}
              change={`${data.users.growth}%`}
              description={`+${data.users.thisMonth} ${t.newUsers}`}
              positive={data.users.growth >= 0}
            />

            <StatCard
              icon={Package}
              title={t.products}
              value={data.products.total.toLocaleString()}
              change="0%"
              description={`${t.activeProducts}: ${data.products.active}`}
            />

          </section>

          <section className="admin-main-grid">

            <div className="admin-card">

              <div className="admin-card-header">

                <div className="admin-card-title-wrap">
                  <h2 className="admin-card-title">
                    {t.salesOverview}
                  </h2>

                  <p className="admin-card-description">
                    {t.thisMonth}
                  </p>
                </div>

                <TrendingUp
                  size={20}
                  color="#8b1538"
                />

              </div>

              <div className="admin-chart">

                {usersChart.length > 0 ? (
                  usersChart.map((item) => (
                    <div
                      className="admin-chart-column"
                      key={item._id}
                    >
                      <div
                        className="admin-chart-bar"
                        style={{
                          height: `${item.percentage}%`,
                        }}
                        title={`${item.count}`}
                      />

                      <span className="admin-chart-day">
                        {item._id.slice(5)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="admin-empty-chart">
                    0
                  </div>
                )}

              </div>

              <div className="admin-chart-note">
                User registrations
              </div>

            </div>

            <div className="admin-card">

              <div className="admin-card-header">

                <div className="admin-card-title-wrap">
                  <h2 className="admin-card-title">
                    {t.ordersOverview}
                  </h2>

                  <p className="admin-card-description">
                    {data.orders.total} {t.orders}
                  </p>
                </div>

                <BarChart3
                  size={20}
                  color="#8b1538"
                />

              </div>

              <div className="admin-orders-progress">

                <div className="admin-donut">

                  <div className="admin-donut-content">

                    <div className="admin-donut-number">
                      {data.orders.total}
                    </div>

                    <div className="admin-donut-label">
                      {t.orders}
                    </div>

                  </div>

                </div>

              </div>

              <div className="admin-order-legend">

                <div className="admin-legend-item">
                  <span className="admin-legend-dot" />
                  {t.completed}: {data.orders.completed}
                </div>

                <div className="admin-legend-item">
                  <span className="admin-legend-dot processing" />
                  {t.processing}: {data.orders.processing}
                </div>

                <div className="admin-legend-item">
                  <span className="admin-legend-dot pending" />
                  {t.pending}: {data.orders.pending}
                </div>

                <div className="admin-legend-item">
                  <span className="admin-legend-dot cancelled" />
                  {t.cancelled}: {data.orders.cancelled}
                </div>

              </div>

            </div>

          </section>

          <section className="admin-card">

            <div className="admin-card-header">

              <div className="admin-card-title-wrap">
                <h2 className="admin-card-title">
                  {t.recentUsers}
                </h2>

                <p className="admin-card-description">
                  {data.users.total} {t.users}
                </p>
              </div>

              <Link
                href={`/${locale}/admin/dashboard/users`}
                className="admin-view-link"
              >
                {t.viewAll}
              </Link>

            </div>

            {data.recentUsers.length === 0 ? (
              <div className="admin-empty">
                {t.noUsers}
              </div>
            ) : (
              <div className="admin-users-list">

                {data.recentUsers.map((user) => (
                  <div
                    className="admin-user"
                    key={user.id}
                  >

                    <UserAvatar
                      name={user.fullName}
                      image={user.profileImage}
                    />

                    <div className="admin-user-info">

                      <div className="admin-user-name">
                        {user.fullName}
                      </div>

                      <div className="admin-user-email">
                        {user.email}
                      </div>

                    </div>

                    <div className="admin-user-role">

                      {user.role === "admin" ? (
                        <span className="admin-role">
                          {t.admin}
                        </span>
                      ) : user.isBlocked ? (
                        <span className="admin-blocked">
                          {t.blocked}
                        </span>
                      ) : (
                        <span className="admin-active">
                          {t.active}
                        </span>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>

          <section className="admin-card admin-quick-card">

            <div className="admin-card-header">

              <div className="admin-card-title-wrap">
                <h2 className="admin-card-title">
                  {t.quickActions}
                </h2>

                <p className="admin-card-description">
                  Manage Glamora quickly
                </p>
              </div>

              <Bell
                size={20}
                color="#8b1538"
              />

            </div>

            <div className="admin-actions">

              <Link
                href={`/${locale}/admin/dashboard/products/create`}
                className="admin-action"
              >
                <Package size={21} />
                {t.addProduct}
              </Link>

              <Link
                href={`/${locale}/admin/dashboard/users`}
                className="admin-action"
              >
                <UserRound size={21} />
                {t.manageUsers}
              </Link>

              <Link
                href={`/${locale}/admin/dashboard/orders`}
                className="admin-action"
              >
                <ShoppingCart size={21} />
                {t.manageOrders}
              </Link>

            </div>

          </section>

        </div>
      </main>
    </>
  );
}

const CSS = `

.admin-page{
  min-height:100vh;
  background:
    radial-gradient(
      circle at 85% 0%,
      rgba(244,182,194,.25),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #fff8fa 0%,
      #fdf1f4 48%,
      #ffffff 100%
    );
  color:#2a1a1f;
  padding:28px;
}

:global(.dark) .admin-page{
  background:
    radial-gradient(
      circle at 85% 0%,
      rgba(139,21,56,.2),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #101522 0%,
      #161c2d 50%,
      #0c101a 100%
    );
  color:#fff;
}

.admin-container{
  width:100%;
  max-width:1600px;
  margin:0 auto;
  position:relative;
  z-index:2;
}

.admin-topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  margin-bottom:28px;
  animation:adminFadeDown .8s cubic-bezier(.22,1,.36,1) both;
}

.admin-heading{
  display:flex;
  flex-direction:column;
  gap:7px;
}

.admin-kicker{
  display:flex;
  align-items:center;
  gap:8px;
  color:#8b1538;
  font-size:.78rem;
  font-weight:800;
  letter-spacing:.08em;
  animation:adminFadeUp .7s .08s cubic-bezier(.22,1,.36,1) both;
}

.admin-kicker svg{
  animation:adminSparkle 2.2s ease-in-out infinite;
}

.admin-title{
  margin:0;
  font-family:Georgia,"Times New Roman",serif;
  font-size:clamp(1.8rem,3vw,2.7rem);
  font-weight:700;
  animation:adminFadeUp .8s .16s cubic-bezier(.22,1,.36,1) both;
}

.admin-subtitle{
  margin:0;
  color:#7a6a6f;
  font-size:.9rem;
  animation:adminFadeUp .8s .24s cubic-bezier(.22,1,.36,1) both;
}

:global(.dark) .admin-subtitle{
  color:#aeb5c4;
}

.admin-period{
  display:flex;
  align-items:center;
  gap:8px;
  border:1px solid #f0dfe3;
  border-radius:12px;
  padding:10px 14px;
  background:#fff;
  color:#6e0f2c;
  font-weight:700;
  cursor:pointer;
  animation:adminFadeRight .8s .2s cubic-bezier(.22,1,.36,1) both;
  transition:
    transform .3s cubic-bezier(.22,1,.36,1),
    box-shadow .3s ease,
    border-color .3s ease;
}

.admin-period:hover{
  transform:translateY(-3px);
  border-color:#d98799;
  box-shadow:0 10px 25px rgba(139,21,56,.12);
}

.admin-period svg:last-child{
  transition:transform .3s ease;
}

.admin-period:hover svg:last-child{
  transform:translateY(2px);
}

:global(.dark) .admin-period{
  background:#171d2c;
  border-color:#30384c;
  color:#f4b6c2;
}

.admin-stats{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:18px;
  margin-bottom:22px;
}

.admin-stat-card,
.admin-card{
  background:rgba(255,255,255,.92);
  border:1px solid #f0dfe3;
  border-radius:18px;
  box-shadow:0 12px 35px rgba(92,30,48,.055);
  position:relative;
  overflow:hidden;
}

.admin-stat-card::after,
.admin-card::after{
  content:"";
  position:absolute;
  top:0;
  left:-120%;
  width:55%;
  height:100%;
  pointer-events:none;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.22),
      transparent
    );
  transform:skewX(-18deg);
  transition:left .8s ease;
}

.admin-stat-card:hover::after,
.admin-card:hover::after{
  left:140%;
}

:global(.dark) .admin-stat-card,
:global(.dark) .admin-card{
  background:rgba(23,29,44,.92);
  border-color:#30384c;
  box-shadow:0 12px 35px rgba(0,0,0,.2);
}

.admin-stat-card{
  padding:21px;
  transition:
    transform .25s ease,
    box-shadow .25s ease,
    border-color .25s ease;
  opacity:0;
  animation:
    adminCardReveal
    .75s
    cubic-bezier(.22,1,.36,1)
    forwards;
}

.admin-stats .admin-stat-card:nth-child(1){
  animation-delay:.12s;
}

.admin-stats .admin-stat-card:nth-child(2){
  animation-delay:.2s;
}

.admin-stats .admin-stat-card:nth-child(3){
  animation-delay:.28s;
}

.admin-stats .admin-stat-card:nth-child(4){
  animation-delay:.36s;
}

.admin-stat-card:hover{
  transform:translateY(-5px);
  border-color:#e7b4c0;
  box-shadow:0 18px 42px rgba(92,30,48,.11);
}

.admin-stat-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:20px;
}

.admin-stat-icon{
  width:47px;
  height:47px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:13px;
  background:#fbe4e8;
  color:#8b1538;
  transition:
    transform .35s cubic-bezier(.22,1,.36,1),
    box-shadow .35s ease;
}

.admin-stat-card:hover .admin-stat-icon{
  transform:rotate(-8deg) scale(1.1);
  box-shadow:0 10px 25px rgba(139,21,56,.16);
}

:global(.dark) .admin-stat-icon{
  background:rgba(139,21,56,.18);
  color:#f4b6c2;
}

.admin-stat-change{
  display:flex;
  align-items:center;
  gap:3px;
  font-size:.75rem;
  font-weight:800;
}

.admin-stat-change.positive{
  color:#21865b;
}

.admin-stat-change.negative{
  color:#c23d58;
}

.admin-stat-title{
  color:#7a6a6f;
  font-size:.82rem;
}

.admin-stat-value{
  margin:5px 0;
  font-size:1.75rem;
  font-weight:900;
  transition:
    transform .3s ease,
    color .3s ease;
}

.admin-stat-card:hover .admin-stat-value{
  transform:translateX(3px);
  color:#8b1538;
}

:global(.dark) .admin-stat-card:hover .admin-stat-value{
  color:#f4b6c2;
}

.admin-stat-description{
  color:#9a898f;
  font-size:.72rem;
}

.admin-main-grid{
  display:grid;
  grid-template-columns:minmax(0,1.7fr) minmax(300px,.9fr);
  gap:22px;
  margin-bottom:22px;
  animation:adminFadeUp .9s .4s cubic-bezier(.22,1,.36,1) both;
}

.admin-card{
  padding:22px;
  margin-bottom:22px;
}

.admin-main-grid>.admin-card:first-child{
  animation:adminCardReveal .8s .42s cubic-bezier(.22,1,.36,1) both;
}

.admin-main-grid>.admin-card:last-child{
  animation:adminCardReveal .8s .52s cubic-bezier(.22,1,.36,1) both;
}

.admin-card-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  margin-bottom:22px;
}

.admin-card-title-wrap{
  display:flex;
  flex-direction:column;
  gap:5px;
}

.admin-card-title{
  margin:0;
  font-size:1.05rem;
  font-weight:800;
}

.admin-card-description{
  margin:0;
  color:#96868b;
  font-size:.74rem;
}

.admin-view-link{
  color:#8b1538;
  font-size:.78rem;
  font-weight:800;
  text-decoration:none;
  position:relative;
}

.admin-view-link::after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  bottom:-4px;
  height:1px;
  background:currentColor;
  transform:scaleX(0);
  transform-origin:right;
  transition:transform .3s ease;
}

.admin-view-link:hover::after{
  transform:scaleX(1);
  transform-origin:left;
}

.admin-view-link:hover{
  color:#6e0f2c;
}

.admin-chart{
  height:260px;
  display:flex;
  align-items:flex-end;
  gap:15px;
  padding:15px 5px 0;
  position:relative;
  border-bottom:1px solid #f0dfe3;
}

:global(.dark) .admin-chart{
  border-color:#30384c;
}

.admin-chart::before{
  content:"";
  position:absolute;
  inset:0;
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 51px,
      rgba(139,21,56,.055) 52px
    );
  pointer-events:none;
}

.admin-chart-column{
  flex:1;
  height:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-end;
  gap:9px;
  position:relative;
  z-index:1;
}

.admin-chart-bar{
  width:min(46px,70%);
  min-height:20px;
  border-radius:10px 10px 3px 3px;
  background:
    linear-gradient(
      to top,
      #6e0f2c,
      #8b1538 65%,
      #d98799
    );
  transform-origin:bottom;
  transform:scaleY(0);
  animation:
    adminBarGrow
    1s
    cubic-bezier(.22,1,.36,1)
    forwards;
  box-shadow:0 8px 18px rgba(139,21,56,.12);
  transition:
    transform .25s ease,
    filter .25s ease;
}

.admin-chart-column:nth-child(1) .admin-chart-bar{
  animation-delay:.45s;
}

.admin-chart-column:nth-child(2) .admin-chart-bar{
  animation-delay:.5s;
}

.admin-chart-column:nth-child(3) .admin-chart-bar{
  animation-delay:.55s;
}

.admin-chart-column:nth-child(4) .admin-chart-bar{
  animation-delay:.6s;
}

.admin-chart-column:nth-child(5) .admin-chart-bar{
  animation-delay:.65s;
}

.admin-chart-column:nth-child(6) .admin-chart-bar{
  animation-delay:.7s;
}

.admin-chart-column:nth-child(7) .admin-chart-bar{
  animation-delay:.75s;
}

.admin-chart-column:nth-child(8) .admin-chart-bar{
  animation-delay:.8s;
}

.admin-chart-column:hover .admin-chart-bar{
  transform:
    translateY(-5px)
    scaleX(1.08);
  filter:brightness(1.08);
}

.admin-chart-day{
  color:#8d7d82;
  font-size:.7rem;
}

.admin-chart-note{
  margin-top:12px;
  color:#9a898f;
  font-size:.68rem;
  text-align:center;
}

.admin-empty-chart{
  width:100%;
  text-align:center;
  color:#9a898f;
  padding-bottom:20px;
}

.admin-orders-progress{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:250px;
}

.admin-donut{
  width:185px;
  height:185px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:
    conic-gradient(
      #8b1538 0deg 185deg,
      #d98699 185deg 275deg,
      #f4b6c2 275deg 330deg,
      #e8d9dd 330deg 360deg
    );
  position:relative;
  animation:
    adminDonutReveal
    1.2s
    cubic-bezier(.22,1,.36,1)
    both,
    adminDonutFloat
    5s
    1.2s
    ease-in-out
    infinite;
  box-shadow:0 18px 45px rgba(139,21,56,.14);
}

.admin-donut::after{
  content:"";
  position:absolute;
  width:122px;
  height:122px;
  border-radius:50%;
  background:#fff;
}

:global(.dark) .admin-donut::after{
  background:#171d2c;
}

.admin-donut-content{
  position:relative;
  z-index:2;
  text-align:center;
  animation:
    adminScaleIn
    .7s
    .8s
    cubic-bezier(.22,1,.36,1)
    both;
}

.admin-donut-number{
  font-size:1.65rem;
  font-weight:900;
}

.admin-donut-label{
  color:#8d7d82;
  font-size:.7rem;
}

.admin-order-legend{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px 20px;
  animation:
    adminFadeUp
    .8s
    .75s
    cubic-bezier(.22,1,.36,1)
    both;
}

.admin-legend-item{
  display:flex;
  align-items:center;
  gap:8px;
  color:#706066;
  font-size:.75rem;
  transition:transform .25s ease;
}

.admin-legend-item:hover{
  transform:translateX(-4px);
}

:global(.dark) .admin-legend-item{
  color:#aeb5c4;
}

.admin-legend-dot{
  width:9px;
  height:9px;
  border-radius:50%;
  background:#8b1538;
  transition:
    transform .25s ease,
    box-shadow .25s ease;
}

.admin-legend-item:hover .admin-legend-dot{
  transform:scale(1.45);
  box-shadow:
    0 0 0 5px rgba(139,21,56,.08);
}

.admin-legend-dot.processing{
  background:#d98699;
}

.admin-legend-dot.pending{
  background:#f4b6c2;
}

.admin-legend-dot.cancelled{
  background:#e8d9dd;
}

.admin-users-list{
  display:flex;
  flex-direction:column;
  gap:5px;
}

.admin-user{
  display:flex;
  align-items:center;
  gap:12px;
  padding:11px 8px;
  border-radius:12px;
  transition:
    background .2s ease,
    transform .25s ease;
  opacity:0;
  animation:
    adminUserReveal
    .55s
    cubic-bezier(.22,1,.36,1)
    forwards;
}

.admin-user:nth-child(1){
  animation-delay:.72s;
}

.admin-user:nth-child(2){
  animation-delay:.79s;
}

.admin-user:nth-child(3){
  animation-delay:.86s;
}

.admin-user:nth-child(4){
  animation-delay:.93s;
}

.admin-user:nth-child(5){
  animation-delay:1s;
}

.admin-user:hover{
  background:#fff4f6;
  transform:translateX(-3px);
}

:global(.dark) .admin-user:hover{
  background:#1d2435;
}

.admin-user-avatar,
.admin-user-avatar-image{
  width:42px;
  height:42px;
  flex:0 0 42px;
  border-radius:50%;
}

.admin-user-avatar{
  display:flex;
  align-items:center;
  justify-content:center;
  background:
    linear-gradient(
      135deg,
      #8b1538,
      #d98799
    );
  color:#fff;
  font-size:.72rem;
  font-weight:900;
  transition:
    transform .35s cubic-bezier(.22,1,.36,1),
    box-shadow .35s ease;
}

.admin-user:hover .admin-user-avatar{
  transform:scale(1.08) rotate(4deg);
  box-shadow:0 8px 20px rgba(139,21,56,.18);
}

.admin-user-avatar-image{
  object-fit:cover;
  transition:
    transform .35s cubic-bezier(.22,1,.36,1),
    box-shadow .35s ease;
}

.admin-user:hover .admin-user-avatar-image{
  transform:scale(1.06);
  box-shadow:0 8px 20px rgba(139,21,56,.18);
}

.admin-user-info{
  min-width:0;
  flex:1;
}

.admin-user-name{
  font-size:.8rem;
  font-weight:800;
}

.admin-user-email{
  margin-top:3px;
  color:#99898e;
  font-size:.65rem;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.admin-user-role{
  white-space:nowrap;
}

.admin-role,
.admin-active,
.admin-blocked{
  display:inline-flex;
  padding:5px 9px;
  border-radius:30px;
  font-size:.62rem;
  font-weight:800;
  transition:transform .25s ease;
}

.admin-user:hover .admin-role,
.admin-user:hover .admin-active,
.admin-user:hover .admin-blocked{
  transform:scale(1.05);
}

.admin-role{
  background:#fbe4e8;
  color:#8b1538;
}

.admin-active{
  background:#e8f6ef;
  color:#21865b;
}

.admin-blocked{
  background:#fdecef;
  color:#b8324f;
}

.admin-actions{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
}

.admin-action{
  min-height:95px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:9px;
  border:1px solid #f0dfe3;
  border-radius:15px;
  background:#fff;
  color:#6e0f2c;
  text-decoration:none;
  font-size:.74rem;
  font-weight:800;
  transition:
    transform .25s ease,
    background .25s ease,
    color .25s ease,
    box-shadow .25s ease;
  position:relative;
  overflow:hidden;
}

.admin-action::before{
  content:"";
  position:absolute;
  width:0;
  height:0;
  border-radius:50%;
  background:rgba(255,255,255,.12);
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  transition:
    width .45s ease,
    height .45s ease;
}

.admin-action:hover::before{
  width:260px;
  height:260px;
}

.admin-action svg{
  transition:
    transform .35s cubic-bezier(.22,1,.36,1);
}

.admin-action:hover svg{
  transform:
    scale(1.15)
    translateY(-2px);
}

.admin-action:hover{
  transform:translateY(-4px);
  background:#8b1538;
  color:#fff;
  box-shadow:
    0 14px 28px rgba(139,21,56,.18);
}

:global(.dark) .admin-action{
  background:#171d2c;
  border-color:#30384c;
  color:#f4b6c2;
}

:global(.dark) .admin-action:hover{
  background:#8b1538;
  color:#fff;
}

.admin-empty{
  padding:45px 20px;
  text-align:center;
  color:#9a898f;
  font-size:.85rem;
}

.admin-loading-page{
  display:flex;
  align-items:center;
  justify-content:center;
}

.admin-loading{
  min-height:60vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  animation:
    adminScaleIn
    .6s
    cubic-bezier(.22,1,.36,1)
    both;
}

.admin-loading h2{
  margin:18px 0 5px;
  font-weight:800;
}

.admin-loading p{
  margin:0;
  color:#8d7d82;
}

.admin-spinner{
  width:45px;
  height:45px;
  border:4px solid #f4b6c2;
  border-top-color:#8b1538;
  border-radius:50%;
  animation:adminSpin .8s linear infinite;
  box-shadow:
    0 0 0 8px rgba(244,182,194,.12),
    0 0 30px rgba(139,21,56,.16);
}

.admin-error-icon{
  width:55px;
  height:55px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  background:#fbe4e8;
  color:#8b1538;
  font-size:1.5rem;
  font-weight:900;
}

.admin-retry{
  margin-top:20px;
  border:0;
  border-radius:10px;
  padding:11px 22px;
  background:#8b1538;
  color:#fff;
  font-weight:800;
  cursor:pointer;
  transition:
    transform .25s ease,
    background .25s ease,
    box-shadow .25s ease;
}

.admin-retry:hover{
  background:#6e0f2c;
  transform:translateY(-2px);
  box-shadow:0 10px 25px rgba(139,21,56,.2);
}

/* Ambient background */

.admin-page::before,
.admin-page::after{
  content:"";
  position:fixed;
  width:420px;
  height:420px;
  border-radius:50%;
  pointer-events:none;
  z-index:0;
  filter:blur(80px);
  opacity:.14;
}

.admin-page::before{
  top:-180px;
  right:-120px;
  background:#f4b6c2;
  animation:
    adminAmbientOne
    10s
    ease-in-out
    infinite
    alternate;
}

.admin-page::after{
  bottom:-220px;
  left:-140px;
  background:#8b1538;
  opacity:.07;
  animation:
    adminAmbientTwo
    13s
    ease-in-out
    infinite
    alternate;
}

/* Animations */

@keyframes adminFadeUp{
  from{
    opacity:0;
    transform:translateY(22px);
  }

  to{
    opacity:1;
    transform:translateY(0);
  }
}

@keyframes adminFadeDown{
  from{
    opacity:0;
    transform:translateY(-22px);
  }

  to{
    opacity:1;
    transform:translateY(0);
  }
}

@keyframes adminFadeRight{
  from{
    opacity:0;
    transform:translateX(22px);
  }

  to{
    opacity:1;
    transform:translateX(0);
  }
}

@keyframes adminScaleIn{
  from{
    opacity:0;
    transform:scale(.82);
  }

  to{
    opacity:1;
    transform:scale(1);
  }
}

@keyframes adminCardReveal{
  from{
    opacity:0;
    transform:
      translateY(28px)
      scale(.97);
  }

  to{
    opacity:1;
    transform:
      translateY(0)
      scale(1);
  }
}

@keyframes adminUserReveal{
  from{
    opacity:0;
    transform:translateX(-18px);
  }

  to{
    opacity:1;
    transform:translateX(0);
  }
}

@keyframes adminBarGrow{
  from{
    transform:scaleY(0);
  }

  to{
    transform:scaleY(1);
  }
}

@keyframes adminDonutReveal{
  from{
    opacity:0;
    transform:
      scale(.65)
      rotate(-80deg);
  }

  to{
    opacity:1;
    transform:
      scale(1)
      rotate(0);
  }
}

@keyframes adminDonutFloat{
  0%,
  100%{
    transform:translateY(0);
  }

  50%{
    transform:translateY(-7px);
  }
}

@keyframes adminAmbientOne{
  from{
    transform:
      translate(0,0)
      scale(1);
  }

  to{
    transform:
      translate(-45px,35px)
      scale(1.12);
  }
}

@keyframes adminAmbientTwo{
  from{
    transform:
      translate(0,0)
      scale(1);
  }

  to{
    transform:
      translate(55px,-30px)
      scale(1.08);
  }
}

@keyframes adminSparkle{
  0%,
  100%{
    transform:
      rotate(0)
      scale(1);
  }

  50%{
    transform:
      rotate(12deg)
      scale(1.18);
  }
}

@keyframes adminSpin{
  to{
    transform:rotate(360deg);
  }
}

/* Reduced motion */

@media (prefers-reduced-motion:reduce){
  .admin-page *,
  .admin-page *::before,
  .admin-page *::after{
    animation-duration:.01ms !important;
    animation-iteration-count:1 !important;
    transition-duration:.01ms !important;
    scroll-behavior:auto !important;
  }
}

/* Responsive */

@media(max-width:1200px){

  .admin-stats{
    grid-template-columns:repeat(2,1fr);
  }

  .admin-main-grid{
    grid-template-columns:1fr;
  }
}

@media(max-width:700px){

  .admin-page{
    padding:17px 13px;
  }

  .admin-topbar{
    align-items:flex-start;
    flex-direction:column;
  }

  .admin-period{
    width:100%;
    justify-content:center;
  }

  .admin-stats{
    grid-template-columns:1fr 1fr;
    gap:11px;
  }

  .admin-stat-card{
    padding:15px;
    border-radius:15px;
  }

  .admin-stat-value{
    font-size:1.35rem;
  }

  .admin-stat-icon{
    width:40px;
    height:40px;
  }

  .admin-card{
    padding:16px;
    border-radius:15px;
  }

  .admin-chart{
    height:220px;
    gap:7px;
  }

  .admin-actions{
    grid-template-columns:1fr;
  }

  .admin-action{
    min-height:70px;
    flex-direction:row;
    justify-content:flex-start;
    padding:0 18px;
  }

  .admin-user-email{
    max-width:130px;
  }

  .admin-page::before,
  .admin-page::after{
    width:260px;
    height:260px;
    filter:blur(60px);
  }

  .admin-donut{
    width:155px;
    height:155px;
  }
}

@media(max-width:420px){

  .admin-stats{
    grid-template-columns:1fr;
  }

  .admin-title{
    font-size:1.65rem;
  }

  .admin-order-legend{
    grid-template-columns:1fr;
  }
}

`;