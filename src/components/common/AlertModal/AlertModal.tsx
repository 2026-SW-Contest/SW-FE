import { useEffect, useId, useRef } from "react";

import "./AlertModal.css";

interface AlertModalProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

const AlertModal = ({
  open,
  message,
  confirmLabel = "확인",
  onConfirm,
}: AlertModalProps) => {
  const messageId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="alert-modal-backdrop">
      <div
        className="alert-modal"
        role="alertdialog"
        aria-modal="true"
        aria-describedby={messageId}
      >
        <p id={messageId} className="body03 alert-modal-message">
          {message}
        </p>

        <button
          ref={confirmButtonRef}
          type="button"
          className="body02 alert-modal-confirm"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
