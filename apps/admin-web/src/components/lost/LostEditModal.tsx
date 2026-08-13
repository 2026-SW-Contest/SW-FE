import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import closeIcon from "../../../../../src/assets/icons/actions/close.svg";
import plusIcon from "../../../../../src/assets/icons/actions/plus.svg";
import {
  StoredItemEditDetail,
} from "../../../../../src/api/adminLost";
import { getPublicFileUrl } from "../../../../../src/api/file";
import {
  getItemCategories,
  getLocations,
  getLostItemOffices,
  LostItemOfficeResponse,
} from "../../../../../src/api/reference";
import { getUserErrorMessage } from "../../../../../src/utils/userErrorMessage";
import { AdminStatus } from "../../types";
import { toAdminLostStatus } from "../../utils/status";
import { RequiredMark } from "../common/AdminPrimitives";
import { AdminConfirmModal } from "../layout/AdminConfirmModal";

const DELETE_ERROR_MESSAGES: Record<string, string> = {
  STORED_ITEM_ACCESS_DENIED:
    "이 분실물을 삭제할 수 있는 담당처 권한이 없습니다.",
  STORED_ITEM_NOT_FOUND:
    "이미 삭제되었거나 존재하지 않는 분실물입니다.",
  STORED_ITEM_NOT_DELETABLE:
    "보관 중인 분실물만 삭제할 수 있습니다.",
  STORED_ITEM_HAS_CLAIMS:
    "소유자 확인 요청이 존재하는 분실물은 삭제할 수 없습니다.",
  STORED_ITEM_VERSION_CONFLICT:
    "분실물 정보가 다른 곳에서 변경되었습니다. 다시 열어주세요.",
};

export interface LostEditInput {
  title: string;
  officeId: number;
  categoryId: number;
  categoryName: string;
  locationId: number;
  locationName: string;
  detailLocation: string;
  storageLocation: string;
  foundDate: string;
  description: string;
  status: AdminStatus;
  keepFileIds: number[];
  files: File[];
}

