"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import {
  BASE_CSS,
  formatPrice,
  LABELS,
  type Locale,
} from "../../../../../lib/sharedids";

type Status =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  orderNumber: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  } | null;

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
  status: Status;

  statusHistory: {
    status: Status;
    note?: string;
    createdAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
};

const STATUS_LABELS: Record<
  Status,
  {
    ar: string;
    en: string;
  }
> = {
  pending: {
    ar: "قيد الانتظار",
    en: "Pending",
  },

  confirmed: {
    ar: "تم التأكيد",
    en: "Confirmed",
  },

  processing: {
    ar: "جاري التجهيز",
    en: "Processing",
  },

  shipped: {
    ar: "تم الشحن",
    en: "Shipped",
  },

  delivered: {
    ar: "تم التسليم",
    en: "Delivered",
  },

  cancelled: {
    ar: "ملغي",
    en: "Cancelled",
  },
};

const STATUS_CLASS: Record<Status, string> = {
  pending: "gl-order-status gl-status-pending",
  confirmed: "gl-order-status gl-status-confirmed",
  processing: "gl-order-status gl-status-processing",
  shipped: "gl-order-status gl-status-shipped",
  delivered: "gl-order-status gl-status-delivered",
  cancelled: "gl-order-status gl-status-cancelled",
};

function StatCard({
  icon: Icon,
  label,
  value,
  className = "",
  delay = 0,
}: {
  icon: ElementType;
  label: string;
  value: string | number;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`gl-order-stat ${className}`}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="gl-order-stat-top">
        <span className="gl-order-stat-label">
          {label}
        </span>

        <span className="gl-order-stat-icon">
          <Icon
            size={19}
            strokeWidth={2.2}
          />
        </span>
      </div>

      <div className="gl-order-stat-value">
        {value}
      </div>

      <span className="gl-order-stat-shine" />
    </div>
  );
}

