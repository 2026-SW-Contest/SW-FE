import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import AlertModal from "../../components/common/AlertModal/AlertModal";
import DetailImageCarousel from "../../components/common/DetailImageCarousel/DetailImageCarousel";
import Toast from "../../components/common/Toast/Toast";
import Layout from "../../components/layout/Layout";
import { TOAST_MESSAGE } from "../../constants/toastMessage";
import { useRecoveryRequests } from "../../context/RecoveryRequestContext";
import { useAuth } from "../../context/AuthContext";
import { createItemClaim, getStoredItem } from "../../api/lost";
import { LostItem } from "../../types/lost";
import { useLostItems } from "../../context/LostItemContext";

import OwnerRequestModal from "./OwnerRequestModal";

import "./LostDetail.css";

const LostDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { recoveryItems, requestedIds, requestRecovery } = useRecoveryRequests();
  const { lostItems } = useLostItems();
  const { isAuthenticated, user } = useAuth();
  const [isOwnerRequestOpen, setIsOwnerRequestOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const listItem = lostItems.find((current) => current.id === Number(id));
  const [item, setItem] = useState<LostItem | undefined>(listItem);
  const [isLoading, setIsLoading] = useState(true);

  const claim = item
    ? recoveryItems.find((requestItem) => requestItem.id === item.id)
    : undefined;
  const isRequested = item
    ? requestedIds.includes(item.id) && claim?.claimStatus !== "REJECTED"
    : false;

  useEffect(() => {
    const storedItemId = Number(id);
    if (!Number.isFinite(storedItemId)) {
      setIsLoading(false);
      return;
    }

    let active = true;
    void getStoredItem(storedItemId)
      .then((response) => {
        if (active) setItem(response);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const closeOwnerRequest = useCallback(
    () => setIsOwnerRequestOpen(false),
    [],
  );

  const handleOwnerRequestOpen = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsOwnerRequestOpen(true);
  };

  if (isLoading && !item) {
    return (
      <Layout appBarVariant="detail" showBottomNavigation={false}>
        <div className="lost-detail-empty">불러오는 중...</div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout
        appBarVariant="detail"
        showBottomNavigation={false}
      >
        <div className="lost-detail-empty">
          존재하지 않는 분실물입니다.
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      appBarVariant="detail"
      appBarTitle={item.title}
      showBottomNavigation={false}
    >
      <div className="lost-detail">

        {/* 사진 */}

        <DetailImageCarousel
          images={item.images}
          title={item.title}
        />

        {/* 내용 */}

        <div className="lost-detail-content">

          <div className="lost-detail-category-row">

            <span className="caption04 lost-detail-category-label">
              카테고리
            </span>

            <span className="caption04 lost-detail-category-value">
              {item.category}
            </span>

          </div>

          <div className="lost-detail-divider-thin" />

          <div className="lost-detail-info">

            <div className="lost-detail-row">

              <span className="body07 lost-detail-label">
                현재 상태
              </span>

              <img
                src={item.statusIcon}
                alt="상태"
                className="lost-detail-status"
              />

            </div>

            <div className="lost-detail-row">

              <span className="body07 lost-detail-label">
                보관 장소
              </span>

              <span className="body07 lost-detail-value">
                {item.storageLocation}
              </span>

            </div>

            <div className="lost-detail-row">

              <span className="body07 lost-detail-label">
                습득 장소
              </span>

              <span className="body07 lost-detail-value">
                {item.foundLocation}
              </span>

            </div>

            <div className="lost-detail-row">

              <span className="body07 lost-detail-label">
                습득 날짜
              </span>

              <span className="body07 lost-detail-value">
                {item.foundDate}
              </span>

            </div>

          </div>

          <div className="lost-detail-divider" />

          <p className="body06 lost-detail-description">
            {item.detailDescription}
          </p>

          {claim?.decisionMessage ? (
            <div
              className={`lost-detail-claim-result ${
                claim.claimStatus === "REJECTED" ? "rejected" : "approved"
              }`}
            >
              <span className="lost-detail-claim-result-arrow" aria-hidden="true">
                ↳
              </span>
              <div className="lost-detail-claim-result-content">
                <p className="body07">{claim.decisionMessage}</p>
                {claim.decidedAt ? (
                  <time className="caption04" dateTime={claim.decidedAt}>
                    {new Intl.DateTimeFormat("ko-KR", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    })
                      .format(new Date(claim.decidedAt))
                      .replace(/\.\s?/g, ".")
                      .replace(/\.$/, "")}
                  </time>
                ) : null}
              </div>
            </div>
          ) : null}

        </div>

        <div className="lost-detail-button">

          <button
            type="button"
            className="primary-button"
            disabled={isRequested || item.status === "resolved"}
            onClick={handleOwnerRequestOpen}
          >
            {item.status === "resolved"
              ? "해결 완료"
              : claim?.claimStatus === "REJECTED"
                ? "소유자 확인 재요청"
              : isRequested
                ? "소유자 확인 요청 완료"
                : "소유자 확인 요청"}
          </button>

        </div>

      </div>

      <OwnerRequestModal
        open={isOwnerRequestOpen}
        userName={user?.name ?? ""}
        studentNumber={user?.studentNumber ?? ""}
        onCancel={closeOwnerRequest}
        onSubmit={async (inquiry, images) => {
          await createItemClaim(item.id, inquiry, images);
          requestRecovery(item);
          closeOwnerRequest();
          setShowSuccessToast(true);
        }}
      />

      <Toast
        visible={showSuccessToast}
        message={TOAST_MESSAGE.OWNER_REQUESTED}
        onClose={() => setShowSuccessToast(false)}
      />

      <AlertModal
        open={isLoginModalOpen}
        message={"로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?"}
        cancelLabel="취소"
        confirmLabel="확인"
        onCancel={() => setIsLoginModalOpen(false)}
        onConfirm={() =>
          navigate("/login", {
            state: {
              from: `${location.pathname}${location.search}${location.hash}`,
            },
          })
        }
      />
    </Layout>
  );
};

export default LostDetail;
