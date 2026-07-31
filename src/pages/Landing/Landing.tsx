import Layout from "../../components/layout/Layout";

import PreviewCard from "../../components/ui/PreviewCard/PreviewCard";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import {
  facilityPreviewData,
  lostPreviewData,
} from "../../mock";

import "./Landing.css";

const Landing = () => {
  return (
    <Layout current="home">

      <div className="landing">

        <section className="landing-section">

          <div className="landing-header">

            <h2>최근 등록된 분실물</h2>

            <button type="button">
              소유자 확인 요청
            </button>

          </div>

          <PreviewCard
            items={lostPreviewData}
            actionLabel="확인하기"
          />

        </section>

        <section className="landing-section">

          <h2>종합 서비스</h2>

          <PrimaryButton>
            수리 · 개선 문의하기
          </PrimaryButton>

          <PreviewCard
            items={facilityPreviewData}
            actionLabel="보기"
          />

        </section>

      </div>

    </Layout>
  );
};

export default Landing;
