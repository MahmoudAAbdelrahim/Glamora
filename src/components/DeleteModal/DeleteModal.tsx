"use client";

import { Package, Trash2 } from "lucide-react";
import type { Product, Tx } from "../../lib/shared";

export default function DeleteModal({
  t,
  product,
  busy,
  onCancel,
  onConfirm,
}: {
  t: Tx;
  product: Product;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="ovl"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal">
        <div className="mi">
          <Trash2 size={24} />
        </div>
        <h3>{t.deleteTitle}</h3>
        <p>{t.deleteDescription}</p>

        <div className="mp">
          <div className="pimg">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} />
            ) : (
              <Package size={20} />
            )}
          </div>
          <span>{product.name}</span>
        </div>

        <div className="macts">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={busy}>
            {t.cancel}
          </button>
          <button type="button" className="btn danger" onClick={onConfirm} disabled={busy}>
            <Trash2 size={16} />
            {t.confirmDelete}
          </button>
        </div>
      </div>
    </div>
  );
}