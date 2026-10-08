"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Camera,
  Check,
  ChevronRight,
  Edit3,
  Heart,
  LogOut,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../../components/providers/AuthProvider";

type Locale = "ar" | "en";

interface ProfileClientProps {
  locale: Locale;
}

interface Address {
  governorate: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  postalCode: string;
  notes: string;
}

const emptyAddress: Address = {
  governorate: "",
  city: "",
  area: "",
  street: "",
  building: "",
  floor: "",
  apartment: "",
  postalCode: "",
  notes: "",
};

export default function ProfileClient({
  locale,
}: ProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { user, loading, refreshUser, logout } =
    useAuth();

  const isArabic = locale === "ar";

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [address, setAddress] =
    useState<Address>(emptyAddress);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewImage, setPreviewImage] =
    useState("");

  const [removeImage, setRemoveImage] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const text = {
    ar: {
      profile: "الملف الشخصي",
      account: "حسابي",
      personalInfo: "المعلومات الشخصية",
      personalDescription:
        "إدارة معلومات حسابك وبيانات التواصل الخاصة بك.",
      fullName: "الاسم بالكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      address: "عنوان التوصيل",
      addressDescription:
        "استخدم عنوانًا واضحًا ودقيقًا لضمان وصول طلباتك بشكل صحيح.",
      governorate: "المحافظة",
      city: "المدينة / المركز",
      area: "المنطقة",
      street: "الشارع",
      building: "رقم المبنى",
      floor: "الدور",
      apartment: "رقم الشقة",
      postalCode: "الرمز البريدي",
      notes: "ملاحظات إضافية",
      edit: "تعديل البيانات",
      save: "حفظ التعديلات",
      cancel: "إلغاء",
      changePhoto: "تغيير الصورة",
      removePhoto: "حذف الصورة",
      noPhoto: "لا توجد صورة",
      orders: "طلباتي",
      favorites: "المفضلة",
      security: "الحساب محمي",
      securityDescription:
        "بيانات حسابك محفوظة ومؤمنة.",
      logout: "تسجيل الخروج",
      saving: "جاري الحفظ...",
      loggingOut: "جاري تسجيل الخروج...",
      loading: "جاري تحميل الحساب...",
      success: "تم حفظ بيانات الحساب بنجاح.",
      error: "حدث خطأ أثناء حفظ البيانات.",
      imageError:
        "يرجى اختيار صورة صحيحة بحجم لا يتجاوز 5MB.",
      requiredName: "الاسم مطلوب.",
      requiredPhone: "رقم الهاتف مطلوب.",
      addressEmpty: "لم تتم إضافة عنوان بعد.",
      notAvailable: "غير متوفر",
      accountType: "نوع الحساب",
      customer: "عميل",
      admin: "مدير",
    },

    en: {
      profile: "Profile",
      account: "My Account",
      personalInfo: "Personal Information",
      personalDescription:
        "Manage your account information and contact details.",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Delivery Address",
      addressDescription:
        "Use a clear and accurate address to make sure your orders arrive correctly.",
      governorate: "Governorate",
      city: "City",
      area: "Area",
      street: "Street",
      building: "Building",
      floor: "Floor",
      apartment: "Apartment",
      postalCode: "Postal Code",
      notes: "Additional Notes",
      edit: "Edit Information",
      save: "Save Changes",
      cancel: "Cancel",
      changePhoto: "Change Photo",
      removePhoto: "Remove Photo",
      noPhoto: "No photo",
      orders: "My Orders",
      favorites: "Favorites",
      security: "Account Protected",
      securityDescription:
        "Your account information is securely stored.",
      logout: "Logout",
      saving: "Saving...",
      loggingOut: "Logging out...",
      loading: "Loading account...",
      success: "Your account information has been updated.",
      error: "Something went wrong while saving your information.",
      imageError:
        "Please choose a valid image smaller than 5MB.",
      requiredName: "Name is required.",
      requiredPhone: "Phone number is required.",
      addressEmpty: "No address has been added yet.",
      notAvailable: "Not available",
      accountType: "Account Type",
      customer: "Customer",
      admin: "Admin",
    },
  }[locale];

  useEffect(() => {
    if (!user) return;

    setFullName(user.fullName || "");
    setPhone(user.phone || "");

    setAddress({
      governorate: user.address?.governorate || "",
      city: user.address?.city || "",
      area: user.address?.area || "",
      street: user.address?.street || "",
      building: user.address?.building || "",
      floor: user.address?.floor || "",
      apartment: user.address?.apartment || "",
      postalCode: user.address?.postalCode || "",
      notes: user.address?.notes || "",
    });

    setPreviewImage(user.profileImage?.url || "");
  }, [user]);

  function updateAddress(
    field: keyof Address,
    value: string
  ) {
    setAddress((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/") ||
      file.size > 5 * 1024 * 1024
    ) {
      setError(text.imageError);
      return;
    }

    setError("");
    setMessage("");

    setSelectedImage(file);
    setRemoveImage(false);

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
  }

  function handleRemoveImage() {
    setSelectedImage(null);
    setRemoveImage(true);
    setPreviewImage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function cancelEditing() {
    if (!user) return;

    setFullName(user.fullName || "");
    setPhone(user.phone || "");

    setAddress({
      governorate: user.address?.governorate || "",
      city: user.address?.city || "",
      area: user.address?.area || "",
      street: user.address?.street || "",
      building: user.address?.building || "",
      floor: user.address?.floor || "",
      apartment: user.address?.apartment || "",
      postalCode: user.address?.postalCode || "",
      notes: user.address?.notes || "",
    });

    setSelectedImage(null);
    setRemoveImage(false);
    setPreviewImage(user.profileImage?.url || "");

    setError("");
    setMessage("");
    setEditing(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!fullName.trim()) {
      setError(text.requiredName);
      return;
    }

    if (!phone.trim()) {
      setError(text.requiredPhone);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("fullName", fullName.trim());
      formData.append("phone", phone.trim());

      formData.append(
        "governorate",
        address.governorate.trim()
      );

      formData.append(
        "city",
        address.city.trim()
      );

      formData.append(
        "area",
        address.area.trim()
      );

      formData.append(
        "street",
        address.street.trim()
      );

      formData.append(
        "building",
        address.building.trim()
      );

      formData.append(
        "floor",
        address.floor.trim()
      );

      formData.append(
        "apartment",
        address.apartment.trim()
      );

      formData.append(
        "postalCode",
        address.postalCode.trim()
      );

      formData.append(
        "notes",
        address.notes.trim()
      );

      if (selectedImage) {
        formData.append(
          "profileImage",
          selectedImage
        );
      }

      if (removeImage) {
        formData.append("removeProfileImage", "true");
      }

      const response = await fetch(
        "/api/profile",
        {
          method: "PATCH",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || text.error
        );
      }

      await refreshUser();

      setMessage(
        data.message || text.success
      );

      setSelectedImage(null);
      setRemoveImage(false);
      setEditing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : text.error
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();

      router.replace(`/${locale}/login`);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading || !user) {
    return (
      <main
        dir={isArabic ? "rtl" : "ltr"}
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background:
            "linear-gradient(135deg,#fff,#fdf0f3)",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{
              color: "#8b1538",
              width: 42,
              height: 42,
            }}
          />

          <div
            className="fw-semibold"
            style={{ color: "#8b1538" }}
          >
            {text.loading}
          </div>
        </div>
      </main>
    );
  }

  const addressParts = [
    address.governorate,
    address.city,
    address.area,
    address.street,
    address.building
      ? `${text.building}: ${address.building}`
      : "",
    address.floor
      ? `${text.floor}: ${address.floor}`
      : "",
    address.apartment
      ? `${text.apartment}: ${address.apartment}`
      : "",
  ].filter(Boolean);

  const hasAddress = addressParts.length > 0;

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-vh-100"
      style={{
        background:
          "linear-gradient(135deg,#fff 0%,#fff8fa 55%,#fbe4e8 100%)",
      }}
    >
      <style>{`
        .gl-profile-shell {
          width: min(1180px, 92%);
          margin: 0 auto;
          padding: 42px 0 70px;
        }

        .gl-profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .gl-profile-title {
          color: #2a1a1f;
          font-family: Georgia, serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin: 0;
        }

        .gl-profile-subtitle {
          color: #7a6a6f;
          margin: 7px 0 0;
          font-size: .95rem;
        }

        .gl-profile-grid {
          display: grid;
          grid-template-columns: 310px minmax(0,1fr);
          gap: 22px;
          align-items: start;
        }

        .gl-profile-card {
          background: rgba(255,255,255,.88);
          border: 1px solid #f0dfe3;
          border-radius: 24px;
          box-shadow: 0 18px 55px rgba(76,22,40,.09);
          backdrop-filter: blur(12px);
        }

        .gl-profile-sidebar {
          padding: 28px 22px;
          position: sticky;
          top: 90px;
        }

        .gl-profile-avatar {
          width: 112px;
          height: 112px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 17px;
          border: 4px solid #fbe4e8;
          background: #fbe4e8;
          position: relative;
        }

        .gl-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gl-profile-avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b1538;
          background: #fbe4e8;
        }

        .gl-profile-name {
          color: #2a1a1f;
          font-size: 1.12rem;
          font-weight: 800;
          text-align: center;
        }

        .gl-profile-email {
          color: #7a6a6f;
          text-align: center;
          font-size: .82rem;
          word-break: break-word;
          margin-top: 4px;
        }

        .gl-profile-menu {
          display: grid;
          gap: 8px;
          margin-top: 26px;
        }

        .gl-profile-menu-link {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 12px 14px;
          border-radius: 13px;
          text-decoration: none;
          color: #5f4c53;
          font-weight: 650;
          transition: .2s ease;
        }

        .gl-profile-menu-link:hover {
          color: #8b1538;
          background: #fdf0f3;
        }

        .gl-profile-menu-link.active {
          color: #8b1538;
          background: #fbe4e8;
        }

        .gl-profile-main {
          padding: 30px;
        }

        .gl-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .gl-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2a1a1f;
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
        }

        .gl-section-description {
          color: #7a6a6f;
          font-size: .84rem;
          margin: 5px 0 0;
        }

        .gl-edit-btn {
          border: 1px solid #8b1538;
          background: #8b1538;
          color: white;
          border-radius: 11px;
          padding: 10px 15px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: .2s ease;
        }

        .gl-edit-btn:hover {
          background: #6e0f2c;
          border-color: #6e0f2c;
        }

        .gl-field {
          margin-bottom: 18px;
        }

        .gl-field label {
          display: block;
          color: #49383e;
          font-size: .82rem;
          font-weight: 750;
          margin-bottom: 7px;
        }

        .gl-input {
          width: 100%;
          min-height: 46px;
          border: 1px solid #ead8dd;
          border-radius: 11px;
          padding: 10px 13px;
          outline: none;
          color: #2a1a1f;
          background: #fff;
          transition: .2s ease;
        }

        .gl-input:focus {
          border-color: #8b1538;
          box-shadow: 0 0 0 3px rgba(139,21,56,.09);
        }

        .gl-input:disabled {
          background: #faf6f7;
          color: #8b7c82;
          cursor: not-allowed;
        }

        .gl-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .gl-address-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 0 16px;
        }

        .gl-message {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 14px;
          border-radius: 11px;
          margin-bottom: 18px;
          font-size: .88rem;
          font-weight: 650;
        }

        .gl-message.success {
          background: #edf9f2;
          color: #19733e;
          border: 1px solid #ccebd8;
        }

        .gl-message.error {
          background: #fff0f1;
          color: #a31f3d;
          border: 1px solid #f2cbd2;
        }

        .gl-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }

        .gl-action {
          min-height: 45px;
          border-radius: 11px;
          padding: 0 17px;
          border: 1px solid transparent;
          font-weight: 750;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
        }

        .gl-action-primary {
          background: #8b1538;
          color: white;
        }

        .gl-action-primary:hover {
          background: #6e0f2c;
        }

        .gl-action-secondary {
          background: white;
          color: #5e4c53;
          border-color: #ead8dd;
        }

        .gl-photo-actions {
          display: flex;
          justify-content: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .gl-photo-btn {
          border: 1px solid #ead8dd;
          background: white;
          color: #6e0f2c;
          border-radius: 9px;
          padding: 7px 10px;
          font-size: .75rem;
          font-weight: 750;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .gl-photo-btn.danger {
          color: #a31f3d;
        }

        .gl-info-box {
          background: #fff8fa;
          border: 1px solid #f0dfe3;
          border-radius: 14px;
          padding: 15px;
          margin-top: 22px;
        }

        .gl-info-box-title {
          color: #8b1538;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: .84rem;
        }

        .gl-info-box-text {
          color: #7a6a6f;
          font-size: .77rem;
          margin: 6px 0 0;
          line-height: 1.7;
        }

        .gl-view-value {
          color: #2a1a1f;
          font-weight: 650;
          min-height: 46px;
          display: flex;
          align-items: center;
        }

        .gl-address-view {
          padding: 16px;
          border-radius: 14px;
          background: #fff8fa;
          border: 1px solid #f0dfe3;
          color: #5f4c53;
          line-height: 1.9;
          min-height: 90px;
        }

        .gl-dark {
          background: #0b1020 !important;
        }

        .gl-dark .gl-profile-title,
        .gl-dark .gl-section-title,
        .gl-dark .gl-profile-name,
        .gl-dark .gl-field label,
        .gl-dark .gl-view-value {
          color: #f8edf0;
        }

        .gl-dark .gl-profile-subtitle,
        .gl-dark .gl-section-description,
        .gl-dark .gl-profile-email,
        .gl-dark .gl-profile-menu-link,
        .gl-dark .gl-address-view {
          color: #c7bac0;
        }

        .gl-dark .gl-profile-card {
          background: #111827;
          border-color: #293248;
          box-shadow: 0 18px 55px rgba(0,0,0,.28);
        }

        .gl-dark .gl-profile-menu-link:hover,
        .gl-dark .gl-profile-menu-link.active {
          background: #251522;
          color: #f4b6c2;
        }

        .gl-dark .gl-input {
          background: #0d1425;
          color: #f8edf0;
          border-color: #30394f;
        }

        .gl-dark .gl-input:disabled {
          background: #161d2c;
          color: #91868c;
        }

        .gl-dark .gl-action-secondary,
        .gl-dark .gl-photo-btn {
          background: #111827;
          color: #f4b6c2;
          border-color: #30394f;
        }

        .gl-dark .gl-info-box,
        .gl-dark .gl-address-view {
          background: #151827;
          border-color: #30394f;
        }

        @media (max-width: 900px) {
          .gl-profile-grid {
            grid-template-columns: 1fr;
          }

          .gl-profile-sidebar {
            position: static;
          }

          .gl-profile-menu {
            grid-template-columns: repeat(3,1fr);
          }
        }

        @media (max-width: 650px) {
          .gl-profile-shell {
            width: 94%;
            padding-top: 25px;
          }

          .gl-profile-header {
            align-items: flex-start;
          }

          .gl-profile-title {
            font-size: 2rem;
          }

          .gl-profile-main,
          .gl-profile-sidebar {
            padding: 21px 17px;
          }

          .gl-address-grid {
            grid-template-columns: 1fr;
          }

          .gl-profile-menu {
            grid-template-columns: 1fr;
          }

          .gl-section-head {
            align-items: flex-start;
          }

          .gl-actions {
            flex-direction: column-reverse;
          }

          .gl-action {
            width: 100%;
          }
        }
      `}</style>

      <div
        className={`gl-profile-shell ${
          document.documentElement.classList.contains(
            "dark"
          )
            ? "gl-dark"
            : ""
        }`}
      >
        {/* HEADER */}

        <div className="gl-profile-header">
          <div>
            <h1 className="gl-profile-title">
              {text.profile}
            </h1>

            <p className="gl-profile-subtitle">
              {text.account}
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              className="gl-edit-btn"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
            >
              <Edit3 size={16} />
              {text.edit}
            </button>
          )}
        </div>

        {message && (
          <div className="gl-message success">
            <Check size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="gl-message error">
            <X size={18} />
            {error}
          </div>
        )}

        <div className="gl-profile-grid">
          {/* SIDEBAR */}

          <aside className="gl-profile-card gl-profile-sidebar">
            <div className="gl-profile-avatar">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={user.fullName}
                  width={112}
                  height={112}
                  unoptimized
                />
              ) : (
                <div className="gl-profile-avatar-placeholder">
                  <UserRound size={48} />
                </div>
              )}
            </div>

            {editing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />

                <div className="gl-photo-actions">
                  <button
                    type="button"
                    className="gl-photo-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Camera size={14} />
                    {text.changePhoto}
                  </button>

                  {previewImage && (
                    <button
                      type="button"
                      className="gl-photo-btn danger"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 size={14} />
                      {text.removePhoto}
                    </button>
                  )}
                </div>
              </>
            )}

            <div
              className="gl-profile-name"
              style={{ marginTop: 17 }}
            >
              {user.fullName}
            </div>

            <div className="gl-profile-email">
              {user.email}
            </div>

            <div className="gl-profile-menu">
              <Link
                href={`/${locale}/profile`}
                className="gl-profile-menu-link active"
              >
                <UserRound size={18} />
                {text.profile}
              </Link>

              <Link
                href={`/${locale}/orders`}
                className="gl-profile-menu-link"
              >
                <Package size={18} />
                {text.orders}
              </Link>

              <Link
                href={`/${locale}/favorites`}
                className="gl-profile-menu-link"
              >
                <Heart size={18} />
                {text.favorites}
              </Link>
            </div>

            <div className="gl-info-box">
              <div className="gl-info-box-title">
                <ShieldCheck size={17} />
                {text.security}
              </div>

              <p className="gl-info-box-text">
                {text.securityDescription}
              </p>
            </div>

            <button
              type="button"
              className="gl-profile-menu-link"
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                marginTop: 8,
              }}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={18} />

              {loggingOut
                ? text.loggingOut
                : text.logout}
            </button>
          </aside>

          {/* MAIN */}

          <section className="gl-profile-card gl-profile-main">
            <form onSubmit={handleSubmit}>
              {/* PERSONAL */}

              <div className="gl-section-head">
                <div>
                  <h2 className="gl-section-title">
                    <UserRound
                      size={19}
                      color="#8b1538"
                    />

                    {text.personalInfo}
                  </h2>

                  <p className="gl-section-description">
                    {text.personalDescription}
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="gl-field">
                    <label>{text.fullName}</label>

                    {editing ? (
                      <input
                        className="gl-input"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                      />
                    ) : (
                      <div className="gl-view-value">
                        {user.fullName ||
                          text.notAvailable}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="gl-field">
                    <label>{text.email}</label>

                    <input
                      className="gl-input"
                      value={user.email}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="gl-field">
                    <label>
                      <Phone
                        size={14}
                        style={{
                          display: "inline",
                          marginInlineEnd: 5,
                        }}
                      />
                      {text.phone}
                    </label>

                    {editing ? (
                      <input
                        className="gl-input"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                      />
                    ) : (
                      <div className="gl-view-value">
                        {user.phone ||
                          text.notAvailable}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="gl-field">
                    <label>
                      {text.accountType}
                    </label>

                    <div className="gl-view-value">
                      {user.role === "admin"
                        ? text.admin
                        : text.customer}
                    </div>
                  </div>
                </div>
              </div>

              <hr
                style={{
                  borderColor: "#f0dfe3",
                  margin: "8px 0 28px",
                }}
              />

              {/* ADDRESS */}

              <div className="gl-section-head">
                <div>
                  <h2 className="gl-section-title">
                    <MapPin
                      size={19}
                      color="#8b1538"
                    />

                    {text.address}
                  </h2>

                  <p className="gl-section-description">
                    {text.addressDescription}
                  </p>
                </div>
              </div>

              {!editing ? (
                <div className="gl-address-view">
                  {hasAddress ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                        }}
                      >
                        <MapPin
                          size={18}
                          color="#8b1538"
                          style={{
                            marginTop: 4,
                            flexShrink: 0,
                          }}
                        />

                        <div>
                          {addressParts.map(
                            (part, index) => (
                              <div key={index}>
                                {part}
                              </div>
                            )
                          )}

                          {address.postalCode && (
                            <div>
                              {text.postalCode}:{" "}
                              {address.postalCode}
                            </div>
                          )}

                          {address.notes && (
                            <div
                              style={{
                                marginTop: 7,
                                color: "#7a6a6f",
                              }}
                            >
                              {address.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    text.addressEmpty
                  )}
                </div>
              ) : (
                <>
                  <div className="gl-address-grid">
                    <div className="gl-field">
                      <label>
                        {text.governorate}
                      </label>

                      <input
                        className="gl-input"
                        value={address.governorate}
                        onChange={(e) =>
                          updateAddress(
                            "governorate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>{text.city}</label>

                      <input
                        className="gl-input"
                        value={address.city}
                        onChange={(e) =>
                          updateAddress(
                            "city",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>{text.area}</label>

                      <input
                        className="gl-input"
                        value={address.area}
                        onChange={(e) =>
                          updateAddress(
                            "area",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>{text.street}</label>

                      <input
                        className="gl-input"
                        value={address.street}
                        onChange={(e) =>
                          updateAddress(
                            "street",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>{text.building}</label>

                      <input
                        className="gl-input"
                        value={address.building}
                        onChange={(e) =>
                          updateAddress(
                            "building",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>{text.floor}</label>

                      <input
                        className="gl-input"
                        value={address.floor}
                        onChange={(e) =>
                          updateAddress(
                            "floor",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>{text.apartment}</label>

                      <input
                        className="gl-input"
                        value={address.apartment}
                        onChange={(e) =>
                          updateAddress(
                            "apartment",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="gl-field">
                      <label>
                        {text.postalCode}
                      </label>

                      <input
                        className="gl-input"
                        value={address.postalCode}
                        onChange={(e) =>
                          updateAddress(
                            "postalCode",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="gl-field">
                    <label>{text.notes}</label>

                    <textarea
                      className="gl-input gl-textarea"
                      value={address.notes}
                      onChange={(e) =>
                        updateAddress(
                          "notes",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="gl-actions">
                    <button
                      type="button"
                      className="gl-action gl-action-secondary"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X size={16} />
                      {text.cancel}
                    </button>

                    <button
                      type="submit"
                      className="gl-action gl-action-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          />
                          {text.saving}
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {text.save}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}