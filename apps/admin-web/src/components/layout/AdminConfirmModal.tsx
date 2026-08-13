interface AdminConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  processingLabel: string;
  isProcessing: boolean;
  error?: string;
  tone?: "primary" | "danger";
  onClose: () => void;
  onConfirm: () => void;
}

export const AdminConfirmModal = ({
  title,
  description,
  confirmLabel,
  processingLabel,
  isProcessing,
  error = "",
  tone = "primary",
  onClose,
  onConfirm,
}: AdminConfirmModalProps) => (
  <div
    className="admin-confirm-backdrop"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isProcessing) onClose();
    }}
  >
    <section
      className="admin-confirm-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
    >
      <h2 id="admin-confirm-title">{title}</h2>
      <p>{description}</p>
      {error && <p className="admin-confirm-error">{error}</p>}
      <div className="admin-confirm-actions">
        <button type="button" disabled={isProcessing} onClick={onClose}>
          취소
        </button>
        <button
          type="button"
          className={tone}
          disabled={isProcessing}
          onClick={onConfirm}
        >
          {isProcessing ? processingLabel : confirmLabel}
        </button>
      </div>
    </section>
  </div>
);
