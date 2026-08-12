import { ChangeEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import plusIcon from "../../assets/icons/actions/plus.svg";
import { mockUser } from "../../mock/user";

import "./OwnerRequestModal.css";

interface OwnerRequestModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const OwnerRequestModal = ({
  open,
  onCancel,
  onSubmit,
}: OwnerRequestModalProps) => {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inquiry, setInquiry] = useState("");
  const [images, setImages] = useState<File[]>([]);

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
              value={mockUser.name}
              disabled
            />
          </div>

          <div className="owner-request-field">
            <label className="body04">학번</label>
            <input
              className="body06 owner-request-input"
              value={mockUser.studentId}
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
                <img
                  key={`${image.name}-${index}`}
                  src={URL.createObjectURL(image)}
                  alt={`첨부 이미지 ${index + 1}`}
                  className="owner-request-preview"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="owner-request-actions">
          <button
            type="button"
            className="body02 owner-request-cancel"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="body02 owner-request-submit"
            disabled={inquiry.trim().length === 0}
            onClick={() => {
              onSubmit();
              setInquiry("");
              setImages([]);
            }}
          >
            요청하기
          </button>
        </div>
      </div>
    </div>,
    appRoot,
  );
};

export default OwnerRequestModal;
