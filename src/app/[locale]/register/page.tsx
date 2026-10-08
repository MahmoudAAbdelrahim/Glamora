"use client";

import Link from "next/link";
import { use, useState, type ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import {
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SIDE_IMAGE = "/images/hero-clean.png";

const CSS = `
.gl-auth{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100vh;
  padding:clamp(12px,2vw,32px);
  background:#f3f4f6;
}

.gl-auth .gl-card{
  display:flex;
  width:100%;
  max-width:1000px;
  min-height:clamp(660px,calc(100vh - 64px),840px);
  overflow:hidden;
  border-radius:20px;
  background:#fff;
  box-shadow:0 10px 30px rgba(0,0,0,.07);
}

/* LEFT */

.gl-auth .gl-side{
  position:relative;
  display:none;
  flex-direction:column;
  width:42.3%;
  padding:80px 22px 0;
  overflow:hidden;
  color:#fff;
  background:linear-gradient(180deg,#a3314c 0%,#c46a80 100%);
}

.gl-auth .gl-side-img{
  position:absolute;
  inset:0;
  background-size:cover;
  background-position:center bottom;
  background-repeat:no-repeat;
}

.gl-auth .gl-side-shade{
  position:absolute;
  inset:0;
  background:
    linear-gradient(
      180deg,
      #a3314c 0%,
      #b3465f 38%,
      rgba(179,70,95,.55) 55%,
      rgba(179,70,95,0) 78%
    );
}

.gl-auth .gl-side>.in{
  position:relative;
  z-index:1;
}

.gl-auth .gl-welcome{
  margin:0;
  font-size:clamp(2rem,3.9vw,2.8rem);
  font-weight:500;
  line-height:1.2;
  color:#fff;
}

.gl-auth .gl-sub{
  margin:.9em 0 0;
  max-width:17.5em;
  font-size:clamp(1rem,1.7vw,1.2rem);
  line-height:1.5;
  color:rgba(255,255,255,.92);
}

.gl-auth .gl-feats{
  display:flex;
  flex-direction:column;
  gap:22px;
  margin-top:2.6rem;
}

.gl-auth .gl-feat{
  display:flex;
  align-items:center;
  gap:16px;
  font-size:clamp(.9rem,1.5vw,1.05rem);
  font-weight:500;
  color:#fff;
}

.gl-auth .gl-feat i{
  display:grid;
  flex-shrink:0;
  place-items:center;
  width:36px;
  height:36px;
  border-radius:50%;
  background:#fff;
  color:#8b1538;
  box-shadow:0 2px 6px rgba(0,0,0,.1);
}

/* RIGHT */

.gl-auth .gl-main{
  display:flex;
  flex:1;
  align-items:center;
  justify-content:center;
  padding:clamp(24px,4vw,48px) clamp(20px,6vw,64px);
}

.gl-auth .gl-form-wrap{
  width:100%;
  max-width:450px;
}

.gl-auth .gl-tabs{
  display:grid;
  grid-template-columns:1fr 1fr;
  padding:0 5.5%;
  margin-bottom:clamp(20px,2.8vw,32px);
  overflow:hidden;
  border-radius:12px;
  background:#f6f6f8;
}

.gl-auth .gl-tab{
  display:flex;
  align-items:center;
  justify-content:center;
  height:58px;
  border:0;
  border-bottom:3px solid transparent;
  background:transparent;
  color:#6b6b75;
  font:inherit;
  font-size:1rem;
  font-weight:500;
  text-decoration:none;
  cursor:pointer;
  transition:color .2s;
}

.gl-auth .gl-tab:hover{
  color:#2a2a33;
}

.gl-auth .gl-tab.on{
  border-bottom-color:#7d1030;
  border-radius:10px 10px 0 0;
  background:#fff;
  box-shadow:0 1px 6px rgba(0,0,0,.06);
  color:#7d1030;
  font-weight:700;
  cursor:default;
}

.gl-auth form{
  display:flex;
  flex-direction:column;
  gap:clamp(14px,1.8vw,22px);
}

.gl-auth .gl-lab{
  display:block;
  margin:0 0 .4em;
  font-size:.95rem;
  font-weight:600;
  color:#2a2a33;
}

.gl-auth .gl-input{
  position:relative;
}

.gl-auth .gl-input input{
  width:100%;
  height:52px;
  padding-block:0;
  padding-inline:16px;
  border:1px solid #ececef;
  border-radius:10px;
  background:#f6f6f7;
  color:#2a2a33;
  font:inherit;
  font-size:.95rem;
  outline:0;
  transition:border-color .2s,background .2s,box-shadow .2s;
}

.gl-auth .gl-input.pw input{
  padding-inline-end:48px;
}

.gl-auth .gl-input input::placeholder{
  color:#9a9aa5;
}

.gl-auth .gl-input input:focus{
  border-color:#7d1030;
  background:#fff;
  box-shadow:0 0 0 3px rgba(125,16,48,.08);
}

.gl-auth .gl-eye{
  position:absolute;
  top:50%;
  inset-inline-end:14px;
  display:grid;
  place-items:center;
  padding:4px;
  border:0;
  background:transparent;
  color:#55555f;
  transform:translateY(-50%);
  cursor:pointer;
}

.gl-auth .gl-eye:hover{
  color:#2a2a33;
}

/* SUBMIT */

.gl-auth .gl-submit{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  width:100%;
  height:56px;
  margin-top:6px;
  border:0;
  border-radius:10px;
  background:linear-gradient(180deg,#85102f 0%,#6f0f2a 100%);
  box-shadow:0 6px 14px rgba(125,16,48,.2);
  color:#fff;
  font:inherit;
  font-size:1.05rem;
  font-weight:600;
  cursor:pointer;
  transition:filter .2s,transform .1s,opacity .2s;
}

.gl-auth .gl-submit:hover:not(:disabled){
  filter:brightness(.92);
}

.gl-auth .gl-submit:active:not(:disabled){
  transform:scale(.99);
}

.gl-auth .gl-submit:disabled{
  opacity:.9;
  cursor:not-allowed;
}

/* MESSAGE */

.gl-auth .gl-message{
  display:flex;
  align-items:center;
  gap:9px;
  margin-top:14px;
  padding:12px 14px;
  border-radius:10px;
  font-size:.9rem;
  line-height:1.5;
  font-weight:600;
  animation:gl-message-in .25s ease;
}

.gl-auth .gl-message.success{
  border:1px solid rgba(125,16,48,.18);
  background:#fbe4e8;
  color:#7d1030;
}

.gl-auth .gl-message.error{
  border:1px solid #f0c8d0;
  background:#fff1f3;
  color:#8b1538;
}

.gl-auth .gl-message svg{
  flex-shrink:0;
}

@keyframes gl-message-in{
  from{
    opacity:0;
    transform:translateY(-5px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

.gl-auth .gl-loader{
  animation:gl-spin .8s linear infinite;
}

@keyframes gl-spin{
  to{
    transform:rotate(360deg);
  }
}

.gl-auth .gl-or{
  display:flex;
  align-items:center;
  gap:16px;
  margin:clamp(18px,2.4vw,26px) 0 18px;
  font-size:.95rem;
  font-weight:500;
  color:#3c3c46;
  white-space:nowrap;
}

.gl-auth .gl-or::before,
.gl-auth .gl-or::after{
  content:"";
  flex:1;
  height:1px;
  background:#ececef;
}

.gl-auth .gl-social{
  display:flex;
  justify-content:center;
  gap:clamp(24px,3.4vw,38px);
}

.gl-auth .gl-s{
  display:grid;
  place-items:center;
  width:58px;
  height:58px;
  padding:0;
  border:1px solid #ececef;
  border-radius:50%;
  background:#fff;
  box-shadow:0 2px 8px rgba(0,0,0,.08);
  cursor:pointer;
  transition:transform .2s,box-shadow .2s;
}

.gl-auth .gl-s:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 14px rgba(0,0,0,.12);
}

.gl-auth .gl-s.fb{
  border-color:#1877f2;
  background:linear-gradient(180deg,#2b85f5,#1668e0);
  color:#fff;
}

.gl-auth .gl-s svg{
  width:26px;
  height:26px;
}

.gl-auth .gl-foot{
  margin:clamp(18px,2.2vw,26px) 0 0;
  text-align:center;
  font-size:.95rem;
  color:#55555f;
}

.gl-auth .gl-reg{
  font-weight:700;
  color:#7d1030;
  text-decoration:underline;
  text-underline-offset:3px;
}

.gl-auth .gl-reg:hover{
  color:#5c0b22;
}

@media(min-width:992px){
  .gl-auth .gl-side{
    display:flex;
  }
}

@media(max-width:991px){
  .gl-auth{
    padding:0;
  }

  .gl-auth .gl-card{
    min-height:100vh;
    border-radius:0;
  }

  .gl-auth .gl-main{
    min-height:100vh;
  }
}
`;

interface RegisterPageProps {
  params: Promise<{
    locale: "ar" | "en";
  }>;
}

export default function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = use(params);

  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isArabic = locale === "ar";

  const text = {
    en: {
      welcome: "Create Account",
      subtitle:
        "Join Glamora today and discover personalized beauty experience.",
      feature1: "Personalized recommendations",
      feature2: "Save your favorite products",
      feature3: "Track your orders",

      login: "Login",
      register: "Register",

      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",

      email: "Email",
      emailPlaceholder: "Enter your email",

      phone: "Phone Number",
      phonePlaceholder: "Enter your phone number",

      password: "Password",
      passwordPlaceholder: "Create a password",

      registerButton: "Create Account",
      loading: "Creating account...",

      success: "Your account has been created successfully.",

      orContinue: "Or continue with",

      hasAccount: "Already have an account?",
      loginNow: "Login now",

      genericError: "Something went wrong. Please try again.",
      invalidData: "Please check the entered information.",
    },

    ar: {
      welcome: "إنشاء حساب جديد",
      subtitle:
        "انضمي إلى Glamora اليوم واكتشفي تجربة جمال مخصصة لكِ.",
      feature1: "ترشيحات مخصصة تناسب بشرتك",
      feature2: "احفظي منتجاتك المفضلة",
      feature3: "تابعي طلباتك بسهولة",

      login: "تسجيل الدخول",
      register: "إنشاء حساب",

      fullName: "الاسم الكامل",
      fullNamePlaceholder: "أدخلي اسمك الكامل",

      email: "البريد الإلكتروني",
      emailPlaceholder: "أدخلي بريدك الإلكتروني",

      phone: "رقم الهاتف",
      phonePlaceholder: "أدخلي رقم هاتفك",

      password: "كلمة المرور",
      passwordPlaceholder: "أدخلي كلمة المرور",

      registerButton: "إنشاء الحساب",
      loading: "جاري إنشاء الحساب...",

      success: "تم إنشاء حسابك بنجاح.",

      orContinue: "أو المتابعة باستخدام",

      hasAccount: "لديك حساب بالفعل؟",
      loginNow: "سجّلي الدخول الآن",

      genericError: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      invalidData: "يرجى مراجعة البيانات المدخلة.",
    },
  }[locale];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;

    setSuccessMessage("");
    setErrorMessage("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMessage(text.invalidData);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("password", password);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            text.genericError
        );
      }

      setSuccessMessage(
        data?.message || text.success
      );

      // تنظيف الحقول بعد نجاح التسجيل
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setShowPassword(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : text.genericError
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      <main
        dir={isArabic ? "rtl" : "ltr"}
        className={`gl-auth ${inter.className}`}
      >
        <div className="gl-card">

          {/* ================= LEFT ================= */}

          <section className="gl-side">
            <div
              className="gl-side-img"
              style={{
                backgroundImage: `url('${SIDE_IMAGE}')`,
              }}
            />

            <div className="gl-side-shade" />

            <div className="in">
              <h1
                className={`gl-welcome ${playfair.className}`}
              >
                {text.welcome}
              </h1>

              <p className="gl-sub">
                {text.subtitle}
              </p>

              <div className="gl-feats">
                <Feature
                  icon={<Sparkles size={18} />}
                  text={text.feature1}
                />

                <Feature
                  icon={<Heart size={18} />}
                  text={text.feature2}
                />

                <Feature
                  icon={<ShoppingBag size={18} />}
                  text={text.feature3}
                />
              </div>
            </div>
          </section>

          {/* ================= RIGHT ================= */}

          <section className="gl-main">
            <div className="gl-form-wrap">

              {/* Tabs */}

              <div className="gl-tabs">
                <Link
                  href={`/${locale}/login`}
                  className="gl-tab"
                >
                  {text.login}
                </Link>

                <button
                  type="button"
                  className="gl-tab on"
                  aria-current="page"
                >
                  {text.register}
                </button>
              </div>

              {/* Form */}

              <form onSubmit={handleSubmit}>

                {/* Full Name */}

                <div>
                  <label
                    className="gl-lab"
                    htmlFor="register-name"
                  >
                    {text.fullName}
                  </label>

                  <div className="gl-input">
                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      placeholder={text.fullNamePlaceholder}
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}

                <div>
                  <label
                    className="gl-lab"
                    htmlFor="register-email"
                  >
                    {text.email}
                  </label>

                  <div className="gl-input">
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder={text.emailPlaceholder}
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}

                <div>
                  <label
                    className="gl-lab"
                    htmlFor="register-phone"
                  >
                    {text.phone}
                  </label>

                  <div className="gl-input">
                    <input
                      id="register-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder={text.phonePlaceholder}
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    className="gl-lab"
                    htmlFor="register-password"
                  >
                    {text.password}
                  </label>

                  <div className="gl-input pw">
                    <input
                      id="register-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      placeholder={text.passwordPlaceholder}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      className="gl-eye"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword((v) => !v)
                      }
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  className="gl-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={20}
                        className="gl-loader"
                      />

                      <span>
                        {text.loading}
                      </span>
                    </>
                  ) : (
                    text.registerButton
                  )}
                </button>

                {/* Success */}

                {successMessage && (
                  <div
                    className="gl-message success"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckCircle2 size={20} />

                    <span>
                      {successMessage}
                    </span>
                  </div>
                )}

                {/* Error */}

                {errorMessage && (
                  <div
                    className="gl-message error"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle size={20} />

                    <span>
                      {errorMessage}
                    </span>
                  </div>
                )}
              </form>

              {/* Divider */}

              <div className="gl-or">
                {text.orContinue}
              </div>

              {/* Social */}

              <div className="gl-social">

                <button
                  type="button"
                  className="gl-s"
                  aria-label="Google"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />

                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />

                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />

                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="gl-s fb"
                  aria-label="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

              </div>

              {/* Login */}

              <p className="gl-foot">
                {text.hasAccount}{" "}

                <Link
                  href={`/${locale}/login`}
                  className="gl-reg"
                >
                  {text.loginNow}
                </Link>
              </p>

            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="gl-feat">
      <i>{icon}</i>
      <span>{text}</span>
    </div>
  );
}