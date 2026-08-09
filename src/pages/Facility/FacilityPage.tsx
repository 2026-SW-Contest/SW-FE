import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import FacilityCard from "../../components/ui/FacilityCard";

import filterIcon from "../../assets/icons/common/filter(default).svg";
import fabIcon from "../../assets/icons/common/fab.svg";

import { facilityListData } from "../../mock";

import "./FacilityPage.css";

const FacilityPage = () => {
  const navigate = useNavigate();

  const hasItems = true;

  return (
    <Layout current="repair">
      <div className="facility-page">

        <div className="facility-title">
          <h1 className="body01">
            수리·개선 전체 문의사항
          </h1>
        </div>

        <div className="facility-filter">
          <button
            type="button"
            className="facility-filter-button"
          >
            <img
              src={filterIcon}
              alt="필터"
            />
          </button>
        </div>

        {hasItems ? (
          <div className="facility-list">

            {facilityListData.map((item) => (
              <FacilityCard
                key={item.id}
                item={item}
              />
            ))}

          </div>
        ) : (
          <div className="facility-empty">
            <p className="body05">
              등록된 시설·기자재 문의가 없습니다.
            </p>
          </div>
        )}

        {/* ---------- 문의하기 FAB ---------- */}

        <button
          type="button"
          className="facility-fab"
          onClick={() => navigate("/facility/write")}
        >
          <img
            src={fabIcon}
            alt="문의하기"
          />
        </button>

      </div>
    </Layout>
  );
};

export default FacilityPage;