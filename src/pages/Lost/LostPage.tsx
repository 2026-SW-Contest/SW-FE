import Layout from "../../components/layout/Layout";

import LostCard from "../../components/ui/LostCard";

import filterIcon from "../../assets/icons/actions/filter.svg";

import { lostListData } from "../../mock";

import "./LostPage.css";

const LostPage = () => {
  const hasItems = true;

  return (
    <Layout current="lost">
      <div className="lost-page">

        <div className="lost-title">
          <h1 className="body01">
            전체 분실물
          </h1>
        </div>

        <div className="lost-filter">
          <button
            type="button"
            className="lost-filter-button"
          >
            <img
              src={filterIcon}
              alt="필터"
            />
          </button>
        </div>

        {hasItems ? (
          <div className="lost-list">

            {lostListData.map((item, index) => (
              <LostCard
                key={item.id}
                item={item}
              />
            ))}

          </div>
        ) : (
          <div className="lost-empty">
            <p className="body05">
              등록된 분실물이 없습니다
            </p>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default LostPage;
