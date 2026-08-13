import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import LostPreviewCard from "../../components/ui/LostPreviewCard/LostPreviewCard";
import FacilityPreviewCard from "../../components/ui/FacilityPreviewCard/FacilityPreviewCard";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import { useFacilityInquiries } from "../../context/FacilityInquiryContext";
import { useLostItems } from "../../context/LostItemContext";

import "./Landing.css";

const PREVIEW_ITEM_COUNT = 5;

const getItemDateTime = (date: string) => {
  const match = date.match(/^(\d{2,4})\.(\d{2})\.(\d{2})/);

  if (!match) return 0;

  const rawYear = Number(match[1]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  return new Date(year, Number(match[2]) - 1, Number(match[3])).getTime();
};

const getLatestItems = <T extends { date: string }>(items: T[]) =>
  [...items]
    .sort((first, second) =>
      getItemDateTime(second.date) - getItemDateTime(first.date),
    )
    .slice(0, PREVIEW_ITEM_COUNT);

const Landing = () => {
  const navigate = useNavigate();
  const { facilityItems } = useFacilityInquiries();
  const { lostItems } = useLostItems();

  return (
    <Layout current="home">

      <div className="landing">

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-hero-eyebrow">SMART CAMPUS SERVICE</span>
            <h1>교내 분실물과 시설 문의를<br />한곳에서 빠르게 해결하세요</h1>
            <p>
              잃어버린 물건을 확인하고, 불편한 시설을 간편하게 제보할 수 있어요.
            </p>
            <div className="landing-hero-actions">
              <button type="button" onClick={() => navigate("/lost")}>분실물 찾아보기</button>
              <button type="button" onClick={() => navigate("/facility/write")}>수리·개선 문의하기</button>
            </div>
          </div>
          <div className="landing-hero-summary" aria-label="서비스 현황">
            <div><strong>{lostItems.length}</strong><span>등록 분실물</span></div>
            <div><strong>{facilityItems.length}</strong><span>시설 문의</span></div>
          </div>
        </section>

        {/* 최근 등록된 분실물 */}
        <section className="landing-lost-section">

          <div className="landing-header">

            <h2 className="body01">
              최근 등록된 분실물
            </h2>

            <button
              type="button"
              className="landing-more caption02"
              onClick={() => navigate("/lost")}
            >
              전체보기
            </button>

          </div>

          <LostPreviewCard
            items={getLatestItems(lostItems)}
          />

        </section>

        {/* 종합 서비스 */}
        <section className="landing-facility-section">

          <div className="landing-header">

            <h2 className="body01">
              수리·개선 서비스
            </h2>

            <button
              type="button"
              className="landing-more caption02"
              onClick={() => navigate("/facility")}
            >
              전체보기
            </button>

          </div>

          <div className="landing-facility-list">

            <FacilityPreviewCard
              items={getLatestItems(facilityItems)}
            />

          </div>

          <div className="landing-facility-button">

            <PrimaryButton
              onClick={() => navigate("/facility/write")}
              >
              수리 · 개선 문의하기
            </PrimaryButton>

          </div>

        </section>

      </div>

    </Layout>
  );
};

export default Landing;
