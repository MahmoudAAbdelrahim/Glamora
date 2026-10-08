"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Lock,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  UserCog,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Locale = "ar" | "en";
type UserRole = "user" | "admin";

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isBlocked: boolean;
  profileImage?: {
    url?: string;
    publicId?: string;
  };
  createdAt: string;
};

type Stats = {
  total: number;
  admins: number;
  users: number;
  blocked: number;
  active: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const translations = {
  ar: {
    title: "إدارة المستخدمين",
    subtitle: "إدارة جميع مستخدمي منصة Glamora",

    total: "إجمالي المستخدمين",
    users: "المستخدمين",
    admins: "المديرين",
    active: "النشطين",
    blocked: "المحظورين",

    search: "ابحث بالاسم أو البريد أو الهاتف...",
    searchButton: "بحث",

    allRoles: "كل الأدوار",
    user: "مستخدم",
    admin: "مدير",

    allStatus: "كل الحالات",
    activeStatus: "نشط",
    blockedStatus: "محظور",

    name: "المستخدم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    role: "الدور",
    status: "الحالة",
    createdAt: "تاريخ التسجيل",
    actions: "الإجراءات",

    activeUser: "نشط",
    blockedUser: "محظور",

    block: "حظر",
    unblock: "إلغاء الحظر",
    makeAdmin: "جعله مديرًا",
    makeUser: "جعله مستخدمًا",
    delete: "حذف",

    noUsers: "لا يوجد مستخدمون",
    noUsersDescription: "لم يتم العثور على أي مستخدمين مطابقين للبحث الحالي.",
    loading: "جاري تحميل المستخدمين...",
    error: "حدث خطأ أثناء تحميل المستخدمين",
    retry: "إعادة المحاولة",

    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",

    confirmDelete:
      "هل أنت متأكد من حذف هذا المستخدم؟ سيتم إخفاؤه من النظام.",
    confirmBlock: "هل تريد حظر هذا المستخدم؟",
    confirmUnblock: "هل تريد إلغاء حظر هذا المستخدم؟",
    confirmAdmin: "هل تريد تحويل هذا المستخدم إلى مدير؟",
    confirmUser: "هل تريد تحويل هذا المدير إلى مستخدم؟",

    dashboard: "لوحة التحكم",
    usersManagement: "المستخدمون",
  },

  en: {
    title: "Users Management",
    subtitle: "Manage all Glamora platform users",

    total: "Total Users",
    users: "Users",
    admins: "Admins",
    active: "Active",
    blocked: "Blocked",

    search: "Search by name, email or phone...",
    searchButton: "Search",

    allRoles: "All roles",
    user: "User",
    admin: "Admin",

    allStatus: "All status",
    activeStatus: "Active",
    blockedStatus: "Blocked",

    name: "User",
    email: "Email",
    phone: "Phone",
    role: "Role",
    status: "Status",
    createdAt: "Joined",
    actions: "Actions",

    activeUser: "Active",
    blockedUser: "Blocked",

    block: "Block",
    unblock: "Unblock",
    makeAdmin: "Make Admin",
    makeUser: "Make User",
    delete: "Delete",

    noUsers: "No users found",
    noUsersDescription: "No users match your current search or filters.",
    loading: "Loading users...",
    error: "Failed to load users",
    retry: "Retry",

    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",

    confirmDelete:
      "Are you sure you want to delete this user? The account will be hidden from the system.",
    confirmBlock: "Do you want to block this user?",
    confirmUnblock: "Do you want to unblock this user?",
    confirmAdmin: "Do you want to make this user an admin?",
    confirmUser: "Do you want to change this admin to a user?",

    dashboard: "Dashboard",
    usersManagement: "Users",
  },
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function StatCard({
  icon: Icon,
  label,
  value,
  type,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  type: "total" | "users" | "admins" | "active" | "blocked";
  delay: number;
}) {
  return (
    <div
      className={`gu-stat gu-stat-${type}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="gu-stat-glow" />

      <div className="gu-stat-top">
        <div className="gu-stat-icon">
          <Icon size={21} strokeWidth={1.8} />
        </div>

        <span className="gu-stat-arrow">
          <Activity size={16} />
        </span>
      </div>

      <div className="gu-stat-value">
        {value.toLocaleString()}
      </div>

      <div className="gu-stat-label">{label}</div>

      <div className="gu-stat-line" />
    </div>
  );
}

export default function AdminUsersPage() {
  const params = useParams();
  const router = useRouter();

  const locale: Locale = params.locale === "en" ? "en" : "ar";
  const t = translations[locale];

  const isAr = locale === "ar";

  const [users, setUsers] = useState<User[]>([]);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    admins: 0,
    users: 0,
    blocked: 0,
    active: 0,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        query.set("page", String(page));
        query.set("limit", "10");

        if (search) {
          query.set("search", search);
        }

        if (role !== "all") {
          query.set("role", role);
        }

        if (status !== "all") {
          query.set("status", status);
        }

        const response = await fetch(
          `/api/admin/dashboard/users?${query.toString()}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || t.error);
        }

        setUsers(result.data.users);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : t.error
        );
      } finally {
        setLoading(false);
      }
    },
    [role, search, status, t.error]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleAction = async (
    user: User,
    action:
      | "block"
      | "unblock"
      | "admin"
      | "user"
      | "delete"
  ) => {
    if (action === "delete") {
      if (!window.confirm(t.confirmDelete)) {
        return;
      }
    }

    if (action === "block") {
      if (!window.confirm(t.confirmBlock)) {
        return;
      }
    }

    if (action === "unblock") {
      if (!window.confirm(t.confirmUnblock)) {
        return;
      }
    }

    if (action === "admin") {
      if (!window.confirm(t.confirmAdmin)) {
        return;
      }
    }

    if (action === "user") {
      if (!window.confirm(t.confirmUser)) {
        return;
      }
    }

    setActionLoading(`${user.id}-${action}`);

    try {
      if (action === "delete") {
        const response = await fetch(
          `/api/admin/dashboard/users/${user.id}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Operation failed"
          );
        }

        await fetchUsers(
          users.length === 1 && pagination.page > 1
            ? pagination.page - 1
            : pagination.page
        );

        return;
      }

      const body: Record<string, unknown> = {};

      if (action === "block") {
        body.isBlocked = true;
      }

      if (action === "unblock") {
        body.isBlocked = false;
      }

      if (action === "admin") {
        body.role = "admin";
      }

      if (action === "user") {
        body.role = "user";
      }

      const response = await fetch(
        `/api/admin/dashboard/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Operation failed"
        );
      }

      await fetchUsers(pagination.page);
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error
          ? err.message
          : "Operation failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const paginationNumbers = useMemo(() => {
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 5) {
      return Array.from(
        { length: total },
        (_, index) => index + 1
      );
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return [
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      current - 2,
      current - 1,
      current,
      current + 1,
      current + 2,
    ];
  }, [pagination.page, pagination.totalPages]);

  return (
    <main
      className="gl-users-page"
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className="gl-users-shell">

        {/* HEADER */}
        <header className="gu-header">
          <div className="gu-header-content">
            <button
              type="button"
              className="gu-back"
              onClick={() =>
                router.push(`/${locale}/admin/dashboard`)
              }
            >
              {isAr ? (
                <ArrowRight size={18} />
              ) : (
                <ArrowLeft size={18} />
              )}

              <span>{t.dashboard}</span>
            </button>

            <div className="gu-title-row">
              <div className="gu-title-icon">
                <Users size={27} />
              </div>

              <div>
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="gu-header-badge">
            <CircleUserRound size={18} />
            <span>{stats.total.toLocaleString()}</span>
            <small>{t.usersManagement}</small>
          </div>
        </header>

        {/* STATS */}
        <section className="gu-stats">
          <StatCard
            icon={Users}
            label={t.total}
            value={stats.total}
            type="total"
            delay={80}
          />

          <StatCard
            icon={UserCheck}
            label={t.users}
            value={stats.users}
            type="users"
            delay={150}
          />

          <StatCard
            icon={ShieldCheck}
            label={t.admins}
            value={stats.admins}
            type="admins"
            delay={220}
          />

          <StatCard
            icon={CheckCircle2}
            label={t.active}
            value={stats.active}
            type="active"
            delay={290}
          />

          <StatCard
            icon={Ban}
            label={t.blocked}
            value={stats.blocked}
            type="blocked"
            delay={360}
          />
        </section>

        {/* FILTERS */}
        <section className="gu-toolbar">
          <div className="gu-search">
            <Search size={19} />

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder={t.search}
            />

            {searchInput && (
              <button
                type="button"
                className="gu-clear"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
              >
                ×
              </button>
            )}

            <button
              type="button"
              className="gu-search-button"
              onClick={handleSearch}
            >
              <Search size={16} />
              {t.searchButton}
            </button>
          </div>

          <div className="gu-select-wrap">
            <UserCog size={17} />

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
            >
              <option value="all">{t.allRoles}</option>
              <option value="user">{t.user}</option>
              <option value="admin">{t.admin}</option>
            </select>
          </div>

          <div className="gu-select-wrap">
            <Activity size={17} />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="all">{t.allStatus}</option>
              <option value="active">
                {t.activeStatus}
              </option>
              <option value="blocked">
                {t.blockedStatus}
              </option>
            </select>
          </div>
        </section>

        {/* ERROR */}
        {error ? (
          <section className="gu-error">
            <div className="gu-error-icon">
              <Ban size={22} />
            </div>

            <div>
              <strong>{t.error}</strong>
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchUsers(pagination.page)
              }
            >
              {t.retry}
            </button>
          </section>
        ) : (
          <section className="gu-table-card">

            {/* TABLE HEADER */}
            <div className="gu-table-head">
              <div>
                <h2>{t.usersManagement}</h2>
                <p>
                  {pagination.total.toLocaleString()}{" "}
                  {t.users}
                </p>
              </div>

              <div className="gu-live">
                <span />
                {isAr ? "البيانات محدثة" : "Live data"}
              </div>
            </div>

            {loading ? (
              <div className="gu-loading">
                <div className="gu-spinner" />

                <strong>{t.loading}</strong>

                <div className="gu-loading-line" />
                <div className="gu-loading-line short" />
              </div>
            ) : users.length === 0 ? (
              <div className="gu-empty">
                <div className="gu-empty-icon">
                  <Users size={34} />
                </div>

                <h3>{t.noUsers}</h3>
                <p>{t.noUsersDescription}</p>
              </div>
            ) : (
              <>
                <div className="gu-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t.name}</th>
                        <th>{t.email}</th>
                        <th>{t.phone}</th>
                        <th>{t.role}</th>
                        <th>{t.status}</th>
                        <th>{t.createdAt}</th>
                        <th>{t.actions}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={user.id}
                          style={{
                            animationDelay: `${index * 55}ms`,
                          }}
                        >
                          {/* USER */}
                          <td data-label={t.name}>
                            <div className="gu-user">
                              <div className="gu-avatar">
                                {user.profileImage?.url ? (
                                  <img
                                    src={
                                      user.profileImage.url
                                    }
                                    alt={user.fullName}
                                  />
                                ) : (
                                  <UserRound
                                    size={19}
                                  />
                                )}

                                <span className="gu-avatar-ring" />
                              </div>

                              <div className="gu-user-info">
                                <strong>
                                  {user.fullName}
                                </strong>

                                <small>
                                  #{user.id.slice(-6)}
                                </small>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL */}
                          <td data-label={t.email}>
                            <span className="gu-email">
                              {user.email}
                            </span>
                          </td>

                          {/* PHONE */}
                          <td data-label={t.phone}>
                            <span className="gu-phone">
                              {user.phone || "—"}
                            </span>
                          </td>

                          {/* ROLE */}
                          <td data-label={t.role}>
                            <span
                              className={`gu-role ${
                                user.role === "admin"
                                  ? "admin"
                                  : "user"
                              }`}
                            >
                              {user.role === "admin" ? (
                                <ShieldCheck size={14} />
                              ) : (
                                <UserRound size={14} />
                              )}

                              {user.role === "admin"
                                ? t.admin
                                : t.user}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td data-label={t.status}>
                            <span
                              className={`gu-status ${
                                user.isBlocked
                                  ? "blocked"
                                  : "active"
                              }`}
                            >
                              <span className="gu-status-dot" />

                              {user.isBlocked
                                ? t.blockedUser
                                : t.activeUser}
                            </span>
                          </td>

                          {/* DATE */}
                          <td data-label={t.createdAt}>
                            <span className="gu-date">
                              {formatDate(
                                user.createdAt,
                                locale
                              )}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td data-label={t.actions}>
                            <div className="gu-actions">
                              {user.isBlocked ? (
                                <button
                                  type="button"
                                  className="gu-action success"
                                  title={t.unblock}
                                  disabled={
                                    actionLoading !== null
                                  }
                                  onClick={() =>
                                    handleAction(
                                      user,
                                      "unblock"
                                    )
                                  }
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="gu-action warning"
                                  title={t.block}
                                  disabled={
                                    actionLoading !== null
                                  }
                                  onClick={() =>
                                    handleAction(
                                      user,
                                      "block"
                                    )
                                  }
                                >
                                  <Lock size={16} />
                                </button>
                              )}

                              {user.role === "admin" ? (
                                <button
                                  type="button"
                                  className="gu-action neutral"
                                  title={t.makeUser}
                                  disabled={
                                    actionLoading !== null
                                  }
                                  onClick={() =>
                                    handleAction(
                                      user,
                                      "user"
                                    )
                                  }
                                >
                                  <UserRound size={16} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="gu-action primary"
                                  title={t.makeAdmin}
                                  disabled={
                                    actionLoading !== null
                                  }
                                  onClick={() =>
                                    handleAction(
                                      user,
                                      "admin"
                                    )
                                  }
                                >
                                  <ShieldCheck size={16} />
                                </button>
                              )}

                              <button
                                type="button"
                                className="gu-action danger"
                                title={t.delete}
                                disabled={
                                  actionLoading !== null
                                }
                                onClick={() =>
                                  handleAction(
                                    user,
                                    "delete"
                                  )
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="gu-pagination">
                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1 || loading
                    }
                    onClick={() =>
                      fetchUsers(
                        pagination.page - 1
                      )
                    }
                  >
                    {isAr ? (
                      <ChevronRight size={17} />
                    ) : (
                      <ChevronLeft size={17} />
                    )}

                    <span>{t.previous}</span>
                  </button>

                  <div className="gu-pages">
                    {paginationNumbers.map((page) => (
                      <button
                        type="button"
                        key={page}
                        className={
                          page === pagination.page
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          fetchUsers(page)
                        }
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                        pagination.totalPages ||
                      loading
                    }
                    onClick={() =>
                      fetchUsers(
                        pagination.page + 1
                      )
                    }
                  >
                    <span>{t.next}</span>

                    {isAr ? (
                      <ChevronLeft size={17} />
                    ) : (
                      <ChevronRight size={17} />
                    )}
                  </button>
                </div>

                <div className="gu-page-info">
                  {t.page} {pagination.page} {t.of}{" "}
                  {pagination.totalPages}
                </div>
              </>
            )}
          </section>
        )}
      </section>

      <style>{`
        .gl-users-page {
          --wine: #8b1538;
          --wine-deep: #6e0f2c;
          --wine-soft: #fbe4e8;
          --pink: #f4b6c2;
          --rose: #d6506f;

          --bg: #faf7f8;
          --card: rgba(255,255,255,.94);
          --line: #f0dfe3;
          --text: #2a1a1f;
          --muted: #7a6a6f;

          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 7% 5%,
              rgba(244,182,194,.24),
              transparent 27%
            ),
            radial-gradient(
              circle at 95% 20%,
              rgba(139,21,56,.09),
              transparent 25%
            ),
            var(--bg);
          color: var(--text);
          font-family: Inter, Arial, sans-serif;
        }

        .gl-users-page::before,
        .gl-users-page::after {
          content: "";
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(10px);
          opacity: .45;
          animation: guFloat 11s ease-in-out infinite;
        }

        .gl-users-page::before {
          left: -210px;
          top: 18%;
          background: radial-gradient(
            circle,
            rgba(244,182,194,.28),
            transparent 68%
          );
        }

        .gl-users-page::after {
          right: -220px;
          bottom: 5%;
          background: radial-gradient(
            circle,
            rgba(139,21,56,.10),
            transparent 68%
          );
          animation-delay: -4s;
        }

        .gl-users-shell {
          position: relative;
          z-index: 1;
          width: min(1500px, 94%);
          margin: 0 auto;
          padding: 38px 0 70px;
        }

        /* HEADER */

        .gu-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 28px;
          animation: guHeader .75s cubic-bezier(.22,1,.36,1) both;
        }

        .gu-header-content {
          min-width: 0;
        }

        .gu-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          margin-bottom: 16px;
          border: 0;
          background: transparent;
          color: var(--wine);
          font-weight: 800;
          cursor: pointer;
          transition: .3s ease;
        }

        .gu-back:hover {
          gap: 13px;
          color: var(--wine-deep);
          transform: translateX(
            ${isAr ? "3px" : "-3px"}
          );
        }

        .gu-title-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .gu-title-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          color: white;
          background:
            linear-gradient(
              145deg,
              #a82c50,
              var(--wine-deep)
            );
          box-shadow:
            0 12px 28px rgba(139,21,56,.20);
          animation: guIcon .8s .15s both;
        }

        .gu-title-row h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.1;
          letter-spacing: -.035em;
          color: var(--wine-deep);
        }

        .gu-title-row p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: .92rem;
        }

        .gu-header-badge {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 150px;
          padding: 13px 16px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: rgba(255,255,255,.75);
          box-shadow: 0 8px 25px rgba(139,21,56,.05);
          backdrop-filter: blur(12px);
          color: var(--wine);
        }

        .gu-header-badge span {
          font-size: 1.1rem;
          font-weight: 900;
        }

        .gu-header-badge small {
          color: var(--muted);
          font-weight: 700;
        }

        /* STATS */

        .gu-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 20px;
          perspective: 1000px;
        }

        .gu-stat {
          position: relative;
          min-height: 142px;
          overflow: hidden;
          padding: 20px;
          border: 1px solid var(--line);
          border-radius: 19px;
          background: var(--card);
          box-shadow:
            0 8px 28px rgba(110,15,44,.055);
          opacity: 0;
          transform:
            translateY(25px)
            scale(.96);
          animation:
            guStatIn .7s
            cubic-bezier(.22,1,.36,1)
            forwards;
          transition:
            transform .4s cubic-bezier(.22,1,.36,1),
            box-shadow .4s ease,
            border-color .4s ease;
        }

        .gu-stat::after {
          content: "";
          position: absolute;
          inset: auto 17px 0;
          height: 2px;
          border-radius: 99px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--stat-accent),
            transparent
          );
          transform: scaleX(.25);
          opacity: 0;
          transition: .4s ease;
        }

        .gu-stat:hover {
          transform:
            translateY(-7px)
            rotateX(2deg);
          border-color: rgba(217,135,153,.5);
          box-shadow:
            0 20px 45px rgba(110,15,44,.12);
        }

        .gu-stat:hover::after {
          transform: scaleX(1);
          opacity: 1;
        }

        .gu-stat-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          top: -90px;
          right: -65px;
          border-radius: 50%;
          background: var(--stat-glow);
          filter: blur(4px);
          transition: .5s ease;
        }

        .gu-stat:hover .gu-stat-glow {
          transform: scale(1.4);
        }

        .gu-stat-total {
          --stat-accent: #8b1538;
          --stat-glow: rgba(139,21,56,.13);
        }

        .gu-stat-users {
          --stat-accent: #d6506f;
          --stat-glow: rgba(214,80,111,.13);
        }

        .gu-stat-admins {
          --stat-accent: #60479a;
          --stat-glow: rgba(96,71,154,.12);
        }

        .gu-stat-active {
          --stat-accent: #16824d;
          --stat-glow: rgba(22,130,77,.12);
        }

        .gu-stat-blocked {
          --stat-accent: #c03b4e;
          --stat-glow: rgba(192,59,78,.12);
        }

        .gu-stat-top {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gu-stat-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: var(--wine-soft);
          color: var(--stat-accent);
          transition: .4s cubic-bezier(.22,1,.36,1);
        }

        .gu-stat:hover .gu-stat-icon {
          transform: rotate(-7deg) scale(1.12);
          box-shadow:
            0 8px 22px rgba(139,21,56,.13);
        }

        .gu-stat-arrow {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: var(--stat-accent);
          background: rgba(139,21,56,.055);
          transition: .35s ease;
        }

        .gu-stat:hover .gu-stat-arrow {
          transform: translateY(-3px);
        }

        .gu-stat-value {
          position: relative;
          z-index: 1;
          margin-top: 17px;
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -.035em;
          color: var(--text);
          transition: .35s ease;
        }

        .gu-stat:hover .gu-stat-value {
          color: var(--stat-accent);
          transform: translateX(
            ${isAr ? "-2px" : "2px"}
          );
        }

        .gu-stat-label {
          position: relative;
          z-index: 1;
          margin-top: 3px;
          color: var(--muted);
          font-size: .79rem;
          font-weight: 800;
        }

        .gu-stat-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 34%;
          height: 3px;
          background: var(--stat-accent);
          border-radius: 0 99px 99px 0;
          opacity: .7;
        }

        /* TOOLBAR */

        .gu-toolbar {
          display: grid;
          grid-template-columns: minmax(300px, 1fr) 190px 190px;
          gap: 12px;
          margin-bottom: 17px;
          animation: guFadeUp .7s .38s both;
        }

        .gu-search,
        .gu-select-wrap {
          height: 51px;
          border: 1px solid var(--line);
          border-radius: 13px;
          background: rgba(255,255,255,.93);
          box-shadow:
            0 7px 23px rgba(110,15,44,.035);
        }

        .gu-search {
          display: flex;
          align-items: center;
          overflow: hidden;
          transition: .3s ease;
        }

        .gu-search:focus-within {
          transform: translateY(-2px);
          border-color: #d98799;
          box-shadow:
            0 12px 28px rgba(139,21,56,.09),
            0 0 0 4px rgba(244,182,194,.13);
        }

        .gu-search > svg {
          flex: 0 0 auto;
          margin-inline: 15px 8px;
          color: var(--wine);
          transition: .3s ease;
        }

        .gu-search:focus-within > svg {
          transform: scale(1.12) rotate(-7deg);
        }

        .gu-search input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font: inherit;
        }

        .gu-search input::placeholder {
          color: #a99ca1;
        }

        .gu-clear {
          width: 30px;
          height: 30px;
          border: 0;
          background: transparent;
          color: var(--muted);
          font-size: 1.35rem;
          cursor: pointer;
        }

        .gu-search-button {
          height: 100%;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 19px;
          border: 0;
          background:
            linear-gradient(
              180deg,
              #8f1739,
              #6d0f2b
            );
          color: white;
          font-weight: 800;
          cursor: pointer;
          transition: .3s ease;
        }

        .gu-search-button:hover {
          filter: brightness(.92);
          padding-inline: 22px;
        }

        .gu-select-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
          padding-inline: 13px;
          transition: .3s ease;
        }

        .gu-select-wrap > svg {
          flex: 0 0 auto;
          color: var(--wine);
        }

        .gu-select-wrap:hover {
          transform: translateY(-2px);
          border-color: #d98799;
          box-shadow:
            0 10px 25px rgba(110,15,44,.07);
        }

        .gu-select-wrap select {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font: inherit;
          font-size: .84rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* TABLE CARD */

        .gu-table-card {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 21px;
          background: rgba(255,255,255,.96);
          box-shadow:
            0 15px 50px rgba(110,15,44,.065);
          animation: guTableIn .8s .46s both;
        }

        .gu-table-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              115deg,
              rgba(255,255,255,.5),
              transparent 23%,
              transparent 77%,
              rgba(244,182,194,.07)
            );
        }

        .gu-table-head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 21px 22px;
          border-bottom: 1px solid var(--line);
        }

        .gu-table-head h2 {
          margin: 0;
          color: var(--text);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 1.25rem;
        }

        .gu-table-head p {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: .76rem;
          font-weight: 700;
        }

        .gu-live {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 999px;
          background: #e9f8ef;
          color: #167342;
          font-size: .72rem;
          font-weight: 800;
        }

        .gu-live span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 0 4px rgba(22,115,66,.08);
          animation: guPulse 1.7s ease-in-out infinite;
        }

        .gu-table-wrap {
          position: relative;
          z-index: 1;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #d98799 transparent;
        }

        table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 16px 18px;
          text-align: start;
          border-bottom: 1px solid #f4e8eb;
          white-space: nowrap;
        }

        th {
          position: relative;
          background: #fdf8f9;
          color: #806f75;
          font-size: .69rem;
          font-weight: 900;
          letter-spacing: .035em;
        }

        th::after {
          content: "";
          position: absolute;
          bottom: 0;
          inset-inline: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(139,21,56,.18),
              transparent
            );
        }

        td {
          color: #4c3b40;
          font-size: .84rem;
        }

        tbody tr {
          opacity: 0;
          transform: translateY(13px);
          animation:
            guRowIn .55s
            cubic-bezier(.22,1,.36,1)
            forwards;
          transition:
            background .25s ease,
            transform .25s ease;
        }

        tbody tr:hover {
          background:
            linear-gradient(
              90deg,
              rgba(244,182,194,.08),
              rgba(255,255,255,.65),
              rgba(244,182,194,.05)
            );
          transform: translateX(
            ${isAr ? "-3px" : "3px"}
          );
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        /* USER */

        .gu-user {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .gu-avatar {
          position: relative;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          background: var(--wine-soft);
          color: var(--wine);
          box-shadow: 0 0 0 0 rgba(139,21,56,0);
          transition: .35s cubic-bezier(.22,1,.36,1);
        }

        .gu-avatar-ring {
          position: absolute;
          inset: -2px;
          border: 1px solid rgba(139,21,56,.22);
          border-radius: inherit;
          transform: scale(.8);
          opacity: 0;
          transition: .35s ease;
        }

        tbody tr:hover .gu-avatar {
          transform: scale(1.08) rotate(-3deg);
          box-shadow:
            0 8px 20px rgba(139,21,56,.14);
        }

        tbody tr:hover .gu-avatar-ring {
          transform: scale(1.08);
          opacity: 1;
        }

        .gu-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: .45s ease;
        }

        tbody tr:hover .gu-avatar img {
          transform: scale(1.08);
        }

        .gu-user-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .gu-user-info strong {
          color: var(--text);
          font-size: .87rem;
          transition: .25s ease;
        }

        tbody tr:hover .gu-user-info strong {
          color: var(--wine);
        }

        .gu-user-info small {
          color: #a4969b;
          font-size: .63rem;
        }

        .gu-email {
          color: #6f6065;
          transition: .25s ease;
        }

        tbody tr:hover .gu-email {
          color: var(--wine);
        }

        .gu-phone,
        .gu-date {
          color: #716368;
        }

        /* BADGES */

        .gu-role,
        .gu-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: .7rem;
          font-weight: 900;
          transition: .25s ease;
        }

        .gu-role.user {
          color: var(--wine);
          background: var(--wine-soft);
        }

        .gu-role.admin {
          color: #49337a;
          background: #eeeaf7;
        }

        .gu-status.active {
          color: #167342;
          background: #e9f8ef;
        }

        .gu-status.blocked {
          color: #b42318;
          background: #fdeaea;
        }

        tbody tr:hover .gu-role,
        tbody tr:hover .gu-status {
          transform: translateY(-1px);
          box-shadow:
            0 5px 14px rgba(0,0,0,.06);
        }

        .gu-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          animation: guPulse 1.8s ease-in-out infinite;
        }

        /* ACTIONS */

        .gu-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gu-action {
          position: relative;
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          transition:
            transform .3s cubic-bezier(.22,1,.36,1),
            box-shadow .3s ease,
            filter .3s ease;
        }

        .gu-action::before {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.5);
          transform: translate(-50%,-50%);
          transition: .45s ease;
        }

        .gu-action:hover::before {
          width: 90px;
          height: 90px;
        }

        .gu-action:hover {
          transform: translateY(-3px) scale(1.07);
          box-shadow:
            0 8px 18px rgba(40,20,25,.1);
          filter: saturate(1.08);
        }

        .gu-action:active {
          transform: translateY(-1px) scale(.96);
        }

        .gu-action svg {
          position: relative;
          z-index: 1;
        }

        .gu-action:disabled {
          opacity: .42;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .gu-action.warning {
          background: #fff3dc;
          color: #a76400;
        }

        .gu-action.success {
          background: #e9f8ef;
          color: #167342;
        }

        .gu-action.primary {
          background: var(--wine-soft);
          color: var(--wine);
        }

        .gu-action.neutral {
          background: #eeeaf7;
          color: #49337a;
        }

        .gu-action.danger {
          background: #fdeaea;
          color: #b42318;
        }

        /* PAGINATION */

        .gu-pagination {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 20px 20px 9px;
        }

        .gu-pagination > button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 13px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: white;
          color: var(--wine);
          font: inherit;
          font-size: .75rem;
          font-weight: 800;
          cursor: pointer;
          transition: .3s ease;
        }

        .gu-pagination > button:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: #d98799;
          box-shadow:
            0 8px 20px rgba(110,15,44,.08);
        }

        .gu-pagination > button:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .gu-pages {
          display: flex;
          gap: 5px;
        }

        .gu-pages button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--wine);
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: .3s ease;
        }

        .gu-pages button:hover {
          transform: translateY(-3px);
          background: var(--wine-soft);
        }

        .gu-pages button.active {
          background:
            linear-gradient(
              145deg,
              #8f1739,
              #6d0f2b
            );
          color: white;
          box-shadow:
            0 8px 20px rgba(139,21,56,.20);
        }

        .gu-page-info {
          position: relative;
          z-index: 1;
          padding-bottom: 17px;
          text-align: center;
          color: #95878c;
          font-size: .68rem;
          font-weight: 700;
        }

        /* LOADING */

        .gu-loading {
          min-height: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 13px;
          color: var(--muted);
        }

        .gu-spinner {
          width: 46px;
          height: 46px;
          border: 3px solid #f2dce1;
          border-top-color: var(--wine);
          border-radius: 50%;
          animation: guSpin .8s linear infinite;
        }

        .gu-loading strong {
          font-size: .85rem;
        }

        .gu-loading-line {
          width: 180px;
          height: 7px;
          border-radius: 99px;
          background:
            linear-gradient(
              90deg,
              #f6e8eb,
              #fff,
              #f6e8eb
            );
          background-size: 200% 100%;
          animation: guShimmer 1.2s infinite;
        }

        .gu-loading-line.short {
          width: 110px;
        }

        /* EMPTY */

        .gu-empty {
          min-height: 420px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 30px;
        }

        .gu-empty-icon {
          width: 75px;
          height: 75px;
          display: grid;
          place-items: center;
          border-radius: 22px;
          background: var(--wine-soft);
          color: var(--wine);
          animation: guEmpty 2.2s ease-in-out infinite;
        }

        .gu-empty h3 {
          margin: 19px 0 6px;
          color: var(--text);
          font-family: Georgia, serif;
          font-size: 1.35rem;
        }

        .gu-empty p {
          margin: 0;
          color: var(--muted);
          font-size: .8rem;
        }

        /* ERROR */

        .gu-error {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border: 1px solid #f0cfd4;
          border-radius: 17px;
          background: #fff7f8;
          color: #7e2434;
          box-shadow: 0 10px 30px rgba(139,21,56,.06);
          animation: guFadeUp .5s both;
        }

        .gu-error-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex: 0 0 44px;
          border-radius: 13px;
          background: #fdeaea;
          color: #b42318;
        }

        .gu-error > div:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }

        .gu-error strong {
          font-size: .84rem;
        }

        .gu-error span {
          color: #967b82;
          font-size: .75rem;
        }

        .gu-error button {
          padding: 9px 14px;
          border: 0;
          border-radius: 9px;
          background: var(--wine);
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        /* RESPONSIVE */

        @media (max-width: 1180px) {
          .gu-stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .gu-toolbar {
            grid-template-columns: 1fr 180px 180px;
          }
        }

        @media (max-width: 850px) {
          .gl-users-shell {
            width: min(94%, 700px);
            padding-top: 27px;
          }

          .gu-header {
            align-items: flex-start;
          }

          .gu-header-badge {
            display: none;
          }

          .gu-toolbar {
            grid-template-columns: 1fr 1fr;
          }

          .gu-search {
            grid-column: 1 / -1;
          }

          .gu-table-wrap {
            overflow: visible;
          }

          table {
            min-width: 0;
          }

          thead {
            display: none;
          }

          tbody,
          tr,
          td {
            display: block;
            width: 100%;
          }

          tbody tr {
            margin: 0;
            padding: 17px;
            border-bottom: 1px solid #f2e4e8;
            background: white;
          }

          tbody tr:hover {
            transform: none;
          }

          td {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            padding: 9px 0;
            border: 0;
            white-space: normal;
          }

          td::before {
            content: attr(data-label);
            flex: 0 0 95px;
            color: #95878c;
            font-size: .69rem;
            font-weight: 800;
          }

          td:first-child {
            padding-top: 0;
          }

          td:last-child {
            padding-bottom: 0;
          }

          .gu-actions {
            margin-inline-start: auto;
          }
        }

        @media (max-width: 650px) {
          .gl-users-shell {
            width: 92%;
          }

          .gu-title-row {
            align-items: flex-start;
          }

          .gu-title-icon {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
          }

          .gu-title-row h1 {
            font-size: 1.85rem;
          }

          .gu-title-row p {
            font-size: .78rem;
          }

          .gu-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .gu-stat:last-child {
            grid-column: 1 / -1;
          }

          .gu-toolbar {
            grid-template-columns: 1fr;
          }

          .gu-search {
            grid-column: auto;
          }

          .gu-pagination {
            gap: 8px;
          }

          .gu-pagination > button span {
            display: none;
          }
        }

        @media (max-width: 430px) {
          .gu-stats {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .gu-stat {
            min-height: 126px;
            padding: 15px;
            border-radius: 15px;
          }

          .gu-stat-value {
            font-size: 1.45rem;
          }

          .gu-stat-label {
            font-size: .7rem;
          }

          .gu-table-head {
            padding: 17px;
          }

          .gu-table-head h2 {
            font-size: 1.05rem;
          }

          .gu-live {
            font-size: .62rem;
          }

          .gu-pagination {
            flex-wrap: wrap;
          }

          .gu-pages {
            order: -1;
            width: 100%;
            justify-content: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gl-users-page *,
          .gl-users-page *::before,
          .gl-users-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }

        @keyframes guHeader {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes guIcon {
          from {
            opacity: 0;
            transform: scale(.65) rotate(-12deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes guStatIn {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes guTableIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes guRowIn {
          from {
            opacity: 0;
            transform: translateY(13px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes guFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes guFloat {
          0%, 100% {
            transform: translate3d(0,0,0);
          }
          50% {
            transform: translate3d(20px,-18px,0);
          }
        }

        @keyframes guPulse {
          0%, 100% {
            transform: scale(1);
            opacity: .8;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
        }

        @keyframes guSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes guShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes guEmpty {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </main>
  );
}