import { useParams } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import { lostListData } from "../../mock";
import cameraIcon from "../../assets/icons/common/camera.svg";

import "./LostDetail.css";

const LostDetail = () => {
  const { id } = useParams();

  const item = lostListData.find(
    (item) => item.id === Number(id)
  );

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

        <div className="lost-detail-image-wrapper">

          {item.images && item.images.length > 0 ? (
            <>
              <img
                className="lost-detail-image"
                src={item.images[0]}
                alt={item.title}
              />

              <div className="lost-detail-image-count">
                1 / {item.images.length}
              </div>
            </>
          ) : (
            <div className="lost-detail-empty-image">

              <img
                src={cameraIcon}
                alt="등록된 이미지 없음"
                className="lost-detail-empty-image-icon"
              />

              <span className="body07 lost-detail-empty-image-text">
                등록된 이미지가 없습니다.
              </span>

            </div>
          )}

        </div>

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

          <button className="primary-button">
            소유자 확인 요청
          </button>

        </div>

      </div>
    </Layout>
  );
};

export default LostDetail;