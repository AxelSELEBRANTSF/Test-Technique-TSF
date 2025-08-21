import { useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDialog from "../components/ConfirmDialog";

type Opts = {
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    opts: Opts;
    resolve?: (v: boolean) => void;
  }>({ open: false, opts: { message: "" } });

  function confirm(opts: Opts): Promise<boolean> {
    return new Promise((resolve) => {
      setState({ open: true, opts, resolve });
    });
  }

  function onConfirm() {
    state.resolve?.(true);
    setState(s => ({ ...s, open: false }));
  }
  function onCancel() {
    state.resolve?.(false);
    setState(s => ({ ...s, open: false }));
  }

  const dialog = state.open
    ? createPortal(
        <ConfirmDialog
          open={state.open}
          title={state.opts.title || "Confirmation"}
          message={state.opts.message}
          confirmLabel={state.opts.confirmLabel || "Confirmer"}
          cancelLabel={state.opts.cancelLabel || "Annuler"}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
        document.body
      )
    : null;

  return { confirm, dialog };
}
