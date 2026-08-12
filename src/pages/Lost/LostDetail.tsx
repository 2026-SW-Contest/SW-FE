import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import AlertModal from "../../components/common/AlertModal/AlertModal";
import DetailImageCarousel from "../../components/common/DetailImageCarousel/DetailImageCarousel";
import Layout from "../../components/layout/Layout";
import { useRecoveryRequests } from "../../context/RecoveryRequestContext";

import { lostListData } from "../../mock";
import OwnerRequestModal from "./OwnerRequestModal";

import "./LostDetail.css";

const LostDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { requestedIds, requestRecovery } = useRecoveryRequests();
  const [isOwnerRequestOpen, setIsOwnerRequestOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const item = lostListData.find(
    (item) => item.id === Number(id)
  );
  const isRequested = item ? requestedIds.includes(item.id) : false;

  const closeOwnerRequest = useCallback(
    () => setIsOwnerRequestOpen(false),
    [],
  );

  const handleOwnerRequestOpen = () => {
    if (localStorage.getItem("isLogin") !== "true") {
      setIsLoginModalOpen(true);
      return;
    }

    setIsOwnerRequestOpen(true);
  };

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

        </div>

        <div className="lost-detail-button">

          <button
            type="button"
            className="primary-button"
            disabled={isRequested}
            onClick={handleOwnerRequestOpen}
          >
            {isRequested ? "소유자 확인 요청 완료" : "소유자 확인 요청"}
          </button>

        </div>

      </div>

      <OwnerRequestModal
        open={isOwnerRequestOpen}
        onCancel={closeOwnerRequest}
        onSubmit={() => {
          requestRecovery(item.id);
          closeOwnerRequest();
        }}
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
