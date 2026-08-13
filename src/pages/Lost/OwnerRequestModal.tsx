import {
  ChangeEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import closeIcon from "../../assets/icons/actions/close.svg";
import { getUserErrorMessage } from "../../utils/userErrorMessage";
import plusIcon from "../../assets/icons/actions/plus.svg";

import "./OwnerRequestModal.css";

interface OwnerRequestModalProps {
  open: boolean;
  userName: string;
  studentNumber: string;
  onCancel: () => void;
  onSubmit: (inquiry: string, images: File[]) => Promise<void>;
}

const OwnerRequestModal = ({
  open,
  userName,
  studentNumber,
  onCancel,
  onSubmit,
}: OwnerRequestModalProps) => {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inquiry, setInquiry] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const imagePreviewUrls = useMemo(
    () => images.map((image) => URL.createObjectURL(image)),
    [images],
  );

  useEffect(
    () => () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [imagePreviewUrls],
  );

  useEffect(() => {
    if (!open) return;

    const animationFrame = window.requestAnimationFrame(() => {
      modalRef.current?.focus({ preventScroll: true });
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) return null;

  const appRoot = document.querySelector(".app");
  if (!appRoot) return null;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const filesToAdd = selectedFiles.slice(0, 5 - images.length);

    if (filesToAdd.length > 0) {
      setImages((current) => [...current, ...filesToAdd]);
    }

    event.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  return createPortal(
    <div className="owner-request-backdrop">
      <div
        ref={modalRef}
        className="owner-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className="title02 owner-request-title">
          소유자 확인을 요청하시겠어요?
        </h2>

        <div className="owner-request-scroll-area">
          <div className="owner-request-field">
            <label className="body04">이름</label>
            <input
              className="body06 owner-request-input"
              value={userName}
              disabled
            />
          </div>

          <div className="owner-request-field">
            <label className="body04">학번</label>
            <input
              className="body06 owner-request-input"
              value={studentNumber}
              disabled
            />
          </div>

          <div className="owner-request-field">
            <label htmlFor="owner-request-inquiry" className="body04">
              문의내용 <span className="owner-request-required">*</span>
            </label>

            <div className="owner-request-textarea-wrapper">
              <textarea
                id="owner-request-inquiry"
                className="body06 owner-request-textarea"
                value={inquiry}
                maxLength={500}
                placeholder="소유자 확인에 필요한 내용을 입력하세요"
                onChange={(event) => setInquiry(event.target.value)}
              />
              <span className="caption04 owner-request-count">
                {inquiry.length}/500
              </span>
            </div>
          </div>

          <div className="owner-request-field">
            <div className="owner-request-file-title">
              <span className="body04">첨부파일</span>
              <span className="caption02">(선택)</span>
            </div>

            <div className="owner-request-files">
              <button
                type="button"
                className="owner-request-upload"
                disabled={images.length >= 5}
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={plusIcon} alt="사진 추가" />
                <span className="caption05">({images.length}/5)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="owner-request-file-input"
                onChange={handleImageChange}
              />

              {images.map((image, index) => (
                <div
                  key={`${image.name}-${index}`}
                  className="owner-request-preview"
                >
                  <img
                    src={imagePreviewUrls[index]}
                    alt={`첨부 이미지 ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="owner-request-preview-remove"
                    aria-label={`첨부 이미지 ${index + 1} 삭제`}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <img src={closeIcon} alt="" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="caption02 owner-request-error">{error}</p>}

        <div className="owner-request-actions">
          <button
            type="button"
            className="body02 owner-request-cancel"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="body02 owner-request-submit"
            disabled={inquiry.trim().length === 0 || isSubmitting}
            onClick={() => {
              setIsSubmitting(true);
              setError("");
              void onSubmit(inquiry.trim(), images)
                .then(() => {
                  setInquiry("");
                  setImages([]);
                })
                .catch((submitError) => {
                  setError(getUserErrorMessage(
                    submitError,
                    "소유자 확인 요청에 실패했습니다.",
                  ));
                })
                .finally(() => setIsSubmitting(false));
            }}
          >
            {isSubmitting ? "요청 중..." : "요청하기"}
          </button>
        </div>
      </div>
    </div>,
    appRoot,
  );
};

export default OwnerRequestModal;
