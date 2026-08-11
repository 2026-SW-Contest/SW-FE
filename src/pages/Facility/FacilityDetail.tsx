import { useNavigate, useParams } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import { facilityListData } from "../../mock";
import cameraIcon from "../../assets/icons/placeholders/no-photo.svg";

import "./FacilityDetail.css";

const FacilityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const item = facilityListData.find(
    (item) => item.id === Number(id)
  );

  if (!item) {
    return (
      <Layout
        appBarVariant="detail"
        showBottomNavigation={false}
      >
        <div className="facility-detail-empty">
          존재하지 않는 시설 문의입니다.
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
      <div className="facility-detail">

        {/* ---------- 사진 ---------- */}

        <div className="facility-detail-image-wrapper">

          {item.images && item.images.length > 0 ? (
            <>
              <img
                className="facility-detail-image"
                src={item.images[0]}
                alt={item.title}
              />

              <div className="facility-detail-image-count">
                1 / {item.images.length}
              </div>
            </>
          ) : (
            <div className="facility-detail-empty-image">

              <img
                src={cameraIcon}
                alt="등록된 이미지 없음"
                className="facility-detail-empty-image-icon"
              />

              <span className="body07 facility-detail-empty-image-text">
                등록된 이미지가 없습니다.
              </span>

            </div>
          )}

        </div>

        {/* ---------- 내용 ---------- */}

        <div className="facility-detail-content">

          <div className="facility-detail-info">

            <div className="facility-detail-row">

              <span className="body07 facility-detail-label">
                현재 상태
              </span>

              <img
                src={item.statusIcon}
                alt="상태"
                className="facility-detail-status"
              />

            </div>

            <div className="facility-detail-row">

              <span className="body07 facility-detail-label">
                문의 유형
              </span>

              <span className="body07 facility-detail-value">
                {item.type}
              </span>

            </div>

            <div className="facility-detail-row">

              <span className="body07 facility-detail-label">
                작성 날짜
              </span>

              <span className="body07 facility-detail-value">
                {item.date}
              </span>

            </div>

          </div>

          <div className="facility-detail-divider" />

          <p className="body06 facility-detail-description">
            {item.detailDescription}
          </p>

        </div>

        <div className="facility-detail-button">

        <button
            type="button"
            className="facility-detail-delete body02"
            onClick={() => {
            // 추후 삭제 API 연결
            }}
        >
          삭제하기
        </button>

        <button
            type="button"
            className="facility-detail-edit body02"
            onClick={() => navigate("/facility/write")}
        >
          수정하기
        </button>

        </div>

      </div>
    </Layout>
  );
};

export default FacilityDetail;
