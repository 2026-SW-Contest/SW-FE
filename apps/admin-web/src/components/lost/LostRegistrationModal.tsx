import { FormEvent, useEffect, useState } from "react";
import plusIcon from "../../../../../src/assets/icons/actions/plus.svg";
import { getItemCategories, getLocations, getLostItemOffices, LostItemOfficeResponse } from "../../../../../src/api/reference";
import { getUserErrorMessage } from "../../../../../src/utils/userErrorMessage";
import { AdminStatus } from "../../types";
import { RequiredMark } from "../common/AdminPrimitives";

export interface LostRegistrationInput {
  title: string;
  officeId: number;
  categoryId: number;
  categoryName: string;
  locationId: number;
  locationName: string;
  detailLocation: string;
  storageLocation: string;
  foundDate: string;
  detail: string;
  status: AdminStatus;
  image: File;
}

export const LostRegistrationModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: LostRegistrationInput) => Promise<void> }) => {
  const [representativeImage, setRepresentativeImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [locations, setLocations] = useState<Array<{
    locationId: number;
    locationCode: string | null;
    locationName: string;
  }>>([]);
  const [categories, setCategories] = useState<Array<{
    categoryId: number;
    categoryName: string;
  }>>([]);
  const [offices, setOffices] = useState<LostItemOfficeResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      getLocations(),
      getItemCategories(),
      getLostItemOffices(),
    ])
      .then(([locationItems, categoryItems, officeItems]) => {
        if (!active) return;
        setLocations(locationItems);
        setCategories(categoryItems);
        setOffices(officeItems);
      })
      .catch((error) => {
        if (active) {
          setSubmitError(getUserErrorMessage(error, "기준정보를 불러오지 못했습니다."));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!representativeImage) {
      setPreviewUrl("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(representativeImage);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [representativeImage]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!representativeImage || isSubmitting) return;

    const data = new FormData(event.currentTarget);
    const categoryId = Number(data.get("categoryId"));
    const locationId = Number(data.get("locationId"));
    const officeId = Number(data.get("officeId"));
    const category = categories.find((item) => item.categoryId === categoryId);
    const location = locations.find((item) => item.locationId === locationId);
    const office = offices.find((item) => item.officeId === officeId);

    if (!office) {
      setSubmitError("분실물 보관소를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
      title: String(data.get("title")),
      officeId,
      categoryId,
      categoryName: category?.categoryName ?? "기타",
      locationId,
      locationName: [location?.locationCode, location?.locationName]
        .filter(Boolean)
        .join(" "),
      detailLocation: String(data.get("detailLocation")),
      storageLocation: [
        office.buildingCode,
        office.buildingName,
        office.floor,
        office.locationName,
      ].filter(Boolean).join(" "),
      foundDate: String(data.get("foundDate")),
      detail: String(data.get("detail")),
      status: data.get("status") as AdminStatus,
      image: representativeImage,
      });
    } catch (error) {
      setSubmitError(getUserErrorMessage(error, "분실물 등록에 실패했습니다."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form className="admin-modal" onSubmit={handleSubmit}>
        <div className="admin-modal-header"><div><h2>분실물 게시글 등록</h2><p>필수 정보를 입력해 학생 서비스에 게시합니다.</p></div><button type="button" onClick={onClose}>×</button></div>
        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <span>대표 사진 <RequiredMark /></span>
            <label
              htmlFor="admin-lost-photo"
              className={`admin-photo-uploader ${previewUrl ? "has-image" : ""}`}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="대표 사진 미리보기" />
              ) : (
                <div className="admin-photo-placeholder">
                  <span className="admin-photo-icon"><img src={plusIcon} alt="" /></span>
                  <strong>대표 사진을 등록해주세요</strong>
                  <small>JPG, PNG 등 이미지 파일을 선택할 수 있습니다.</small>
                </div>
              )}
              {previewUrl && <span className="admin-photo-change-hint">클릭하여 사진 교체</span>}
              <input
                id="admin-lost-photo"
                name="representativeImage"
                type="file"
                accept="image/*"
                required
                className="admin-photo-input"
                onChange={(event) =>
                  setRepresentativeImage(event.target.files?.[0] ?? null)
                }
              />
            </label>
            {representativeImage && (
              <span className="admin-photo-filename">{representativeImage.name}</span>
            )}
          </div>
          <label className="admin-field admin-field-wide"><span>게시글 제목 <RequiredMark /></span><input name="title" required placeholder="분실물의 특징이 드러나는 제목" /></label>
          <label className="admin-field"><span>처리 상태 <RequiredMark /></span><select name="status" required><option value="waiting">보관중</option><option value="inProgress">진행중</option><option value="resolved">해결완료</option></select></label>
          <label className="admin-field"><span>습득 일자 <RequiredMark /></span><input name="foundDate" type="date" required /></label>
          <label className="admin-field"><span>습득 장소 <RequiredMark /></span><select name="locationId" required disabled={!locations.length}>{locations.map((location) => <option key={location.locationId} value={location.locationId}>{[location.locationCode, location.locationName].filter(Boolean).join(" ")}</option>)}</select></label>
          <label className="admin-field"><span>상세 위치</span><input name="detailLocation" placeholder="예: 1층 로비" /></label>
          <label className="admin-field"><span>카테고리 <RequiredMark /></span><select name="categoryId" required disabled={!categories.length}>{categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></label>
          <label className="admin-field"><span>보관 장소 <RequiredMark /></span><select name="officeId" required disabled={!offices.length}>{offices.map((office) => <option key={office.officeId} value={office.officeId}>{[office.buildingCode, office.buildingName, office.floor, office.locationName].filter(Boolean).join(" ")}{office.primary ? " · 대표" : ""}</option>)}</select></label>
          <label className="admin-field admin-field-wide"><span>물건 상세 정보</span><textarea name="detail" rows={4} placeholder="물건의 색상, 특징, 구성품 등을 입력하세요." /></label>
        </div>
        {submitError && <p className="admin-confirm-error">{submitError}</p>}
        <div className="admin-modal-actions"><button type="button" disabled={isSubmitting} onClick={onClose}>취소</button><button type="submit" disabled={isSubmitting || !locations.length || !categories.length || !offices.length} className="admin-primary-button">{isSubmitting ? "등록 중" : "등록하기"}</button></div>
      </form>
    </div>
  );
};

