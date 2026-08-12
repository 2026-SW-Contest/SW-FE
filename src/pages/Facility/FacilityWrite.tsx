import { ChangeEvent, useRef, useState } from "react";

import SelectionBottomSheet from "../../components/common/SelectionBottomSheet/SelectionBottomSheet";
import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import chevronRightIcon from "../../assets/icons/actions/chevron-right.svg";
import plusIcon from "../../assets/icons/actions/plus.svg";
import {
  CAMPUS_LOCATION_OPTIONS,
  FACILITY_FILTER_DEFINITION,
} from "../../constants/filterOptions";

import "./FacilityWrite.css";

const FacilityWrite = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [openSelection, setOpenSelection] = useState<
    "category" | "location" | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeContentTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 112)}px`;
  };

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
    categories.length > 0 &&
    locations.length > 0 &&
    title.trim() !== "" &&
    content.trim() !== "";

  const categoryLabel = FACILITY_FILTER_DEFINITION.category
    .filter((option) => categories.includes(option.value))
    .map((option) => option.label)
    .join(", ");
  const locationLabel = CAMPUS_LOCATION_OPTIONS
    .filter((option) => locations.includes(option.value))
    .map((option) => option.label)
    .join(", ");

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
              aria-haspopup="dialog"
              aria-expanded={openSelection === "category"}
              onClick={() => setOpenSelection("category")}
            >
              <span
                className={`body06 ${
                  categories.length > 0
                    ? "facility-write-select-value"
                    : "facility-write-placeholder"
                }`}
              >
                {categoryLabel || "문의할 카테고리를 선택하세요"}
              </span>

              <img
                src={chevronRightIcon}
                alt=""
                className="facility-write-arrow"
              />

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
              aria-haspopup="dialog"
              aria-expanded={openSelection === "location"}
              onClick={() => setOpenSelection("location")}
            >
              <span
                className={`body06 ${
                  locations.length > 0
                    ? "facility-write-select-value"
                    : "facility-write-placeholder"
                }`}
              >
                {locationLabel || "문의할 장소를 선택하세요"}
              </span>

              <img
                src={chevronRightIcon}
                alt=""
                className="facility-write-arrow"
              />

            </button>

          </div>

          {/* ---------- 제목 ---------- */}

          <div className="facility-write-group">

            <label
              htmlFor="facility-inquiry-title"
              className="body01 facility-write-label"
            >
              제목
              <span> *</span>
            </label>

            <input
              id="facility-inquiry-title"
              type="text"
              className="body06 facility-write-title-input"
              placeholder="제목을 입력하세요"
              value={title}
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
            />

          </div>

          {/* ---------- 문의내용 ---------- */}

          <div className="facility-write-group">

            <label className="body01 facility-write-label">
              문의내용
              <span> *</span>
            </label>

            <div className="facility-write-textarea-wrapper">

              <textarea
                ref={contentTextareaRef}
                className="facility-write-textarea body06"
                placeholder="문의할 내용을 입력하세요"
                value={content}
                maxLength={500}
                onChange={(event) => {
                  setContent(event.target.value);
                  resizeContentTextarea(event.currentTarget);
                }}
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

        <SelectionBottomSheet
          isOpen={openSelection === "category"}
          title="카테고리 선택"
          options={FACILITY_FILTER_DEFINITION.category}
          value={categories}
          onApply={setCategories}
          onClose={() => setOpenSelection(null)}
        />

        <SelectionBottomSheet
          isOpen={openSelection === "location"}
          title="장소 선택"
          options={CAMPUS_LOCATION_OPTIONS}
          value={locations}
          onApply={setLocations}
          onClose={() => setOpenSelection(null)}
        />

      </div>
    </Layout>
  );
};

export default FacilityWrite;
