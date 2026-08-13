interface LogoutConfirmModalProps {
  isLoggingOut: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal = ({
  isLoggingOut,
  error,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) => (
  <div
    className="admin-confirm-backdrop"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isLoggingOut) onClose();
    }}
  >
    <section
      className="admin-confirm-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="admin-logout-title"
    >
      <h2 id="admin-logout-title">로그아웃 하시겠습니까?</h2>
      <p>로그아웃하면 관리자 로그인 페이지로 이동합니다.</p>
      {error && <p className="admin-confirm-error">{error}</p>}
      <div className="admin-confirm-actions">
        <button type="button" disabled={isLoggingOut} onClick={onClose}>
          취소
        </button>
        <button
          type="button"
          className="primary"
          disabled={isLoggingOut}
          onClick={onConfirm}
        >
          {isLoggingOut ? "로그아웃 중" : "로그아웃"}
        </button>
      </div>
    </section>
  </div>
);