const ORDERS_CSS = `
.gl-orders-page {
  --gl-wine: #8b1538;
  --gl-wine-dark: #6d0f2b;
  --gl-pink: #f4b6c2;
  --gl-blush: #fbe4e8;
  --gl-rose: #d6506f;
  --gl-ink: #29151c;
  --gl-muted: #876f77;
  --gl-line: #eadde1;
  --gl-bg: #fffafb;

  min-height: 100vh;
  padding: 32px 20px 90px;

  background:
    radial-gradient(
      circle at 0% 0%,
      rgba(244,182,194,.20),
      transparent 27%
    ),
    radial-gradient(
      circle at 100% 8%,
      rgba(139,21,56,.08),
      transparent 25%
    ),
    var(--gl-bg);

  color: var(--gl-ink);
}

.gl-orders-wrap {
  width: min(1450px, 100%);
  margin: 0 auto;
}

/* ================= HEADER ================= */

.gl-orders-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
  animation: glOrderHeader .65s ease both;
}

.gl-orders-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: var(--gl-wine);
  font-size: 11px;
  font-weight: 950;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.gl-orders-kicker::before {
  content: "";
  width: 25px;
  height: 2px;
  border-radius: 999px;
  background: var(--gl-wine);
}

.gl-orders-head h1 {
  margin: 0;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: -.035em;
  color: var(--gl-ink);
}

.gl-orders-head p {
  margin: 9px 0 0;
  color: var(--gl-muted);
  font-size: 13px;
}

.gl-orders-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.gl-orders-back,
.gl-orders-refresh {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;

  transition:
    transform .22s ease,
    box-shadow .22s ease,
    background .22s ease;
}

.gl-orders-back {
  padding: 0 14px;
  color: var(--gl-wine);
  text-decoration: none;
  background: rgba(255,255,255,.82);
  border: 1px solid var(--gl-line);
}

.gl-orders-refresh {
  width: 43px;
  padding: 0;
  border: 0;
  color: #fff;

  background:
    linear-gradient(
      180deg,
      #8f1739 0%,
      #6d0f2b 100%
    );

  box-shadow:
    0 9px 22px rgba(109,15,43,.18);
}

.gl-orders-back:hover,
.gl-orders-refresh:hover {
  transform: translateY(-2px);
}

.gl-orders-refresh:disabled {
  opacity: .65;
  cursor: wait;
}

/* ================= STATS ================= */

.gl-orders-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.gl-order-stat {
  position: relative;
  min-height: 135px;
  overflow: hidden;
  padding: 19px;

  border: 1px solid var(--gl-line);
  border-radius: 21px;

  background: rgba(255,255,255,.92);

  box-shadow:
    0 12px 35px rgba(70,20,35,.055);

  animation:
    glOrderStatIn .65s cubic-bezier(.2,.8,.2,1) both;

  transition:
    transform .25s ease,
    box-shadow .25s ease,
    border-color .25s ease;
}

.gl-order-stat:hover {
  transform: translateY(-5px);
  border-color: rgba(139,21,56,.18);

  box-shadow:
    0 18px 42px rgba(70,20,35,.10);
}

.gl-order-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gl-order-stat-label {
  color: var(--gl-muted);
  font-size: 11px;
  font-weight: 900;
}

.gl-order-stat-icon {
  position: relative;
  z-index: 1;

  width: 43px;
  height: 43px;

  display: grid;
  place-items: center;

  border-radius: 14px;

  color: var(--gl-wine);

  background:
    linear-gradient(
      145deg,
      #fff1f4,
      #f9dbe2
    );

  box-shadow:
    inset 0 0 0 1px rgba(139,21,56,.07);

  animation:
    glOrderIcon 1.2s ease both;
}

.gl-order-stat-value {
  position: relative;
  z-index: 1;

  margin-top: 17px;

  color: var(--gl-ink);

  font-size: clamp(24px, 2.2vw, 31px);
  font-weight: 950;
  letter-spacing: -.04em;
}

.gl-order-stat-shine {
  position: absolute;

  width: 100px;
  height: 100px;

  right: -42px;
  bottom: -55px;

  border-radius: 50%;

  background: rgba(244,182,194,.23);

  filter: blur(1px);
}

.gl-stat-revenue .gl-order-stat-icon {
  color: #9a6a00;
  background: #fff5d9;
}

.gl-stat-pending .gl-order-stat-icon {
  color: #a76c00;
  background: #fff5d9;
}

.gl-stat-shipped .gl-order-stat-icon {
  color: #19765f;
  background: #e5f7f2;
}

/* ================= FILTERS ================= */

.gl-orders-filter-card {
  position: relative;

  display: flex;
  align-items: center;
  gap: 11px;

  padding: 14px;
  margin-bottom: 18px;

  border: 1px solid var(--gl-line);
  border-radius: 21px;

  background: rgba(255,255,255,.94);

  box-shadow:
    0 10px 30px rgba(70,20,35,.045);

  animation:
    glOrderFadeUp .7s .12s ease both;
}

.gl-orders-search {
  position: relative;
  flex: 1;
}

.gl-orders-search > svg {
  position: absolute;
  top: 50%;
  inset-inline-start: 14px;

  transform: translateY(-50%);

  color: #a48c94;
  pointer-events: none;
}

.gl-orders-search input,
.gl-orders-select {
  width: 100%;
  height: 46px;

  border: 1px solid var(--gl-line);
  border-radius: 13px;

  outline: none;

  background: #fff;
  color: var(--gl-ink);

  font: inherit;
  font-size: 12px;

  transition:
    border-color .2s ease,
    box-shadow .2s ease,
    transform .2s ease;
}

.gl-orders-search input {
  padding-inline: 43px 14px;
}

.gl-orders-select {
  min-width: 210px;
  padding: 0 13px;
  cursor: pointer;
}

.gl-orders-search input:focus,
.gl-orders-select:focus {
  border-color: var(--gl-wine);

  box-shadow:
    0 0 0 4px rgba(139,21,56,.08);
}

/* ================= TABLE CARD ================= */

.gl-orders-card {
  overflow: hidden;

  border: 1px solid var(--gl-line);
  border-radius: 25px;

  background: rgba(255,255,255,.96);

  box-shadow:
    0 15px 45px rgba(70,20,35,.06);

  animation:
    glOrderFadeUp .7s .18s ease both;
}

.gl-orders-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 17px 19px;

  border-bottom: 1px solid var(--gl-line);

  background:
    linear-gradient(
      90deg,
      rgba(251,228,232,.42),
      rgba(255,255,255,.9)
    );
}

.gl-orders-card-title {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 13px;
  font-weight: 950;
}

.gl-orders-card-title-icon {
  width: 34px;
  height: 34px;

  display: grid;
  place-items: center;

  border-radius: 10px;

  color: var(--gl-wine);
  background: var(--gl-blush);
}

.gl-orders-count {
  color: var(--gl-muted);
  font-size: 11px;
  font-weight: 800;
}

.gl-orders-table-wrap {
  overflow-x: auto;
}

.gl-orders-table {
  width: 100%;
  min-width: 960px;

  border-collapse: collapse;
}

.gl-orders-table th {
  padding: 15px 16px;

  border-bottom: 1px solid var(--gl-line);

  background: #fdf8f9;
  color: var(--gl-muted);

  font-size: 10px;
  font-weight: 950;

  text-align: start;
  white-space: nowrap;
}

.gl-orders-table td {
  padding: 16px;

  border-bottom: 1px solid #f0e6e9;

  vertical-align: middle;

  font-size: 12px;
}

.gl-orders-table tbody tr {
  animation:
    glOrderRowIn .5s ease both;

  transition:
    background .2s ease,
    transform .2s ease;
}

.gl-orders-table tbody tr:hover {
  background: #fff9fa;
}

.gl-orders-table tbody tr:last-child td {
  border-bottom: 0;
}

.gl-order-number {
  color: var(--gl-wine);
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.gl-order-customer {
  min-width: 180px;
}

.gl-order-customer-name {
  margin-bottom: 4px;
  font-weight: 900;
}

.gl-order-customer-email {
  max-width: 220px;

  overflow: hidden;

  color: var(--gl-muted);

  font-size: 10px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.gl-order-items {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  color: var(--gl-muted);
  white-space: nowrap;
}

.gl-order-total {
  color: var(--gl-ink);
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.gl-order-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  color: var(--gl-muted);

  font-size: 10px;
  white-space: nowrap;
}

.gl-order-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 105px;
  padding: 7px 10px;

  border-radius: 999px;

  font-size: 10px;
  font-weight: 950;

  white-space: nowrap;
}

.gl-status-pending {
  color: #8a6100;
  background: #fff4d8;
}

.gl-status-confirmed {
  color: #24629c;
  background: #e9f3ff;
}

.gl-status-processing {
  color: #6542a4;
  background: #f0eaff;
}

.gl-status-shipped {
  color: #19765f;
  background: #e5f7f2;
}

.gl-status-delivered {
  color: #287536;
  background: #e7f7e8;
}

.gl-status-cancelled {
  color: #a3263d;
  background: #ffe7ea;
}

.gl-order-view {
  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 11px;

  color: var(--gl-wine);
  background: var(--gl-blush);

  cursor: pointer;

  transition:
    transform .2s ease,
    color .2s ease,
    background .2s ease,
    box-shadow .2s ease;
}

.gl-order-view:hover {
  transform: translateY(-2px) scale(1.04);

  color: #fff;
  background: var(--gl-wine);

  box-shadow:
    0 8px 18px rgba(139,21,56,.18);
}

/* ================= STATES ================= */

.gl-orders-loading,
.gl-orders-empty {
  min-height: 300px;

  display: grid;
  place-items: center;

  text-align: center;

  padding: 45px 20px;
}

.gl-orders-loading-inner,
.gl-orders-empty-inner {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.gl-orders-empty-icon {
  width: 70px;
  height: 70px;

  display: grid;
  place-items: center;

  margin-bottom: 5px;

  border-radius: 22px;

  color: var(--gl-wine);
  background: var(--gl-blush);

  animation:
    glOrderFloat 2.8s ease-in-out infinite;
}

.gl-orders-empty-title {
  color: var(--gl-ink);
  font-size: 14px;
  font-weight: 950;
}

.gl-orders-empty-text {
  color: var(--gl-muted);
  font-size: 11px;
}

.gl-orders-error {
  padding: 55px 20px;

  text-align: center;

  color: #a3263d;
}

.gl-orders-error-icon {
  margin-bottom: 10px;
}

.gl-orders-error button {
  margin-top: 13px;

  height: 40px;
  padding: 0 17px;

  border: 0;
  border-radius: 11px;

  color: #fff;
  background: var(--gl-wine);

  font-weight: 900;

  cursor: pointer;
}

.gl-spin {
  animation:
    glOrderSpin 1s linear infinite;
}

/* ================= MODAL ================= */

.gl-order-overlay {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: grid;
  place-items: center;

  padding: 20px;

  background: rgba(31,9,17,.58);

  backdrop-filter: blur(8px);

  animation:
    glModalBg .25s ease both;
}

.gl-order-modal {
  width: min(940px, 100%);
  max-height: 92vh;

  overflow-y: auto;

  border: 1px solid rgba(255,255,255,.6);
  border-radius: 28px;

  background: #fff;

  box-shadow:
    0 35px 100px rgba(0,0,0,.28);

  animation:
    glModalIn .4s cubic-bezier(.2,.8,.2,1) both;
}

.gl-order-modal-head {
  position: sticky;
  top: 0;
  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 19px 22px;

  border-bottom: 1px solid var(--gl-line);

  background: rgba(255,255,255,.94);

  backdrop-filter: blur(14px);
}

.gl-order-modal-number {
  margin: 0 0 7px;

  color: var(--gl-ink);

  font-family:
    "Playfair Display",
    Georgia,
    serif;

  font-size: 24px;
  font-weight: 900;
}

.gl-order-modal-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gl-order-close {
  width: 39px;
  height: 39px;

  display: grid;
  place-items: center;

  flex: 0 0 auto;

  border: 1px solid var(--gl-line);
  border-radius: 12px;

  color: var(--gl-muted);
  background: #fff;

  cursor: pointer;

  transition:
    transform .2s ease,
    background .2s ease,
    color .2s ease;
}

.gl-order-close:hover {
  transform: rotate(5deg);

  color: #fff;
  background: var(--gl-wine);
}

.gl-order-modal-body {
  padding: 23px;
}

.gl-order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  margin-bottom: 17px;
}

.gl-order-info-box {
  padding: 17px;

  border: 1px solid var(--gl-line);
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      #fff,
      #fffafb
    );
}

.gl-order-info-box h3 {
  display: flex;
  align-items: center;
  gap: 8px;

  margin: 0 0 12px;

  color: var(--gl-ink);

  font-size: 12px;
  font-weight: 950;
}

.gl-order-info-box h3 svg {
  color: var(--gl-wine);
}

.gl-order-info-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  padding: 7px 0;

  font-size: 11px;
}

.gl-order-info-line + .gl-order-info-line {
  border-top: 1px solid #f5ecef;
}

.gl-order-info-line > span {
  color: var(--gl-muted);
}

.gl-order-info-line > strong {
  max-width: 65%;

  text-align: end;

  overflow-wrap: anywhere;
}

/* ITEMS */

.gl-order-items-box {
  overflow: hidden;

  margin-bottom: 17px;

  border: 1px solid var(--gl-line);
  border-radius: 18px;
}

.gl-order-items-title {
  padding: 13px 16px;

  border-bottom: 1px solid var(--gl-line);

  background: #fdf8f9;

  font-size: 12px;
  font-weight: 950;
}

.gl-order-modal-item {
  display: grid;
  grid-template-columns: 57px 1fr auto;

  align-items: center;

  gap: 12px;

  padding: 13px;

  border-bottom: 1px solid #f1e8eb;
}

.gl-order-modal-item:last-child {
  border-bottom: 0;
}

.gl-order-modal-item img,
.gl-order-item-placeholder {
  width: 57px;
  height: 57px;

  object-fit: cover;

  border-radius: 13px;

  background: #faf2f4;
}

.gl-order-item-placeholder {
  display: grid;
  place-items: center;

  color: var(--gl-wine);
}

.gl-order-modal-item-name {
  font-size: 12px;
  font-weight: 950;
}

.gl-order-modal-item-brand {
  margin-top: 3px;

  color: var(--gl-muted);

  font-size: 10px;
}

.gl-order-modal-item-meta {
  margin-top: 4px;

  color: var(--gl-muted);

  font-size: 10px;
}

.gl-order-modal-item-price {
  color: var(--gl-wine);

  font-size: 12px;
  font-weight: 950;

  white-space: nowrap;
}

/* TOTAL */

.gl-order-summary {
  margin-bottom: 18px;
}

.gl-order-total-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 8px 0;

  color: var(--gl-muted);

  font-size: 11px;
}

.gl-order-total-line strong {
  color: var(--gl-ink);
}

.gl-order-total-final {
  margin-top: 7px;

  padding-top: 14px;

  border-top: 1px solid var(--gl-line);

  color: var(--gl-ink);

  font-size: 14px;
  font-weight: 950;
}

.gl-order-total-final strong {
  color: var(--gl-wine);
  font-size: 18px;
}

/* STATUS UPDATE */

.gl-order-update-box {
  margin-bottom: 20px;

  padding: 17px;

  border: 1px solid rgba(139,21,56,.14);
  border-radius: 18px;

  background:
    linear-gradient(
      145deg,
      #fff8fa,
      #fff
    );
}

.gl-order-update-box h3 {
  margin: 0 0 12px;

  font-size: 12px;
  font-weight: 950;
}

.gl-order-update-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 9px;
}

.gl-order-update-row select,
.gl-order-update-row input {
  width: 100%;
  height: 43px;

  padding: 0 12px;

  border: 1px solid var(--gl-line);
  border-radius: 11px;

  outline: none;

  background: #fff;
  color: var(--gl-ink);

  font: inherit;
  font-size: 11px;
}

.gl-order-update-row select:focus,
.gl-order-update-row input:focus {
  border-color: var(--gl-wine);

  box-shadow:
    0 0 0 3px rgba(139,21,56,.08);
}

.gl-order-update-row button {
  height: 43px;
  min-width: 105px;

  padding: 0 16px;

  border: 0;
  border-radius: 11px;

  color: #fff;

  background:
    linear-gradient(
      180deg,
      #8f1739,
      #6d0f2b
    );

  font-weight: 900;

  cursor: pointer;

  box-shadow:
    0 8px 18px rgba(109,15,43,.15);
}

.gl-order-update-row button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

/* HISTORY */

.gl-order-history {
  padding-top: 18px;

  border-top: 1px solid var(--gl-line);
}

.gl-order-history h3 {
  margin: 0 0 16px;

  font-size: 13px;
  font-weight: 950;
}

.gl-order-history-list {
  position: relative;
}

.gl-order-history-list::before {
  content: "";

  position: absolute;

  top: 7px;
  bottom: 10px;

  inset-inline-start: 5px;

  width: 1px;

  background: #eadde1;
}

.gl-order-history-item {
  position: relative;

  display: flex;

  gap: 12px;

  padding-bottom: 16px;
}

.gl-order-history-dot {
  position: relative;
  z-index: 1;

  width: 11px;
  height: 11px;

  margin-top: 4px;

  flex: 0 0 auto;

  border: 3px solid #fff;
  border-radius: 50%;

  background: var(--gl-wine);

  box-shadow:
    0 0 0 1px rgba(139,21,56,.2);
}

.gl-order-history-status {
  font-size: 11px;
  font-weight: 950;
}

.gl-order-history-date {
  margin-top: 3px;

  color: var(--gl-muted);

  font-size: 9px;
}

.gl-order-history-note {
  margin-top: 5px;

  color: #5d474f;

  font-size: 10px;
}

/* ================= ANIMATIONS ================= */

@keyframes glOrderHeader {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glOrderStatIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes glOrderIcon {
  from {
    opacity: 0;
    transform: scale(.65) rotate(-10deg);
  }

  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes glOrderFadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glOrderRowIn {
  from {
    opacity: 0;
    transform: translateY(7px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glOrderFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes glOrderSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes glModalBg {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes glModalIn {
  from {
    opacity: 0;
    transform: translateY(25px) scale(.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ================= RESPONSIVE ================= */

@media (max-width: 1100px) {
  .gl-orders-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .gl-orders-page {
    padding: 24px 13px 65px;
  }

  .gl-orders-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .gl-orders-actions {
    width: 100%;
  }

  .gl-orders-back {
    flex: 1;
  }

  .gl-orders-filter-card {
    flex-direction: column;
    align-items: stretch;
  }

  .gl-orders-select {
    min-width: 0;
  }

  .gl-order-info-grid {
    grid-template-columns: 1fr;
  }

  .gl-order-update-row {
    grid-template-columns: 1fr;
  }

  .gl-order-update-row button {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .gl-orders-stats {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .gl-order-stat {
    min-height: 115px;
    padding: 14px;
    border-radius: 17px;
  }

  .gl-order-stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 11px;
  }

  .gl-order-stat-value {
    margin-top: 13px;
    font-size: 22px;
  }

  .gl-orders-card {
    border-radius: 19px;
  }

  .gl-orders-card-top {
    padding: 14px;
  }

  .gl-order-overlay {
    padding: 7px;
  }

  .gl-order-modal {
    max-height: 96vh;
    border-radius: 21px;
  }

  .gl-order-modal-head {
    padding: 16px;
  }

  .gl-order-modal-body {
    padding: 15px;
  }

  .gl-order-modal-number {
    font-size: 20px;
  }

  .gl-order-modal-item {
    grid-template-columns: 48px 1fr;
  }

  .gl-order-modal-item img,
  .gl-order-item-placeholder {
    width: 48px;
    height: 48px;
  }

  .gl-order-modal-item-price {
    grid-column: 2;
  }
}

@media (max-width: 380px) {
  .gl-orders-stats {
    grid-template-columns: 1fr;
  }

  .gl-orders-head h1 {
    font-size: 29px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gl-orders-page *,
  .gl-orders-page *::before,
  .gl-orders-page *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;

export default function AdminOrdersPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (
    params?.locale === "en"
      ? "en"
      : "ar"
  ) as Locale;

  const isAr = locale === "ar";

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<"all" | Status>("all");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [updating, setUpdating] = useState(false);
  const [nextStatus, setNextStatus] =
    useState<Status | "">("");
  const [note, setNote] = useState("");

  const loadOrders = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const query = new URLSearchParams();

        if (search.trim()) {
          query.set(
            "search",
            search.trim()
          );
        }

        if (status !== "all") {
          query.set(
            "status",
            status
          );
        }

        const queryString =
          query.toString();

        const res = await fetch(
          `/api/admin/dashboard/orders${
            queryString
              ? `?${queryString}`
              : ""
          }`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (res.status === 401) {
          router.push(
            `/${locale}/login?redirect=/${locale}/admin/Dashboard/orders`
          );
          return;
        }

        if (res.status === 403) {
          router.push(`/${locale}`);
          return;
        }

        const data = await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          throw new Error(
            data?.message ||
              "Failed to load orders"
          );
        }

        setOrders(
          data.data.orders || []
        );

        setStats(
          data.data.stats || null
        );
      } catch (err) {
        console.error(err);

        setError(
          isAr
            ? "تعذر تحميل طلبات العملاء."
            : "Unable to load customer orders."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      isAr,
      locale,
      router,
      search,
      status,
    ]
  );

  useEffect(() => {
    loadOrders();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleOrders = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter(
      (order) => {
        return (
          order.orderNumber
            .toLowerCase()
            .includes(query) ||
          order.user?.fullName
            ?.toLowerCase()
            .includes(query) ||
          order.user?.email
            ?.toLowerCase()
            .includes(query) ||
          order.user?.phone
            ?.includes(query)
        );
      }
    );
  }, [orders, search]);

  const openOrder = (
    order: Order
  ) => {
    setSelectedOrder(order);
    setNextStatus("");
    setNote("");
  };

  const closeOrder = () => {
    if (updating) {
      return;
    }

    setSelectedOrder(null);
    setNextStatus("");
    setNote("");
  };

  const updateStatus = async () => {
    if (
      !selectedOrder ||
      !nextStatus
    ) {
      return;
    }

    try {
      setUpdating(true);

      const res = await fetch(
        `/api/admin/dashboard/orders/${selectedOrder.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: nextStatus,
            note: note.trim(),
          }),
        }
      );

      const data =
        await res.json();

      if (
        !res.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to update order"
        );
      }

      const updatedOrder =
        data.data.order as Order;

      setSelectedOrder(
        updatedOrder
      );

      setOrders(
        (current) =>
          current.map(
            (order) =>
              order.id ===
              updatedOrder.id
                ? updatedOrder
                : order
          )
      );

      setNextStatus("");
      setNote("");

      await loadOrders();
    } catch (err) {
      console.error(err);

      alert(
        isAr
          ? "تعذر تحديث حالة الطلب."
          : "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (
    date: string
  ) => {
    return new Intl.DateTimeFormat(
      isAr
        ? "ar-EG"
        : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(date)
    );
  };

  const statusText = (
    value: Status
  ) =>
    isAr
      ? STATUS_LABELS[value].ar
      : STATUS_LABELS[value].en;

  const getCustomerName = (
    order: Order
  ) =>
    order.user?.fullName ||
    order.shippingAddress.fullName ||
    (isAr
      ? "عميل"
      : "Customer");

  const getItemCount = (
    order: Order
  ) =>
    order.items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  return (
    <>
      <style>
        {BASE_CSS}
        {ORDERS_CSS}
      </style>

      <main
        dir={
          isAr
            ? "rtl"
            : "ltr"
        }
        className="gl-page gl-orders-page"
      >
        <div className="gl-orders-wrap">

          {/* ================= HEADER ================= */}

          <header className="gl-orders-head">
            <div>
              <div className="gl-orders-kicker">
                Glamora Admin
              </div>

              <h1>
                {isAr
                  ? "إدارة الطلبات"
                  : "Order Management"}
              </h1>

              <p>
                {isAr
                  ? "إدارة ومتابعة جميع طلبات العملاء من مكان واحد."
                  : "Manage and monitor all customer orders from one place."}
              </p>
            </div>

            <div className="gl-orders-actions">
              <Link
                href={`/${locale}/admin`}
                className="gl-orders-back"
              >
                {isAr ? (
                  <>
                    <ArrowRight
                      size={16}
                    />
                    لوحة التحكم
                  </>
                ) : (
                  <>
                    <ArrowLeft
                      size={16}
                    />
                    Admin Dashboard
                  </>
                )}
              </Link>

              <button
                type="button"
                className="gl-orders-refresh"
                onClick={() =>
                  loadOrders(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                title={
                  isAr
                    ? "تحديث"
                    : "Refresh"
                }
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "gl-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </header>

          {/* ================= STATS ================= */}

          {stats && (
            <section className="gl-orders-stats">
              <StatCard
                icon={ShoppingBag}
                label={
                  isAr
                    ? "إجمالي الطلبات"
                    : "Total Orders"
                }
                value={stats.total}
                delay={80}
              />

              <StatCard
                icon={Clock3}
                label={
                  isAr
                    ? "قيد الانتظار"
                    : "Pending"
                }
                value={
                  stats.pending
                }
                className="gl-stat-pending"
                delay={140}
              />

              <StatCard
                icon={Truck}
                label={
                  isAr
                    ? "تم الشحن"
                    : "Shipped"
                }
                value={
                  stats.shipped
                }
                className="gl-stat-shipped"
                delay={200}
              />

              <StatCard
                icon={CircleDollarSign}
                label={
                  isAr
                    ? "إجمالي المبيعات"
                    : "Revenue"
                }
                value={`${formatPrice(
                  stats.revenue,
                  locale
                )} ${
                  LABELS[locale].egp
                }`}
                className="gl-stat-revenue"
                delay={260}
              />
            </section>
          )}

          {/* ================= FILTERS ================= */}

          <section className="gl-orders-filter-card">
            <div className="gl-orders-search">
              <Search size={17} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    loadOrders();
                  }
                }}
                placeholder={
                  isAr
                    ? "ابحث برقم الطلب أو اسم العميل أو الإيميل..."
                    : "Search by order number, customer or email..."
                }
              />
            </div>

            <select
              className="gl-orders-select"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | "all"
                    | Status
                )
              }
            >
              <option value="all">
                {isAr
                  ? "كل حالات الطلبات"
                  : "All Order Statuses"}
              </option>

              {(
                Object.keys(
                  STATUS_LABELS
                ) as Status[]
              ).map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {statusText(
                      value
                    )}
                  </option>
                )
              )}
            </select>
          </section>

          {/* ================= ORDERS ================= */}

          <section className="gl-orders-card">
            <div className="gl-orders-card-top">
              <div className="gl-orders-card-title">
                <span className="gl-orders-card-title-icon">
                  <Package size={17} />
                </span>

                {isAr
                  ? "طلبات العملاء"
                  : "Customer Orders"}

                <span className="gl-orders-count">
                  {
                    visibleOrders.length
                  }{" "}
                  {isAr
                    ? "طلب"
                    : "orders"}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="gl-orders-loading">
                <div className="gl-orders-loading-inner">
                  <Loader2
                    size={40}
                    className="gl-spin"
                    color="var(--gl-wine)"
                  />

                  <span
                    style={{
                      color:
                        "var(--gl-muted)",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {isAr
                      ? "جاري تحميل الطلبات..."
                      : "Loading orders..."}
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="gl-orders-error">
                <AlertCircle
                  size={40}
                  className="gl-orders-error-icon"
                />

                <div>
                  {error}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadOrders()
                  }
                >
                  {isAr
                    ? "إعادة المحاولة"
                    : "Retry"}
                </button>
              </div>
            ) : visibleOrders.length ===
              0 ? (
              <div className="gl-orders-empty">
                <div className="gl-orders-empty-inner">
                  <div className="gl-orders-empty-icon">
                    <ShoppingBag
                      size={32}
                    />
                  </div>

                  <div className="gl-orders-empty-title">
                    {isAr
                      ? "لا توجد طلبات"
                      : "No orders found"}
                  </div>

                  <div className="gl-orders-empty-text">
                    {isAr
                      ? "لم يتم العثور على طلبات مطابقة."
                      : "No orders match your current filters."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="gl-orders-table-wrap">
                <table className="gl-orders-table">
                  <thead>
                    <tr>
                      <th>
                        {isAr
                          ? "رقم الطلب"
                          : "Order"}
                      </th>

                      <th>
                        {isAr
                          ? "العميل"
                          : "Customer"}
                      </th>

                      <th>
                        {isAr
                          ? "المنتجات"
                          : "Items"}
                      </th>

                      <th>
                        {isAr
                          ? "الإجمالي"
                          : "Total"}
                      </th>

                      <th>
                        {isAr
                          ? "الحالة"
                          : "Status"}
                      </th>

                      <th>
                        {isAr
                          ? "التاريخ"
                          : "Date"}
                      </th>

                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {visibleOrders.map(
                      (
                        order,
                        index
                      ) => (
                        <tr
                          key={
                            order.id
                          }
                          style={{
                            animationDelay: `${
                              index *
                              35
                            }ms`,
                          }}
                        >
                          <td>
                            <div className="gl-order-number">
                              #
                              {
                                order.orderNumber
                              }
                            </div>
                          </td>

                          <td>
                            <div className="gl-order-customer">
                              <div className="gl-order-customer-name">
                                {getCustomerName(
                                  order
                                )}
                              </div>

                              <div className="gl-order-customer-email">
                                {order
                                  .user
                                  ?.email ||
                                  "—"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="gl-order-items">
                              <Package
                                size={
                                  14
                                }
                              />

                              {
                                getItemCount(
                                  order
                                )
                              }{" "}

                              {isAr
                                ? "قطعة"
                                : getItemCount(
                                      order
                                    ) ===
                                    1
                                  ? "item"
                                  : "items"}
                            </div>
                          </td>

                          <td>
                            <div className="gl-order-total">
                              {formatPrice(
                                order.total,
                                locale
                              )}{" "}
                              {
                                LABELS[
                                  locale
                                ].egp
                              }
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                STATUS_CLASS[
                                  order
                                    .status
                                ]
                              }
                            >
                              {statusText(
                                order.status
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="gl-order-date">
                              <CalendarDays
                                size={
                                  13
                                }
                              />

                              {formatDate(
                                order.createdAt
                              )}
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="gl-order-view"
                              onClick={() =>
                                openOrder(
                                  order
                                )
                              }
                              title={
                                isAr
                                  ? "عرض الطلب"
                                  : "View order"
                              }
                            >
                              <Eye
                                size={
                                  17
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ================= ORDER MODAL ================= */}

      {selectedOrder && (
        <div
          className="gl-order-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !updating
            ) {
              closeOrder();
            }
          }}
        >
          <div className="gl-order-modal">

            {/* MODAL HEADER */}

            <div className="gl-order-modal-head">
              <div>
                <h2 className="gl-order-modal-number">
                  #
                  {
                    selectedOrder.orderNumber
                  }
                </h2>

                <div className="gl-order-modal-sub">
                  <span
                    className={
                      STATUS_CLASS[
                        selectedOrder
                          .status
                      ]
                    }
                  >
                    {statusText(
                      selectedOrder.status
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="gl-order-close"
                onClick={
                  closeOrder
                }
                disabled={
                  updating
                }
                aria-label={
                  isAr
                    ? "إغلاق"
                    : "Close"
                }
              >
                <X size={18} />
              </button>
            </div>

            <div className="gl-order-modal-body">

              {/* CUSTOMER + ADDRESS */}

              <div className="gl-order-info-grid">

                <div className="gl-order-info-box">
                  <h3>
                    <ShoppingBag
                      size={15}
                    />

                    {isAr
                      ? "بيانات العميل"
                      : "Customer Information"}
                  </h3>

                  <div className="gl-order-info-line">
                    <span>
                      {isAr
                        ? "الاسم"
                        : "Name"}
                    </span>

                    <strong>
                      {getCustomerName(
                        selectedOrder
                      )}
                    </strong>
                  </div>

                  <div className="gl-order-info-line">
                    <span>
                      {isAr
                        ? "الإيميل"
                        : "Email"}
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .user
                          ?.email ||
                        "—"
                      }
                    </strong>
                  </div>

                  <div className="gl-order-info-line">
                    <span>
                      {isAr
                        ? "الهاتف"
                        : "Phone"}
                    </span>

                    <strong>
                      {selectedOrder
                        .shippingAddress
                        .phone ||
                        selectedOrder
                          .user
                          ?.phone ||
                        "—"}
                    </strong>
                  </div>
                </div>

                <div className="gl-order-info-box">
                  <h3>
                    <Truck
                      size={15}
                    />

                    {isAr
                      ? "عنوان التوصيل"
                      : "Delivery Address"}
                  </h3>

                  <div className="gl-order-info-line">
                    <span>
                      {isAr
                        ? "المحافظة"
                        : "Governorate"}
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .shippingAddress
                          .governorate
                      }
                    </strong>
                  </div>

                  <div className="gl-order-info-line">
                    <span>
                      {isAr
                        ? "المدينة"
                        : "City"}
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .shippingAddress
                          .city
                      }
                    </strong>
                  </div>

                  <div className="gl-order-info-line">
                    <span>
                      {isAr
                        ? "العنوان"
                        : "Address"}
                    </span>

                    <strong>
                      {
                        selectedOrder
                          .shippingAddress
                          .address
                      }
                    </strong>
                  </div>

                  {selectedOrder
                    .shippingAddress
                    .notes && (
                    <div className="gl-order-info-line">
                      <span>
                        {isAr
                          ? "ملاحظات"
                          : "Notes"}
                      </span>

                      <strong>
                        {
                          selectedOrder
                            .shippingAddress
                            .notes
                        }
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* ITEMS */}

              <div className="gl-order-items-box">
                <div className="gl-order-items-title">
                  {isAr
                    ? "المنتجات"
                    : "Order Items"}
                </div>

                {selectedOrder.items.map(
                  (item) => (
                    <div
                      className="gl-order-modal-item"
                      key={
                        item.productId
                      }
                    >
                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                        />
                      ) : (
                        <div className="gl-order-item-placeholder">
                          <Package
                            size={
                              22
                            }
                          />
                        </div>
                      )}

                      <div>
                        <div className="gl-order-modal-item-name">
                          {
                            item.name
                          }
                        </div>

                        {item.brand && (
                          <div className="gl-order-modal-item-brand">
                            {
                              item.brand
                            }
                          </div>
                        )}

                        <div className="gl-order-modal-item-meta">
                          {isAr
                            ? `الكمية: ${item.quantity} × ${formatPrice(
                                item.unitPrice,
                                locale
                              )}`
                            : `Qty: ${item.quantity} × ${formatPrice(
                                item.unitPrice,
                                locale
                              )}`}
                        </div>
                      </div>

                      <div className="gl-order-modal-item-price">
                        {formatPrice(
                          item.lineTotal,
                          locale
                        )}{" "}
                        {
                          LABELS[
                            locale
                          ].egp
                        }
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* ORDER SUMMARY */}

              <div className="gl-order-info-box gl-order-summary">
                <div className="gl-order-total-line">
                  <span>
                    {isAr
                      ? "المنتجات"
                      : "Subtotal"}
                  </span>

                  <strong>
                    {formatPrice(
                      selectedOrder.subtotal,
                      locale
                    )}{" "}
                    {
                      LABELS[
                        locale
                      ].egp
                    }
                  </strong>
                </div>

                <div className="gl-order-total-line">
                  <span>
                    {isAr
                      ? "الشحن"
                      : "Shipping"}
                  </span>

                  <strong>
                    {formatPrice(
                      selectedOrder.shipping,
                      locale
                    )}{" "}
                    {
                      LABELS[
                        locale
                      ].egp
                    }
                  </strong>
                </div>

                <div className="gl-order-total-line">
                  <span>
                    {isAr
                      ? "طريقة الدفع"
                      : "Payment"}
                  </span>

                  <strong>
                    {isAr
                      ? "الدفع عند الاستلام"
                      : "Cash on Delivery"}
                  </strong>
                </div>

                <div className="gl-order-total-line gl-order-total-final">
                  <strong>
                    {isAr
                      ? "الإجمالي"
                      : "Total"}
                  </strong>

                  <strong>
                    {formatPrice(
                      selectedOrder.total,
                      locale
                    )}{" "}
                    {
                      LABELS[
                        locale
                      ].egp
                    }
                  </strong>
                </div>
              </div>

              {/* STATUS UPDATE */}

              {selectedOrder.status !==
                "delivered" &&
                selectedOrder.status !==
                  "cancelled" && (
                  <div className="gl-order-update-box">
                    <h3>
                      {isAr
                        ? "تحديث حالة الطلب"
                        : "Update Order Status"}
                    </h3>

                    <div className="gl-order-update-row">
                      <select
                        value={
                          nextStatus
                        }
                        onChange={(
                          e
                        ) =>
                          setNextStatus(
                            e.target
                              .value as Status
                          )
                        }
                        disabled={
                          updating
                        }
                      >
                        <option value="">
                          {isAr
                            ? "اختر الحالة الجديدة"
                            : "Select new status"}
                        </option>

                        {(
                          Object.keys(
                            STATUS_LABELS
                          ) as Status[]
                        )
                          .filter(
                            (
                              value
                            ) =>
                              value !==
                              selectedOrder.status
                          )
                          .map(
                            (
                              value
                            ) => (
                              <option
                                key={
                                  value
                                }
                                value={
                                  value
                                }
                              >
                                {statusText(
                                  value
                                )}
                              </option>
                            )
                          )}
                      </select>

                      <input
                        value={note}
                        onChange={(
                          e
                        ) =>
                          setNote(
                            e.target
                              .value
                          )
                        }
                        disabled={
                          updating
                        }
                        placeholder={
                          isAr
                            ? "ملاحظة اختيارية..."
                            : "Optional note..."
                        }
                      />

                      <button
                        type="button"
                        disabled={
                          updating ||
                          !nextStatus
                        }
                        onClick={
                          updateStatus
                        }
                      >
                        {updating ? (
                          <Loader2
                            size={17}
                            className="gl-spin"
                          />
                        ) : isAr ? (
                          "تحديث"
                        ) : (
                          "Update"
                        )}
                      </button>
                    </div>
                  </div>
                )}

              {/* HISTORY */}

              <div className="gl-order-history">
                <h3>
                  {isAr
                    ? "سجل حالة الطلب"
                    : "Order Status History"}
                </h3>

                <div className="gl-order-history-list">
                  {[
                    ...selectedOrder.statusHistory,
                  ]
                    .reverse()
                    .map(
                      (
                        entry,
                        index
                      ) => (
                        <div
                          className="gl-order-history-item"
                          key={`${entry.createdAt}-${index}`}
                        >
                          <div className="gl-order-history-dot" />

                          <div>
                            <div className="gl-order-history-status">
                              {statusText(
                                entry.status
                              )}
                            </div>

                            <div className="gl-order-history-date">
                              {formatDate(
                                entry.createdAt
                              )}
                            </div>

                            {entry.note && (
                              <div className="gl-order-history-note">
                                {
                                  entry.note
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}