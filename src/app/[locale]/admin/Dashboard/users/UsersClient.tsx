"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

    search: "بحث بالاسم أو البريد أو الهاتف...",
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
    loading: "جاري تحميل المستخدمين...",
    error: "حدث خطأ أثناء تحميل المستخدمين",
    retry: "إعادة المحاولة",

    previous: "السابق",
    next: "التالي",
    page: "صفحة",

    confirmDelete:
      "هل أنت متأكد من حذف هذا المستخدم؟ سيتم إخفاؤه من النظام.",
    confirmBlock: "هل تريد حظر هذا المستخدم؟",
    confirmUnblock: "هل تريد إلغاء حظر هذا المستخدم؟",
    confirmAdmin: "هل تريد تحويل هذا المستخدم إلى مدير؟",
    confirmUser: "هل تريد تحويل هذا المدير إلى مستخدم؟",

    updateSuccess: "تم تحديث المستخدم بنجاح",
    deleteSuccess: "تم حذف المستخدم بنجاح",
    operationFailed: "فشلت العملية",
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
    loading: "Loading users...",
    error: "Failed to load users",
    retry: "Retry",

    previous: "Previous",
    next: "Next",
    page: "Page",

    confirmDelete:
      "Are you sure you want to delete this user? The account will be hidden from the system.",
    confirmBlock: "Do you want to block this user?",
    confirmUnblock: "Do you want to unblock this user?",
    confirmAdmin: "Do you want to make this user an admin?",
    confirmUser: "Do you want to change this admin to a user?",

    updateSuccess: "User updated successfully",
    deleteSuccess: "User deleted successfully",
    operationFailed: "Operation failed",
  },
};

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
}

