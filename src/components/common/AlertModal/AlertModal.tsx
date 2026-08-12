import { useEffect, useId, useRef } from "react";

import "./AlertModal.css";

interface AlertModalProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const AlertModal = ({
  open,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
}: AlertModalProps) => {
  const messageId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

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

        <div
          className={`alert-modal-actions${onCancel ? " has-cancel" : ""}`}
        >
          {onCancel && (
            <button
              type="button"
              className="body02 alert-modal-cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}

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
    </div>
  );
};

export default AlertModal;
