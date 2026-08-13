import { useEffect, useRef, useState } from "react";
import arrowLeftIcon from "../../../../../src/assets/icons/actions/arrow-left.svg";
import chevronRightIcon from "../../../../../src/assets/icons/actions/chevron-right.svg";
import { getUserErrorMessage } from "../../../../../src/utils/userErrorMessage";
import { statusLabel } from "../../config/adminConfig";
import { AdminFacilityItem, AdminStatus } from "../../types";
import { AdminConfirmModal } from "../layout/AdminConfirmModal";

interface FacilityDrawerProps {
  item: AdminFacilityItem;
  isLoading: boolean;
  detailError: string;
  onClose: () => void;
  onSave: (status: AdminStatus, answer: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const FacilityDrawer = ({
  item,
  isLoading,
  detailError,
  onClose,
  onSave,
  onDelete,
}: FacilityDrawerProps) => {
  const [status, setStatus] = useState(item.status);
  const [answer, setAnswer] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const closeTimerRef = useRef<number | null>(null);
  const imageUrls = item.imageUrls?.length
    ? item.imageUrls
    : item.thumbnailUrl
      ? [item.thumbnailUrl]
      : [];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [item.id, item.imageUrls]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isImageViewerOpen) return;

    const handleViewerKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageViewerOpen(false);
        return;
      }
      if (imageUrls.length < 2) return;
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", handleViewerKeyDown);
    return () => window.removeEventListener("keydown", handleViewerKeyDown);
  }, [imageUrls.length, isImageViewerOpen]);

  const showPreviousImage = () => {
    setActiveImageIndex((index) =>
      index === 0 ? imageUrls.length - 1 : index - 1,
    );
  };

  const showNextImage = () => {
    setActiveImageIndex((index) => (index + 1) % imageUrls.length);
  };

  const closeWithAnimation = (afterClose: () => void = onClose) => {
    if (isClosing || isSaving || isDeleting) return;
    setIsImageViewerOpen(false);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(afterClose, 280);
  };

  useEffect(() => {
    if (isImageViewerOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isDeleteConfirmOpen) {
        if (!isDeleting) setIsDeleteConfirmOpen(false);
        return;
      }
      closeWithAnimation();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  const handleSave = async () => {
    if (isSaving || isDeleting) return;
    const hasStatusChange = status !== item.status;
    const hasAnswer = Boolean(answer.trim());

    if (!hasStatusChange && !hasAnswer) {
      setSaveError("처리 상태를 변경하거나 관리자 답변을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      await onSave(status, answer);
      setIsSaving(false);
      closeWithAnimation();
    } catch (error) {
      setSaveError(getUserErrorMessage(
        error,
        "시설 문의 처리 내용을 저장하지 못했습니다.",
      ));
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await onDelete();
      setIsDeleteConfirmOpen(false);
      setIsDeleting(false);
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(onClose, 280);
    } catch (error) {
      setDeleteError(getUserErrorMessage(
        error,
        "시설 문의를 삭제하지 못했습니다.",
      ));
      setIsDeleting(false);
    }
  };

  const availableStatuses: AdminStatus[] = item.status === "waiting"
    ? ["waiting", "inProgress", "resolved"]
    : item.status === "inProgress"
      ? ["inProgress", "resolved"]
      : ["resolved"];

  return (
    <div
      className={`admin-drawer-backdrop ${isClosing ? "closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleteConfirmOpen) closeWithAnimation();
      }}
    ><aside className={`admin-drawer ${isClosing ? "closing" : ""}`} role="dialog" aria-modal="true" aria-label="시설 문의 처리" tabIndex={-1} onKeyDown={(event) => {
      if (isImageViewerOpen) return;
      if (imageUrls.length < 2 || ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement).tagName)) return;
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    }}>
      <div className="admin-modal-header"><div><h2>시설·기자재 문의 처리</h2><p>문의 #{item.id}</p></div><button type="button" onClick={() => closeWithAnimation()}>×</button></div>
      <section className={`admin-facility-media ${imageUrls.length ? "has-image" : "is-empty"}`}>
        {isLoading ? (
          <span>첨부사진을 불러오는 중입니다.</span>
        ) : imageUrls.length ? (
          <>
            <div className="admin-facility-main-image">
              <button
                type="button"
                className="admin-facility-image-open"
                aria-label="첨부사진 전체화면으로 보기"
                onClick={() => setIsImageViewerOpen(true)}
              >
                <img key={imageUrls[activeImageIndex]} src={imageUrls[activeImageIndex]} alt={`${item.title} 첨부사진 ${activeImageIndex + 1}`} />
              </button>
              {imageUrls.length > 1 && (
                <>
                  <div className="admin-facility-image-controls">
                    <button type="button" className="admin-facility-image-nav previous" aria-label="이전 사진" onClick={showPreviousImage}>
                      <img src={arrowLeftIcon} alt="" />
                    </button>
                    <button type="button" className="admin-facility-image-nav next" aria-label="다음 사진" onClick={showNextImage}>
                      <img src={chevronRightIcon} alt="" />
                    </button>
                  </div>
                  <span className="admin-facility-image-count">{activeImageIndex + 1} / {imageUrls.length}</span>
                </>
              )}
            </div>
            {imageUrls.length > 1 && (
              <div className="admin-facility-thumbnails" aria-label="첨부사진 목록">
                {imageUrls.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    className={index === activeImageIndex ? "active" : ""}
                    aria-label={`${index + 1}번째 첨부사진 보기`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img src={imageUrl} alt="" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <span>{detailError || "등록된 첨부사진이 없습니다."}</span>
        )}
      </section>
      <section className="admin-detail-box"><h3>{item.title}</h3><dl><div><dt>신청자</dt><dd>{item.requesterName ?? "-"}</dd></div><div><dt>학번</dt><dd>{item.studentNumber ?? "-"}</dd></div><div><dt>이메일</dt><dd>{item.requesterEmail || "-"}</dd></div><div><dt>카테고리</dt><dd>{item.category}</dd></div><div><dt>장소</dt><dd>{item.location}</dd></div><div><dt>등록일</dt><dd>{item.submittedAt}</dd></div></dl></section>
      {item.description && <section className="admin-detail-section"><h3>문의 내용</h3><p>{item.description}</p></section>}
      {detailError && <p className="admin-drawer-error">{detailError}</p>}
      {(item.adminResponses?.length ?? 0) > 0 && (
        <section className="admin-detail-section admin-response-history">
          <h3>관리자 답변 내역</h3>
          <ul>
            {item.adminResponses?.map((response) => (
              <li key={response.responseId}>
                <p>{response.content}</p>
                <time>{new Date(response.createdAt).toLocaleString("ko-KR")}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
      <label className="admin-field"><span>처리 상태 *</span><select value={status} disabled={item.status === "resolved" || isSaving || isDeleting} onChange={(event) => setStatus(event.target.value as AdminStatus)}>{availableStatuses.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
      <label className="admin-field"><span>관리자 답변</span><textarea rows={7} maxLength={2000} disabled={item.status === "resolved" || isSaving || isDeleting} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={item.status === "resolved" ? "해결 완료된 문의는 추가 처리할 수 없습니다." : "학생에게 전달할 처리 내용을 입력하세요."} /></label>
      {saveError && <p className="admin-drawer-error">{saveError}</p>}
      <div className="admin-drawer-actions has-delete">
        <button
          type="button"
          className="admin-delete-button"
          disabled={isSaving || isDeleting}
          onClick={() => {
            setDeleteError("");
            setIsDeleteConfirmOpen(true);
          }}
        >
          삭제하기
        </button>
        <button type="button" disabled={isSaving || isDeleting} onClick={() => closeWithAnimation()}>취소</button>
        <button type="button" className="admin-primary-button" disabled={item.status === "resolved" || isSaving || isDeleting || isLoading} onClick={() => void handleSave()}>{isSaving ? "저장 중" : "저장하기"}</button>
      </div>
    </aside>
      {isImageViewerOpen && imageUrls.length > 0 && (
        <div
          className="admin-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="첨부사진 전체화면 보기"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsImageViewerOpen(false);
          }}
        >
          <button
            type="button"
            className="admin-image-viewer-close"
            aria-label="전체화면 닫기"
            onClick={() => setIsImageViewerOpen(false)}
          >
            ×
          </button>
          <img
            key={imageUrls[activeImageIndex]}
            className="admin-image-viewer-content"
            src={imageUrls[activeImageIndex]}
            alt={`${item.title} 첨부사진 ${activeImageIndex + 1}`}
          />
          {imageUrls.length > 1 && (
            <>
              <button type="button" className="admin-image-viewer-nav previous" aria-label="이전 사진" onClick={showPreviousImage}>
                <img src={arrowLeftIcon} alt="" />
              </button>
              <button type="button" className="admin-image-viewer-nav next" aria-label="다음 사진" onClick={showNextImage}>
                <img src={chevronRightIcon} alt="" />
              </button>
              <span className="admin-image-viewer-count">{activeImageIndex + 1} / {imageUrls.length}</span>
            </>
          )}
        </div>
      )}
      {isDeleteConfirmOpen && (
        <AdminConfirmModal
          title="시설 문의를 삭제하시겠습니까?"
          description="삭제한 시설 문의는 복구할 수 없습니다."
          confirmLabel="삭제하기"
          processingLabel="삭제 중"
          isProcessing={isDeleting}
          error={deleteError}
          tone="danger"
          onClose={() => {
            if (!isDeleting) setIsDeleteConfirmOpen(false);
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  );
};
