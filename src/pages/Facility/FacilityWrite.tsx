import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SelectionBottomSheet from "../../components/common/SelectionBottomSheet/SelectionBottomSheet";
import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import Toast from "../../components/common/Toast/Toast";

import chevronRightIcon from "../../assets/icons/actions/chevron-right.svg";
import closeIcon from "../../assets/icons/actions/close.svg";
import plusIcon from "../../assets/icons/actions/plus.svg";
import { getFacilityCategories, getLocations } from "../../api/reference";
import { getFacilityRequest } from "../../api/facility";
import { FilterOption } from "../../constants/filterOptions";
import { useFacilityInquiries } from "../../context/FacilityInquiryContext";

import "./FacilityWrite.css";

const FacilityWrite = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const facilityRequestId = Number(id);
  const isEditMode = Number.isFinite(facilityRequestId);
  const { addFacilityInquiry, editFacilityInquiry } = useFacilityInquiries();
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<FilterOption[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [openSelection, setOpenSelection] = useState<
    "category" | "location" | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;

    void Promise.all([getFacilityCategories(), getLocations()])
      .then(([categoryResponse, locationResponse]) => {
        if (!active) return;
        setCategoryOptions(
          categoryResponse.map((category) => ({
            value: String(category.categoryId),
            label: category.categoryName,
          })),
        );
        setLocationOptions(
          locationResponse.map((location) => ({
            value: String(location.locationId),
            label: location.locationCode
              ? `${location.locationCode} ${location.locationName}`
              : location.locationName,
          })),
        );
      })
      .catch((error) => {
        if (!active) return;
        setToastMessage(
          error instanceof Error
            ? error.message
            : "카테고리와 장소를 불러오지 못했습니다.",
        );
        setShowToast(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    let active = true;
    void getFacilityRequest(facilityRequestId)
      .then((item) => {
        if (!active) return;
        if (!item.editable) {
          navigate(`/facility/${facilityRequestId}`, { replace: true });
          return;
        }

        setCategories(item.categoryId ? [String(item.categoryId)] : []);
        setLocations(item.locationId ? [String(item.locationId)] : []);
        setTitle(item.title);
        setContent(item.detailDescription ?? item.description);
        setExistingImages(item.images ?? []);
      })
      .catch((error) => {
        if (!active) return;
        setToastMessage(
          error instanceof Error ? error.message : "문의 내용을 불러오지 못했습니다.",
        );
        setShowToast(true);
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, [facilityRequestId, isEditMode, navigate]);

  useEffect(() => {
    if (contentTextareaRef.current) {
      resizeContentTextarea(contentTextareaRef.current);
    }
  }, [content]);

  const resizeContentTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 112)}px`;
  };

  const handleUploadClick = () => {
    if (existingImages.length + images.length >= 5) return;

    fileInputRef.current?.click();
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) return;

    const remainCount = 5 - existingImages.length - images.length;

    const filesToAdd = selectedFiles.slice(0, remainCount);

    setImages((prev) => [...prev, ...filesToAdd]);

    event.target.value = "";
  };

  const isFormValid =
    categories.length > 0 &&
    locations.length > 0 &&
    title.trim() !== "" &&
    content.trim() !== "";

  const categoryLabel = useMemo(
    () =>
      categoryOptions
        .filter((option) => categories.includes(option.value))
        .map((option) => option.label)
        .join(", "),
    [categories, categoryOptions],
  );
  const locationLabel = useMemo(
    () =>
      locationOptions
        .filter((option) => locations.includes(option.value))
        .map((option) => option.label)
        .join(", "),
    [locationOptions, locations],
  );

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

  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const inquiry = {
        title: title.trim(),
        description: content.trim(),
        categoryIds: categories.map(Number),
        locationIds: locations.map(Number),
        images,
      };

      if (isEditMode) {
        await editFacilityInquiry(facilityRequestId, inquiry);
      } else {
        await addFacilityInquiry(inquiry);
      }

      if (isEditMode) {
        // 상세 → 수정으로 진입했으므로 새 상세 이력을 쌓지 않고
        // 기존 상세 이력으로 돌아간다.
        navigate(-1);
      } else {
        navigate("/facility", { replace: true });
      }
    } catch (error) {
      setToastMessage(
        error instanceof Error
          ? error.message
          : `시설 문의 ${isEditMode ? "수정" : "등록"}에 실패했습니다.`,
      );
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      appBarVariant="detail"
      appBarTitle={isEditMode ? "문의 수정" : undefined}
      showBottomNavigation={false}
      scrollable={false}
      onBack={isEditMode ? () => navigate(-1) : undefined}
    >
      <form className="facility-write" onSubmit={handleSubmit}>

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
                disabled={existingImages.length + images.length >= 5}
              >
                <img
                  src={plusIcon}
                  alt="사진 추가"
                  className="facility-write-upload-icon"
                />

                <span className="caption05 facility-write-upload-count">
                  ({existingImages.length + images.length}/5)
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

              {existingImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="facility-write-preview"
                >
                  <img
                    src={image}
                    alt={`기존 첨부 이미지 ${index + 1}`}
                    className="facility-write-preview-image"
                  />
                  <button
                    type="button"
                    className="facility-write-preview-remove"
                    aria-label={`기존 첨부 이미지 ${index + 1} 삭제`}
                    onClick={() => handleRemoveExistingImage(index)}
                  >
                    <img src={closeIcon} alt="" />
                  </button>
                </div>
              ))}

              {images.map((image, index) => (

                <div
                  key={`${image.name}-${index}`}
                  className="facility-write-preview"
                >
                  <img
                    src={imagePreviewUrls[index]}
                    alt={`첨부 이미지 ${index + 1}`}
                    className="facility-write-preview-image"
                  />
                  <button
                    type="button"
                    className="facility-write-preview-remove"
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

        <div className="facility-write-button">

          <PrimaryButton
            type="submit"
            disabled={!isFormValid || isSubmitting || isInitializing}
          >
            {isSubmitting
              ? `${isEditMode ? "수정" : "등록"} 중...`
              : isEditMode
                ? "수정하기"
                : "등록하기"}
          </PrimaryButton>

        </div>

        <SelectionBottomSheet
          isOpen={openSelection === "category"}
          title="카테고리 선택"
          options={categoryOptions}
          value={categories}
          allowMultiple={false}
          onApply={setCategories}
          onClose={() => setOpenSelection(null)}
        />

        <SelectionBottomSheet
          isOpen={openSelection === "location"}
          title="장소 선택"
          options={locationOptions}
          value={locations}
          allowMultiple={false}
          onApply={setLocations}
          onClose={() => setOpenSelection(null)}
        />

        <Toast
          visible={showToast}
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />

      </form>
    </Layout>
  );
};

export default FacilityWrite;
