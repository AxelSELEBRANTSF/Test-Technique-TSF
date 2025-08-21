import React, { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-panel fade-in" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost" onClick={onClose} aria-label="Fermer">Fermer</button>
          </div>
          <div>{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </>
  );
}
