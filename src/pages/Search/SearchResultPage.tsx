import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import LostCard from "../../components/ui/LostCard";
import FacilityCard from "../../components/ui/FacilityCard";

import filterIcon from "../../assets/icons/common/filter(default).svg";
import alerticon from "../../assets/icons/common/alert.svg";
import checkIcon from "../../assets/icons/common/check.svg";

import {
  lostListData,
  facilityListData,
} from "../../mock";

import "./SearchResultPage.css";

const SearchResultPage = () => {

  const location = useLocation();

  const keyword =
    new URLSearchParams(location.search)
      .get("q") ?? "";

  const [searchValue, setSearchValue] =
    useState(keyword);

  const [tab, setTab] = useState<
    "lost" | "facility"
  >("lost");

  const [isAlertOn, setIsAlertOn] = useState(false);

  const lostResult = useMemo(() => {

    const value =
      searchValue.trim().toLowerCase();

    if (!value) return [];

    return lostListData.filter((item) =>
      item.title
        .toLowerCase()
        .includes(value)
    );

  }, [searchValue]);

  const facilityResult = useMemo(() => {

    const value =
      searchValue.trim().toLowerCase();

    if (!value) return [];

    return facilityListData.filter((item) =>
      item.title
        .toLowerCase()
        .includes(value)
    );

  }, [searchValue]);

  return (

    <Layout
      current="search"
      appBarVariant="search"
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onClearSearch={() => setSearchValue("")}
    >

      <div className="search-result-page">

        {/* ---------- Tab ---------- */}
        <div className="search-result-tab">

        <button
            type="button"
            className={`${
            tab === "lost"
                ? "search-result-tab-button active body05"
                : "search-result-tab-button body06"
            }`}
            onClick={() => setTab("lost")}
        >
            분실물 ({lostResult.length})
        </button>

        <button
            type="button"
            className={`${
            tab === "facility"
                ? "search-result-tab-button active body05"
                : "search-result-tab-button body06"
            }`}
            onClick={() => setTab("facility")}
        >
            시설 · 기자재 ({facilityResult.length})
        </button>

        </div>

        {/* ---------- Toolbar ---------- */}

        <div className="search-result-toolbar">

        <div className="search-filter">

            <button
            type="button"
            className="search-filter-button"
            >
            <img
                src={filterIcon}
                alt="필터"
            />
            </button>

        </div>

        <button
        type="button"
        className="search-alert-button"
        onClick={() => setIsAlertOn((prev) => !prev)}
        >

        <img
            src={isAlertOn ? checkIcon : alerticon}
            alt=""
            className="search-alert-icon"
        />

        <span className="body06">

            {isAlertOn
            ? "알림 받는 중"
            : `'${searchValue}' 알림받기`}

        </span>

        </button>

        </div>

        {/* ---------- List ---------- */}

        <div className="search-result-list">

          {tab === "lost" && (

            lostResult.length > 0 ? (

              lostResult.map((item) => (

                <LostCard
                  key={item.id}
                  item={item}
                />

              ))

            ) : (

              <div className="search-empty">

                검색 결과가 없습니다.

              </div>

            )

          )}

          {tab === "facility" && (

            facilityResult.length > 0 ? (

              facilityResult.map((item) => (

                <FacilityCard
                  key={item.id}
                  item={item}
                />

              ))

            ) : (

              <div className="search-empty">

                검색 결과가 없습니다.

              </div>

            )

          )}

        </div>

      </div>

    </Layout>

  );

};

export default SearchResultPage;