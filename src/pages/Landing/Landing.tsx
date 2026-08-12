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
