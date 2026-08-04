import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import LostPreviewCard from "../../components/ui/LostPreviewCard/LostPreviewCard";
import FacilityPreviewCard from "../../components/ui/FacilityPreviewCard/FacilityPreviewCard";
import PrimaryButton from "../../components/ui/PrimaryButton/PrimaryButton";

import {
  facilityListData,
  lostListData,
} from "../../mock";

import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Layout current="home">

      <div className="landing">

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
            items={lostListData}
          />

        </section>

        {/* 종합 서비스 */}
        <section className="landing-facility-section">

          <div className="landing-header">

            <h2 className="body01">
              종합 서비스
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
              items={facilityListData}
            />

          </div>

          <div className="landing-facility-button">

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