export default function AdminUsersPage() {
  const params = useParams();
  const router = useRouter();

  const locale: Locale =
    params.locale === "en" ? "en" : "ar";

  const t = translations[locale];

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    admins: 0,
    users: 0,
    blocked: 0,
    active: 0,
  });

  const [pagination, setPagination] =
    useState<Pagination>({
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
          throw new Error(
            result.message || t.error
          );
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
            result.message || t.operationFailed
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
          result.message || t.operationFailed
        );
      }

      await fetchUsers(pagination.page);
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error
          ? err.message
          : t.operationFailed
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
      dir={locale === "ar" ? "rtl" : "ltr"}
    >

      <section className="gl-users-shell">
        <div className="gl-users-head">
          <div>
            <button
              type="button"
              className="gl-back"
              onClick={() =>
                router.push(
                  `/${locale}/admin/dashboard`
                )
              }
            >
              <i
                className={
                  locale === "ar"
                    ? "bi bi-arrow-right"
                    : "bi bi-arrow-left"
                }
              />
              <span>
                {locale === "ar"
                  ? "لوحة التحكم"
                  : "Dashboard"}
              </span>
            </button>

            <h1>{t.title}</h1>

            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="gl-stats">
          <StatCard
            icon="bi-people"
            label={t.total}
            value={stats.total}
          />

          <StatCard
            icon="bi-person-check"
            label={t.users}
            value={stats.users}
          />

          <StatCard
            icon="bi-shield-check"
            label={t.admins}
            value={stats.admins}
          />

          <StatCard
            icon="bi-person-check-fill"
            label={t.active}
            value={stats.active}
          />

          <StatCard
            icon="bi-person-lock"
            label={t.blocked}
            value={stats.blocked}
          />
        </div>

        <section className="gl-filters">
          <div className="gl-search">
            <i className="bi bi-search" />

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

            <button
              type="button"
              onClick={handleSearch}
            >
              {locale === "ar"
                ? "بحث"
                : "Search"}
            </button>
          </div>

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
            }}
          >
            <option value="all">
              {t.allRoles}
            </option>

            <option value="user">
              {t.user}
            </option>

            <option value="admin">
              {t.admin}
            </option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
            }}
          >
            <option value="all">
              {t.allStatus}
            </option>

            <option value="active">
              {t.activeStatus}
            </option>

            <option value="blocked">
              {t.blockedStatus}
            </option>
          </select>
        </section>

        {error ? (
          <section className="gl-error">
            <i className="bi bi-exclamation-triangle" />

            <span>{error}</span>

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
          <section className="gl-table-card">
            {loading ? (
              <div className="gl-loading">
                <div className="gl-spinner" />
                <span>{t.loading}</span>
              </div>
            ) : users.length === 0 ? (
              <div className="gl-empty">
                <i className="bi bi-people" />
                <h3>{t.noUsers}</h3>
              </div>
            ) : (
              <>
                <div className="gl-table-wrap">
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
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="gl-user-cell">
                              <div className="gl-avatar">
                                {user.profileImage?.url ? (
                                  <img
                                    src={
                                      user.profileImage.url
                                    }
                                    alt={user.fullName}
                                  />
                                ) : (
                                  <i className="bi bi-person" />
                                )}
                              </div>

                              <strong>
                                {user.fullName}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span className="gl-email">
                              {user.email}
                            </span>
                          </td>

                          <td>
                            {user.phone || "—"}
                          </td>

                          <td>
                            <span
                              className={`gl-role ${
                                user.role === "admin"
                                  ? "admin"
                                  : "user"
                              }`}
                            >
                              {user.role === "admin"
                                ? t.admin
                                : t.user}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`gl-status ${
                                user.isBlocked
                                  ? "blocked"
                                  : "active"
                              }`}
                            >
                              <span />
                              {user.isBlocked
                                ? t.blockedUser
                                : t.activeUser}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              user.createdAt,
                              locale
                            )}
                          </td>

                          <td>
                            <div className="gl-actions">
                              {user.isBlocked ? (
                                <button
                                  type="button"
                                  className="success"
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
                                  <i className="bi bi-unlock" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="warning"
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
                                  <i className="bi bi-lock" />
                                </button>
                              )}

                              {user.role === "admin" ? (
                                <button
                                  type="button"
                                  className="neutral"
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
                                  <i className="bi bi-person" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="primary"
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
                                  <i className="bi bi-shield-check" />
                                </button>
                              )}

                              <button
                                type="button"
                                className="danger"
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
                                <i className="bi bi-trash3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="gl-pagination">
                  <button
                    type="button"
                    disabled={
                      pagination.page <= 1 ||
                      loading
                    }
                    onClick={() =>
                      fetchUsers(
                        pagination.page - 1
                      )
                    }
                  >
                    <i
                      className={
                        locale === "ar"
                          ? "bi bi-chevron-right"
                          : "bi bi-chevron-left"
                      }
                    />
                    {t.previous}
                  </button>

                  <div className="gl-pages">
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
                    {t.next}
                    <i
                      className={
                        locale === "ar"
                          ? "bi bi-chevron-left"
                          : "bi bi-chevron-right"
                      }
                    />
                  </button>
                </div>

                <div className="gl-page-info">
                  {t.page} {pagination.page}{" "}
                  {locale === "ar"
                    ? "من"
                    : "of"}{" "}
                  {pagination.totalPages}
                </div>
              </>
            )}
          </section>
        )}
      </section>

      <style jsx>{`
        .gl-users-page {
          min-height: 100vh;
          background: #faf7f8;
          color: #2a1a1f;
        }

        .gl-users-shell {
          width: min(1500px, 94%);
          margin: 0 auto;
          padding: 42px 0 70px;
        }

        .gl-users-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .gl-users-head h1 {
          margin: 14px 0 6px;
          font-family: Georgia, serif;
          font-size: clamp(2rem, 3vw, 3rem);
          font-weight: 700;
          color: #6e0f2c;
        }

        .gl-users-head p {
          margin: 0;
          color: #7a6a6f;
          font-size: 0.95rem;
        }

        .gl-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          padding: 0;
          color: #8b1538;
          font-weight: 700;
          cursor: pointer;
        }

        .gl-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .gl-stat {
          min-height: 125px;
          padding: 22px;
          border: 1px solid #f0dfe3;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 10px 35px rgba(110, 15, 44, 0.05);
        }

        .gl-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .gl-stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #fbe4e8;
          color: #8b1538;
          font-size: 1.2rem;
        }

        .gl-stat strong {
          display: block;
          margin-top: 16px;
          font-size: 1.7rem;
          color: #2a1a1f;
        }

        .gl-stat span {
          color: #7a6a6f;
          font-size: 0.82rem;
        }

        .gl-filters {
          display: grid;
          grid-template-columns: minmax(300px, 1fr) 190px 190px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .gl-search {
          height: 48px;
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #f0dfe3;
          border-radius: 12px;
          background: #fff;
        }

        .gl-search > i {
          margin-inline: 15px 8px;
          color: #8b1538;
        }

        .gl-search input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #2a1a1f;
        }

        .gl-search button {
          height: 100%;
          border: 0;
          padding: 0 20px;
          background: #8b1538;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .gl-filters select {
          height: 48px;
          padding: 0 14px;
          border: 1px solid #f0dfe3;
          border-radius: 12px;
          outline: 0;
          background: #fff;
          color: #2a1a1f;
          cursor: pointer;
        }

        .gl-table-card {
          overflow: hidden;
          border: 1px solid #f0dfe3;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(110, 15, 44, 0.06);
        }

        .gl-table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 17px 18px;
          text-align: start;
          border-bottom: 1px solid #f4e8eb;
          white-space: nowrap;
        }

        th {
          background: #fdf8f9;
          color: #7a6a6f;
          font-size: 0.78rem;
          font-weight: 800;
        }

        td {
          color: #4c3b40;
          font-size: 0.88rem;
        }

        tbody tr:hover {
          background: #fffafb;
        }

        .gl-user-cell {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .gl-user-cell strong {
          color: #2a1a1f;
        }

        .gl-avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          overflow: hidden;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fbe4e8;
          color: #8b1538;
          font-size: 1.1rem;
        }

        .gl-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gl-email {
          color: #6f6065;
        }

        .gl-role,
        .gl-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.73rem;
          font-weight: 800;
        }

        .gl-role.user {
          background: #fbe4e8;
          color: #8b1538;
        }

        .gl-role.admin {
          background: #eeeaf7;
          color: #49337a;
        }

        .gl-status.active {
          background: #e9f8ef;
          color: #167342;
        }

        .gl-status.blocked {
          background: #fdeaea;
          color: #b42318;
        }

        .gl-status > span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .gl-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .gl-actions button {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .gl-actions button:hover {
          transform: translateY(-1px);
        }

        .gl-actions button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .gl-actions .warning {
          background: #fff3dc;
          color: #a76400;
        }

        .gl-actions .success {
          background: #e9f8ef;
          color: #167342;
        }

        .gl-actions .primary {
          background: #fbe4e8;
          color: #8b1538;
        }

        .gl-actions .neutral {
          background: #eeeaf7;
          color: #49337a;
        }

        .gl-actions .danger {
          background: #fdeaea;
          color: #b42318;
        }

        .gl-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 20px;
        }

        .gl-pagination > button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #f0dfe3;
          border-radius: 10px;
          padding: 9px 13px;
          background: #fff;
          color: #6e0f2c;
          cursor: pointer;
        }

        .gl-pagination > button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .gl-pages {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .gl-pages button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #6e0f2c;
          cursor: pointer;
        }

        .gl-pages button.active {
          background: #8b1538;
          color: #fff;
        }

        .gl-page-info {
          padding: 0 20px 18px;
          text-align: center;
          color: #7a6a6f;
          font-size: 0.78rem;
        }

        .gl-loading,
        .gl-empty {
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          color: #7a6a6f;
        }

        .gl-empty i {
          font-size: 3rem;
          color: #dca1af;
        }

        .gl-empty h3 {
          margin: 0;
          color: #6e0f2c;
        }

        .gl-spinner {
          width: 38px;
          height: 38px;
          border: 3px solid #f0dfe3;
          border-top-color: #8b1538;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .gl-error {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          border: 1px solid #f3caca;
          border-radius: 20px;
          background: #fff;
          color: #b42318;
        }

        .gl-error i {
          font-size: 2rem;
        }

        .gl-error button {
          border: 0;
          border-radius: 9px;
          padding: 9px 16px;
          background: #8b1538;
          color: #fff;
          cursor: pointer;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        :global(.dark) .gl-users-page {
          background: #080b14;
          color: #f8f4f5;
        }

        :global(.dark) .gl-users-head h1 {
          color: #f4b6c2;
        }

        :global(.dark) .gl-users-head p,
        :global(.dark) .gl-stat span,
        :global(.dark) .gl-email,
        :global(.dark) .gl-page-info {
          color: #a9a0a4;
        }

        :global(.dark) .gl-stat,
        :global(.dark) .gl-table-card,
        :global(.dark) .gl-search,
        :global(.dark) .gl-filters select,
        :global(.dark) .gl-pagination > button,
        :global(.dark) .gl-error {
          background: #101522;
          border-color: #252b3b;
          color: #f8f4f5;
        }

        :global(.dark) .gl-stat strong,
        :global(.dark) .gl-user-cell strong,
        :global(.dark) td {
          color: #f8f4f5;
        }

        :global(.dark) .gl-search input,
        :global(.dark) .gl-filters select {
          color: #f8f4f5;
        }

        :global(.dark) th {
          background: #151b2a;
          color: #aaa2a6;
        }

        :global(.dark) th,
        :global(.dark) td {
          border-color: #252b3b;
        }

        :global(.dark) tbody tr:hover {
          background: #141a27;
        }

        :global(.dark) .gl-role.user {
          background: #301722;
          color: #f4b6c2;
        }

        :global(.dark) .gl-status.active {
          background: #10291d;
        }

        :global(.dark) .gl-status.blocked {
          background: #32191b;
        }

        :global(.dark) .gl-avatar,
        :global(.dark) .gl-stat-icon {
          background: #301722;
          color: #f4b6c2;
        }

        @media (max-width: 1100px) {
          .gl-stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .gl-filters {
            grid-template-columns: 1fr 1fr;
          }

          .gl-search {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 700px) {
          .gl-users-shell {
            width: 92%;
            padding-top: 28px;
          }

          .gl-users-head h1 {
            font-size: 1.8rem;
          }

          .gl-stats {
            grid-template-columns: 1fr 1fr;
          }

          .gl-filters {
            grid-template-columns: 1fr;
          }

          .gl-search {
            grid-column: auto;
          }

          .gl-pagination {
            gap: 8px;
          }

          .gl-pagination > button {
            padding: 8px 10px;
          }
        }

        @media (max-width: 450px) {
          .gl-stats {
            grid-template-columns: 1fr;
          }

          .gl-pagination > button {
            font-size: 0;
          }

          .gl-pagination > button i {
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <article className="gl-stat">
      <div className="gl-stat-top">
        <span className="gl-stat-icon">
          <i className={`bi ${icon}`} />
        </span>
      </div>

      <strong>
        {value.toLocaleString()}
      </strong>

      <span>{label}</span>
    </article>
  );
}