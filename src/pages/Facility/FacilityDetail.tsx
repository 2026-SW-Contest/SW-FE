import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import DetailImageCarousel from "../../components/common/DetailImageCarousel/DetailImageCarousel";

import { useFacilityInquiries } from "../../context/FacilityInquiryContext";
import { getFacilityRequest } from "../../api/facility";
import { FacilityItem } from "../../types/facility";

import "./FacilityDetail.css";

const formatAdminResponseDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
};

const FacilityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { facilityItems } = useFacilityInquiries();

  const listItem = facilityItems.find(
    (item) => item.id === Number(id)
  );
  const [item, setItem] = useState<FacilityItem | undefined>(listItem);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const facilityRequestId = Number(id);
    if (!Number.isFinite(facilityRequestId)) {
      setIsLoading(false);
      return;
    }

    let active = true;
    void getFacilityRequest(facilityRequestId)
      .then((response) => {
        if (active) setItem(response);
      })
      .catch(() => {
        // 목록 데이터가 있으면 상세 조회 실패 시에도 기본 정보는 유지한다.
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading && !item) {
    return (
      <Layout appBarVariant="detail" showBottomNavigation={false}>
        <div className="facility-detail-empty">불러오는 중...</div>
      </Layout>
    );
  }

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

        <DetailImageCarousel
          images={item.images}
          title={item.title}
        />

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

          {(item.adminResponses?.length ?? 0) > 0 && (
            <section
              className="facility-detail-responses"
              aria-label="관리자 답변 내역"
            >
              {item.adminResponses?.map((response) => (
                <article
                  key={response.responseId}
                  className="facility-detail-response"
                >
                  <div className="facility-detail-response-copy">
                    <span
                      className="facility-detail-response-icon"
                      aria-hidden="true"
                    >
                      ↳
                    </span>
                    <p className="facility-detail-response-content">
                      {response.content}
                    </p>
                  </div>
                  <time
                    className="facility-detail-response-date"
                    dateTime={response.createdAt}
                  >
                    {formatAdminResponseDate(response.createdAt)}
                  </time>
                </article>
              ))}
            </section>
          )}

        </div>

        {(item.deletable || item.editable) && (
          <div className="facility-detail-button">
            {item.deletable && (
              <button
                type="button"
                className="facility-detail-delete body02"
                onClick={() => {
                  // 추후 삭제 확인창과 API 연결
                }}
              >
                삭제하기
              </button>
            )}

            {item.editable && (
              <button
                type="button"
                className="facility-detail-edit body02"
                onClick={() => navigate(`/facility/${item.id}/edit`)}
              >
                수정하기
              </button>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default FacilityDetail;
