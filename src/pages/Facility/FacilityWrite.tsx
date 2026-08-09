import { ChangeEvent, useRef, useState } from "react";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import plusIcon from "../../assets/icons/common/plus.svg";

import "./FacilityWrite.css";

const FacilityWrite = () => {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (images.length >= 5) return;

    fileInputRef.current?.click();
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) return;

    const remainCount = 5 - images.length;

    const filesToAdd = selectedFiles.slice(0, remainCount);

    setImages((prev) => [...prev, ...filesToAdd]);

    event.target.value = "";
  };

  const isFormValid =
    category.trim() !== "" &&
    location.trim() !== "" &&
    content.trim() !== "";

  return (
    <Layout
      appBarVariant="detail"
      showBottomNavigation={false}
      scrollable={false}
    >
      <div className="facility-write">

        <div className="facility-write-content">

          {/* ---------- 카테고리 ---------- */}

          <div className="facility-write-group">

            <label className="body01 facility-write-label">
              카테고리
              <span> *</span>
            </label>

            <button
              type="button"
              className="facility-write-select"
              onClick={() => setCategory("전기/조명")}
            >
              <span
                className={`body06 ${
                  category
                    ? "facility-write-select-value"
                    : "facility-write-placeholder"
                }`}
              >
                {category || "문의할 카테고리를 선택하세요"}
              </span>

              <span className="facility-write-arrow">
                ⌄
              </span>

            </button>

          </div>

          {/* ---------- 장소 ---------- */}

          <div className="facility-write-group">

            <label className="body01 facility-write-label">
              장소
              <span> *</span>
            </label>

            <button
              type="button"
              className="facility-write-select"
              onClick={() => setLocation("학생회관")}
            >
              <span
                className={`body06 ${
                  location
                    ? "facility-write-select-value"
                    : "facility-write-placeholder"
                }`}
              >
                {location || "문의할 장소를 선택하세요"}
              </span>

              <span className="facility-write-arrow">
                ⌄
              </span>

            </button>

          </div>

          {/* ---------- 문의내용 ---------- */}

          <div className="facility-write-group">

            <label className="body01 facility-write-label">
              문의내용
              <span> *</span>
            </label>

            <div className="facility-write-textarea-wrapper">

              <textarea
                className="facility-write-textarea body06"
                placeholder="문의할 내용을 입력하세요"
                value={content}
                maxLength={500}
                onChange={(event) =>
                  setContent(event.target.value)
                }
              />

              <span className="caption04 facility-write-count">
                {content.length}/500
              </span>

            </div>

          </div>

          {/* ---------- 첨부파일 ---------- */}

          <div className="facility-write-group">

            <div className="facility-write-label-row">

              <span className="body01 facility-write-label">
                첨부파일
              </span>

              <span className="body07 facility-write-optional">
                (선택)
              </span>

            </div>

            <div className="facility-write-upload-list">

              <button
                type="button"
                className="facility-write-upload"
                onClick={handleUploadClick}
                disabled={images.length >= 5}
              >
                <img
                  src={plusIcon}
                  alt="사진 추가"
                  className="facility-write-upload-icon"
                />

                <span className="caption05 facility-write-upload-count">
                  ({images.length}/5)
                </span>

              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="facility-write-file-input"
                onChange={handleImageChange}
              />

              {images.map((image, index) => (

                <div
                  key={`${image.name}-${index}`}
                  className="facility-write-preview"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`첨부 이미지 ${index + 1}`}
                    className="facility-write-preview-image"
                  />
                </div>

              ))}

            </div>

          </div>

        </div>

        <div className="facility-write-button">

          <PrimaryButton disabled={!isFormValid}>
            등록하기
          </PrimaryButton>

        </div>

      </div>
    </Layout>
  );
};

export default FacilityWrite;