import Layout from "../../components/layout/Layout";

import LostPreviewCard from "../../components/ui/LostPreviewCard/LostPreviewCard";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";
import ServicePreviewCard from "../../components/ui/ServicePreviewCard/ServicePreviewCard";

import {
  facilityPreviewData,
  lostPreviewData,
} from "../../mock";

import "./Landing.css";

const Landing = () => {
  return (
    <Layout current="home">

      <div className="landing">

        {/* 최근 등록된 분실물 */}
        <section className="landing-section landing-lost-section">

          <div className="landing-header">

            <h2 className="body01">
              최근 등록된 분실물
            </h2>

            <button
              type="button"
              className="landing-more caption02"
            >
              전체보기
            </button>

          </div>

          <LostPreviewCard
            items={lostPreviewData}
          />

        </section>

        {/* 종합 서비스 */}
        <section className="landing-service-section">

          <div className="landing-header">

            <h2 className="body01">
              종합 서비스
            </h2>

            <button
              type="button"
              className="landing-more caption02"
            >
              전체보기
            </button>

          </div>

          {/* 카드만 스크롤 */}
          <div className="landing-service-list">

            <ServicePreviewCard
              items={facilityPreviewData.slice(0, 5)}
            />

          </div>

          {/* 버튼은 항상 하단 */}
          <div className="landing-service-button">

            <PrimaryButton>
              수리 · 개선 문의하기
            </PrimaryButton>

          </div>

        </section>

      </div>

    </Layout>
  );
};

export default Landing;