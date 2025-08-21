import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirmation",
  message = "Êtes-vous sûr ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: Props) {
  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const modal = (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        // clic en dehors ferme
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="modal-card card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()} // ne pas fermer en cliquant dans la modale
      >
        <div className="modal-header">
          <h3 id="confirm-title" className="card-title">{title}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            aria-label="Fermer"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {message}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
