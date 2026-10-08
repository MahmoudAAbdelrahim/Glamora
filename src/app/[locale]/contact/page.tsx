"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type ContactUser = {
  fullName: string;
  email: string;
  phone: string;
};

export default function ContactPage() {
  const params = useParams();
  const locale = params.locale === "en" ? "en" : "ar";
  const isAr = locale === "ar";

  const [user, setUser] = useState<ContactUser>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const t = isAr
    ? {
        eyebrow: "نحن هنا من أجلك",
        title: "يسعدنا أن",
        titleAccent: "نسمع منك",
        description:
          "عندك سؤال عن منتج، أو محتاج مساعدة؟ ابعتلنا رسالتك وفريق Glamora هيساعدك.",
        contact: "بيانات التواصل",
        name: "الاسم",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        subject: "موضوع الرسالة",
        subjectPlaceholder: "مثلاً: استفسار عن أحد المنتجات",
        message: "رسالتك",
        messagePlaceholder: "اكتب رسالتك هنا بالتفصيل...",
        send: "إرسال الرسالة",
        sending: "جاري الإرسال...",
        secure: "بياناتك محفوظة وآمنة",
        note: "بيانات حسابك بتتملي تلقائيًا",
        login: "سجل دخولك عشان تقدر تتواصل معانا.",
        success: "تم إرسال رسالتك بنجاح. شكرًا لتواصلك معانا.",
        genericError: "حصل خطأ، حاول مرة تانية.",
        minSubject: "اكتب موضوعًا واضحًا من 3 أحرف على الأقل.",
        minMessage: "اكتب رسالة من 10 أحرف على الأقل.",
      }
    : {
        eyebrow: "WE ARE HERE FOR YOU",
        title: "We'd love to",
        titleAccent: "hear from you",
        description:
          "Have a question about a product or need help? Send us a message and the Glamora team will assist you.",
        contact: "Your contact details",
        name: "Full name",
        email: "Email address",
        phone: "Phone number",
        subject: "Subject",
        subjectPlaceholder: "e.g. Product inquiry",
        message: "Your message",
        messagePlaceholder: "Tell us how we can help...",
        send: "Send message",
        sending: "Sending...",
        secure: "Your information is kept secure",
        note: "Your account details are filled automatically",
        login: "Please sign in to contact us.",
        success: "Your message has been sent successfully. Thank you!",
        genericError: "Something went wrong. Please try again.",
        minSubject: "Please enter a subject with at least 3 characters.",
        minMessage: "Please enter a message with at least 10 characters.",
      };

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/contact", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            response.status === 401 ? t.login : t.genericError
          );
        }

        if (active) {
          setUser(result.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : t.genericError
          );
        }
      } finally {
        if (active) setLoadingUser(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [t.login, t.genericError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (subject.trim().length < 3) {
      setError(t.minSubject);
      return;
    }

    if (message.trim().length < 10) {
      setError(t.minMessage);
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.genericError);
      }

      setSuccess(t.success);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.genericError
      );
    } finally {
      setSending(false);
    }
  }

  const BackIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="contact-page"
    >
      <style jsx global>{`
        .contact-page {
          --contact-wine: #8b1538;
          --contact-wine-dark: #6e0f2c;
          --contact-pink: #fbe4e8;
          --contact-blush: #fff7f8;
          --contact-ink: #2a1a1f;
          --contact-muted: #817178;
          min-height: 100vh;
          color: var(--contact-ink);
          background:
            radial-gradient(
              circle at 8% 12%,
              rgba(244, 182, 194, 0.2),
              transparent 28%
            ),
            #fff;
          overflow: hidden;
        }

        .contact-hero {
          position: relative;
          isolation: isolate;
          padding: 90px 24px 112px;
          background: linear-gradient(
            125deg,
            #fff8f9 0%,
            #fbe4e8 52%,
            #f7d1da 100%
          );
          overflow: hidden;
        }

        .contact-hero::before,
        .contact-hero::after {
          content: "";
          position: absolute;
          z-index: -1;
          border: 1px solid rgba(139, 21, 56, 0.13);
          border-radius: 50%;
          animation: contact-float 9s ease-in-out infinite;
        }

        .contact-hero::before {
          width: 330px;
          height: 330px;
          top: -180px;
          inset-inline-end: 8%;
        }

        .contact-hero::after {
          width: 210px;
          height: 210px;
          bottom: -135px;
          inset-inline-start: 8%;
          animation-delay: -3s;
        }

        .contact-container {
          width: min(1080px, 100%);
          margin-inline: auto;
        }

        .contact-hero-content {
          max-width: 720px;
          margin-inline: auto;
          text-align: center;
          animation: contact-enter 0.8s ease both;
        }

        .contact-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 10px 16px;
          border: 1px solid rgba(139, 21, 56, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          color: var(--contact-wine);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .contact-title {
          margin: 25px 0 18px;
          font-size: clamp(38px, 6vw, 66px);
          line-height: 1.18;
          font-weight: 900;
          letter-spacing: -1.8px;
        }

        .contact-title span {
          color: var(--contact-wine);
          display: inline-block;
        }

        .contact-description {
          max-width: 600px;
          margin: 0 auto;
          color: #79666d;
          font-size: 16px;
          line-height: 2;
        }

        .contact-main {
          padding: 0 24px 90px;
          margin-top: -42px;
          position: relative;
          z-index: 2;
        }

        .contact-card {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          background: #fff;
          border: 1px solid #f1e2e6;
          border-radius: 27px;
          box-shadow: 0 25px 80px rgba(91, 23, 44, 0.1);
          overflow: hidden;
          animation: contact-enter 0.8s 0.12s ease both;
        }

        .contact-info {
          padding: 38px 32px;
          color: #fff;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 255, 255, 0.12),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              var(--contact-wine),
              var(--contact-wine-dark)
            );
        }

        .contact-info h2 {
          margin: 0 0 12px;
          font-size: 23px;
          font-weight: 850;
        }

        .contact-info > p {
          color: rgba(255, 255, 255, 0.77);
          font-size: 13px;
          line-height: 1.9;
          margin-bottom: 30px;
        }

        .contact-detail {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          min-width: 0;
        }

        .contact-detail-icon {
          display: grid;
          place-items: center;
          flex: 0 0 42px;
          height: 42px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.13);
        }

        .contact-detail small {
          display: block;
          margin-bottom: 5px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 11px;
        }

        .contact-detail strong {
          display: block;
          overflow-wrap: anywhere;
          font-size: 13px;
          font-weight: 650;
        }

        .contact-secure {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 28px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          line-height: 1.8;
        }

        .contact-form-wrap {
          padding: 38px;
        }

        .contact-form-heading {
          margin-bottom: 25px;
        }

        .contact-form-heading h2 {
          margin: 0 0 9px;
          font-size: 25px;
          font-weight: 900;
        }

        .contact-form-heading p {
          color: var(--contact-muted);
          font-size: 13px;
          line-height: 1.8;
          margin: 0;
        }

        .contact-label {
          display: block;
          margin-bottom: 9px;
          font-size: 13px;
          font-weight: 750;
        }

        .contact-field {
          margin-bottom: 22px;
        }

        .contact-input {
          width: 100%;
          border: 1px solid #eadde1;
          border-radius: 13px;
          padding: 14px 15px;
          background: #fffdfd;
          color: var(--contact-ink);
          outline: none;
          font: inherit;
          font-size: 14px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .contact-input:focus {
          border-color: var(--contact-wine);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(139, 21, 56, 0.08);
        }

        .contact-input::placeholder {
          color: #b3a5aa;
        }

        .contact-input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .contact-textarea {
          min-height: 155px;
          resize: vertical;
          line-height: 1.9;
        }

        .contact-submit {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 52px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(
            110deg,
            var(--contact-wine),
            #a52249
          );
          color: white;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(139, 21, 56, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .contact-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(139, 21, 56, 0.28);
        }

        .contact-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .contact-alert {
          padding: 13px 15px;
          margin-bottom: 18px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.8;
        }

        .contact-alert-error {
          border: 1px solid #f3c5ce;
          background: #fff2f4;
          color: #8b1538;
        }

        .contact-alert-success {
          border: 1px solid #bfe8d0;
          background: #effcf4;
          color: #17643a;
        }

        .contact-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 0;
          color: var(--contact-muted);
          font-size: 14px;
        }

        @keyframes contact-enter {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes contact-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(7deg);
          }
        }

        @media (max-width: 760px) {
          .contact-hero {
            padding: 65px 20px 90px;
          }

          .contact-title {
            letter-spacing: -0.8px;
          }

          .contact-description {
            font-size: 14px;
          }

          .contact-main {
            padding: 0 15px 55px;
          }

          .contact-card {
            grid-template-columns: 1fr;
            border-radius: 21px;
          }

          .contact-info {
            padding: 27px 24px;
          }

          .contact-info > p {
            margin-bottom: 16px;
          }

          .contact-detail {
            padding: 12px 0;
          }

          .contact-secure {
            margin-top: 20px;
          }

          .contact-form-wrap {
            padding: 27px 21px;
          }

          .contact-form-heading h2 {
            font-size: 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .contact-page *,
          .contact-page *::before,
          .contact-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <section className="contact-hero">
        <div className="contact-container contact-hero-content">
          <div className="contact-eyebrow">
            <Sparkles size={15} />
            {t.eyebrow}
          </div>

          <h1 className="contact-title">
            {t.title} <span>{t.titleAccent}</span>
          </h1>

          <p className="contact-description">
            {t.description}
          </p>
        </div>
      </section>

      <section className="contact-main">
        <div className="contact-container">
          <div className="contact-card">
            <aside className="contact-info">
              <h2>{t.contact}</h2>
              <p>{t.note}</p>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <MessageCircle size={19} />
                </div>
                <div>
                  <small>{t.name}</small>
                  <strong>
                    {loadingUser ? "..." : user.fullName || "—"}
                  </strong>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <Mail size={19} />
                </div>
                <div>
                  <small>{t.email}</small>
                  <strong>
                    {loadingUser ? "..." : user.email || "—"}
                  </strong>
                </div>
              </div>

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <MessageCircle size={19} />
                </div>
                <div>
                  <small>{t.phone}</small>
                  <strong>
                    {loadingUser ? "..." : user.phone || "—"}
                  </strong>
                </div>
              </div>

              <div className="contact-secure">
                <ShieldCheck size={20} />
                <span>{t.secure}</span>
              </div>
            </aside>

            <div className="contact-form-wrap">
              <div className="contact-form-heading">
                <h2>{t.eyebrow === "نحن هنا من أجلك" ? "ابعتلنا رسالتك" : "Send us a message"}</h2>
                <p>{t.description}</p>
              </div>

              {loadingUser ? (
                <div className="contact-loading">
                  <LoaderCircle className="animate-spin" size={20} />
                  {isAr ? "جاري تحميل بياناتك..." : "Loading your details..."}
                </div>
              ) : error && !user.email ? (
                <div className="contact-alert contact-alert-error">
                  {error}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="contact-field">
                    <label className="contact-label" htmlFor="contact-subject">
                      {t.subject}
                    </label>
                    <input
                      id="contact-subject"
                      className="contact-input"
                      type="text"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder={t.subjectPlaceholder}
                      minLength={3}
                      maxLength={120}
                      required
                      disabled={sending}
                    />
                  </div>

                  <div className="contact-field">
                    <label className="contact-label" htmlFor="contact-message">
                      {t.message}
                    </label>
                    <textarea
                      id="contact-message"
                      className="contact-input contact-textarea"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={t.messagePlaceholder}
                      minLength={10}
                      maxLength={3000}
                      required
                      disabled={sending}
                    />
                  </div>

                  {error && (
                    <div className="contact-alert contact-alert-error">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="contact-alert contact-alert-success">
                      <CheckCircle2
                        size={17}
                        style={{
                          verticalAlign: "middle",
                          marginInlineEnd: 7,
                        }}
                      />
                      {success}
                    </div>
                  )}

                  <button
                    className="contact-submit"
                    type="submit"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        {t.send}
                        <BackIcon size={17} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}