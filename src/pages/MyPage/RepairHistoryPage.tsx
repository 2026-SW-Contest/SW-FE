import { useState } from "react";

import Layout from "../../components/layout/Layout";
import FacilityCard from "../../components/ui/FacilityCard";
import filterIcon from "../../assets/icons/actions/filter.svg";
import { repairHistory } from "../../mock/mypage";

import "./HistoryPage.css";

const INITIAL_VISIBLE_COUNT = 6;

const RepairHistoryPage = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleHistory = showAll
    ? repairHistory
    : repairHistory.slice(0, INITIAL_VISIBLE_COUNT);

  const canToggleHistory =
    repairHistory.length > INITIAL_VISIBLE_COUNT;

  return (
    <Layout current="mypage">
      <div className="mypage-history-page">
        <div className="mypage-history-title-row">
          <h1 className="body01">수리·개선 문의 내역</h1>

          {canToggleHistory && (
            <button
              type="button"
              className="caption02 mypage-history-more"
              onClick={() => setShowAll((previous) => !previous)}
            >
              {showAll ? "접기" : "더보기"}
            </button>
          )}
        </div>

        <div className="mypage-history-filter">
          <button
            type="button"
            className="mypage-history-filter-button"
            aria-label="수리·개선 문의 내역 필터"
          >
            <img src={filterIcon} alt="" />
          </button>
        </div>

        {visibleHistory.length > 0 ? (
          <div className="mypage-history-card-list">
            {visibleHistory.map((item) => (
              <FacilityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mypage-history-empty">
            <p className="body05">
              수리·개선 문의 내역이 없습니다.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RepairHistoryPage;