interface LostEditModalProps {
  item: StoredItemEditDetail;
  onClose: () => void;
  onSubmit: (input: LostEditInput) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const LostEditModal = ({
  item,
  onClose,
  onSubmit,
  onDelete,
}: LostEditModalProps) => {
  const [locationId, setLocationId] = useState(item.foundLocation?.locationId ?? 0);
  const [categoryId, setCategoryId] = useState(item.category.categoryId);
  const [officeId, setOfficeId] = useState(item.office.officeId);
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
  const [existingAttachments, setExistingAttachments] = useState(
    item.attachments,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(
    () => () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [previewUrls],
  );

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const remainingCount = 5 - existingAttachments.length - files.length;
    const selectedFiles = Array.from(event.target.files ?? [])
      .slice(0, remainingCount);

    if (selectedFiles.length) {
      setFiles((current) => [...current, ...selectedFiles]);
    }
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isDeleting) return;

    const data = new FormData(event.currentTarget);
    const categoryId = Number(data.get("categoryId"));
    const locationId = Number(data.get("locationId"));
    const officeId = Number(data.get("officeId"));
    const category = categories.find((current) => current.categoryId === categoryId);
    const location = locations.find((current) => current.locationId === locationId);
    const office = offices.find((current) => current.officeId === officeId);

    if (!location || !office) {
      setSubmitError("습득 장소와 분실물 보관소를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        title: String(data.get("title")),
        officeId,
        categoryId,
        categoryName: category?.categoryName ?? item.category.name,
        locationId,
        locationName: [location.locationCode, location.locationName]
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
        description: String(data.get("description")),
        status: data.get("status") as AdminStatus,
        keepFileIds: existingAttachments.map(
          (attachment) => attachment.fileId,
        ),
        files,
      });
    } catch (error) {
      setSubmitError(getUserErrorMessage(error, "분실물 수정에 실패했습니다."));
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await onDelete();
      onClose();
    } catch (error) {
      setDeleteError(getUserErrorMessage(
        error,
        "분실물을 삭제하지 못했습니다.",
        DELETE_ERROR_MESSAGES,
      ));
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <form className="admin-modal" onSubmit={handleSubmit}>
        <div className="admin-modal-header">
          <div>
            <h2>분실물 게시글 수정</h2>
            <p>등록된 분실물 정보를 변경합니다. 기존 이미지는 그대로 유지됩니다.</p>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-field admin-field-wide">
            <div className="admin-attachment-header">
              <span>첨부 이미지</span>
              <small>{existingAttachments.length + files.length}/5</small>
            </div>
            <div className="admin-attachment-list">
              <button
                type="button"
                className="admin-attachment-add"
                disabled={
                  isSubmitting ||
                  isDeleting ||
                  existingAttachments.length + files.length >= 5
                }
                onClick={() => fileInputRef.current?.click()}
              >
                <img src={plusIcon} alt="" />
                <span>추가</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="admin-photo-input"
                onChange={handleFileChange}
              />
              {existingAttachments.map((attachment, index) => (
                <div
                  key={attachment.fileId}
                  className="admin-attachment-preview"
                >
                  <img
                    src={attachment.fileUrl ?? getPublicFileUrl(attachment.fileId)}
                    alt={`기존 첨부 이미지 ${index + 1}`}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || isDeleting}
                    aria-label={`기존 첨부 이미지 ${index + 1} 삭제`}
                    onClick={() => setExistingAttachments((current) =>
                      current.filter((currentAttachment) =>
                        currentAttachment.fileId !== attachment.fileId
                      )
                    )}
                  >
                    <img src={closeIcon} alt="" />
                  </button>
                </div>
              ))}
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}-${index}`}
                  className="admin-attachment-preview"
                >
                  <img
                    src={previewUrls[index]}
                    alt={`신규 첨부 이미지 ${index + 1}`}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || isDeleting}
                    aria-label={`신규 첨부 이미지 ${index + 1} 삭제`}
                    onClick={() => setFiles((current) =>
                      current.filter((_, fileIndex) => fileIndex !== index)
                    )}
                  >
                    <img src={closeIcon} alt="" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <label className="admin-field admin-field-wide">
            <span>게시글 제목 <RequiredMark /></span>
            <input
              name="title"
              required
              maxLength={150}
              defaultValue={item.itemName}
            />
          </label>
          <label className="admin-field">
            <span>처리 상태 <RequiredMark /></span>
            <select name="status" required defaultValue={toAdminLostStatus(item.publicStatus)}>
              <option value="waiting">보관중</option>
              <option value="inProgress">진행중</option>
              <option value="resolved">해결완료</option>
            </select>
          </label>
          <label className="admin-field">
            <span>습득 일자 <RequiredMark /></span>
            <input name="foundDate" type="date" required defaultValue={item.foundDate} />
          </label>
          <label className="admin-field">
            <span>습득 장소 <RequiredMark /></span>
            <select
              name="locationId"
              required
              disabled={!locations.length}
              value={locationId || ""}
              onChange={(event) => setLocationId(Number(event.target.value))}
            >
              {!item.foundLocation?.locationId && <option value="">선택해주세요</option>}
              {locations.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {[location.locationCode, location.locationName].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>상세 위치</span>
            <input
              name="detailLocation"
              maxLength={255}
              defaultValue={item.foundLocation?.locationText ?? ""}
              placeholder="예: 1층 로비"
            />
          </label>
          <label className="admin-field">
            <span>카테고리 <RequiredMark /></span>
            <select
              name="categoryId"
              required
              disabled={!categories.length}
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
            >
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>보관 장소 <RequiredMark /></span>
            <select
              name="officeId"
              required
              disabled={!offices.length}
              value={officeId}
              onChange={(event) => setOfficeId(Number(event.target.value))}
            >
              {offices.map((office) => (
                <option key={office.officeId} value={office.officeId}>
                  {[office.buildingCode, office.buildingName, office.floor, office.locationName]
                    .filter(Boolean)
                    .join(" ")}
                  {office.primary ? " · 대표" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field-wide">
            <span>물건 상세 정보 <RequiredMark /></span>
            <textarea
              name="description"
              rows={4}
              required
              maxLength={500}
              defaultValue={item.description}
            />
          </label>
        </div>
        {submitError && <p className="admin-confirm-error">{submitError}</p>}
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-delete-button"
            disabled={isSubmitting || isDeleting || item.publicStatus !== "STORED"}
            title={item.publicStatus !== "STORED"
              ? "보관 중인 분실물만 삭제할 수 있습니다."
              : undefined}
            onClick={() => {
              setDeleteError("");
              setIsDeleteConfirmOpen(true);
            }}
          >
            삭제하기
          </button>
          <button
            type="button"
            disabled={isSubmitting || isDeleting}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isDeleting ||
              !locations.length ||
              !categories.length ||
              !offices.length
            }
            className="admin-primary-button"
          >
            {isSubmitting ? "수정 중" : "수정하기"}
          </button>
        </div>
      </form>
      {isDeleteConfirmOpen && (
        <AdminConfirmModal
          title="분실물을 삭제하시겠습니까?"
          description={`‘${item.itemName}’ 분실물과 첨부파일이 함께 삭제되며 복구할 수 없습니다.`}
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
