import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import FilterBottomSheet from "../../components/common/FilterBottomSheet/FilterBottomSheet";
import Layout from "../../components/layout/Layout";
import FacilityCard from "../../components/ui/FacilityCard";
import LostCard from "../../components/ui/LostCard";

import checkIcon from "../../assets/icons/actions/check.svg";
import filterActiveIcon from "../../assets/icons/actions/filter-active.svg";
import filterIcon from "../../assets/icons/actions/filter.svg";
import smallBellIcon from "../../assets/icons/notifications/bell-small.svg";

import { facilityListData, lostListData } from "../../mock";
import {
  countActiveFilters,
  createEmptyFilterSelection,
  FACILITY_FILTER_DEFINITION,
  FilterSelection,
  LOST_FILTER_DEFINITION,
} from "../../constants/filterOptions";
import {
  matchesFacilityFilters,
  matchesLostFilters,
} from "../../utils/listFilters";

import "./SearchResultPage.css";

type SearchTab = "lost" | "facility";

const SearchResultPage = () => {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("q") ?? "";

  const [searchValue, setSearchValue] = useState(keyword);
  const [tab, setTab] = useState<SearchTab>("lost");
  const [isAlertOn, setIsAlertOn] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [lostFilters, setLostFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );
  const [facilityFilters, setFacilityFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );

  const normalizedSearchValue = searchValue.trim().toLowerCase();

  const lostResult = useMemo(() => {
    if (!normalizedSearchValue) return [];

    return lostListData.filter((item) => {
      const matchesKeyword = item.title
        .toLowerCase()
        .includes(normalizedSearchValue);
      return matchesKeyword && matchesLostFilters(item, lostFilters);
    });
  }, [lostFilters, normalizedSearchValue]);

  const facilityResult = useMemo(() => {
    if (!normalizedSearchValue) return [];

    return facilityListData.filter((item) => {
      const matchesKeyword = item.title
        .toLowerCase()
        .includes(normalizedSearchValue);
      return matchesKeyword && matchesFacilityFilters(item, facilityFilters);
    });
  }, [facilityFilters, normalizedSearchValue]);

  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const activeFilters = tab === "lost" ? lostFilters : facilityFilters;
  const filterDefinition =
    tab === "lost"
      ? LOST_FILTER_DEFINITION
      : FACILITY_FILTER_DEFINITION;
  const activeFilterCount = countActiveFilters(activeFilters);

  const handleTabChange = (nextTab: SearchTab) => {
    setTab(nextTab);
    setIsFilterOpen(false);
  };

  const handleApplyFilter = (value: FilterSelection) => {
    if (tab === "lost") {
      setLostFilters(value);
      return;
    }

    setFacilityFilters(value);
  };

  return (
    <Layout
      current="search"
      appBarVariant="search"
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onClearSearch={() => setSearchValue("")}
    >
      <div className="search-result-page">
        <div className="search-result-tab">
          <button
            type="button"
            className={
              tab === "lost"
                ? "search-result-tab-button active body05"
                : "search-result-tab-button body06"
            }
            onClick={() => handleTabChange("lost")}
          >
            분실물 ({lostResult.length})
          </button>

          <button
            type="button"
            className={
              tab === "facility"
                ? "search-result-tab-button active body05"
                : "search-result-tab-button body06"
            }
            onClick={() => handleTabChange("facility")}
          >
            시설 · 기자재 ({facilityResult.length})
          </button>
        </div>

        <div className="search-result-toolbar">
          <button
            type="button"
            className="search-filter-button"
            aria-label={
              activeFilterCount > 0
                ? `필터 열기, ${activeFilterCount}개 적용 중`
                : "필터 열기"
            }
            aria-haspopup="dialog"
            aria-expanded={isFilterOpen}
            onClick={() => setIsFilterOpen(true)}
          >
            <img
              src={activeFilterCount > 0 ? filterActiveIcon : filterIcon}
              alt=""
            />
          </button>

          <button
            type="button"
            className="search-alert-button"
            onClick={() => setIsAlertOn((current) => !current)}
          >
            <img
              src={isAlertOn ? checkIcon : smallBellIcon}
              alt=""
              className="search-alert-icon"
            />

            <span className="body06">
              {isAlertOn ? "알림 받는 중" : `'${searchValue}' 알림받기`}
            </span>
          </button>
        </div>

        <div className="search-result-list" aria-live="polite">
          {tab === "lost" &&
            (lostResult.length > 0 ? (
              lostResult.map((item) => <LostCard key={item.id} item={item} />)
            ) : (
              <div className="search-empty">검색 결과가 없습니다.</div>
            ))}

          {tab === "facility" &&
            (facilityResult.length > 0 ? (
              facilityResult.map((item) => (
                <FacilityCard key={item.id} item={item} />
              ))
            ) : (
              <div className="search-empty">검색 결과가 없습니다.</div>
            ))}
        </div>
      </div>

      <FilterBottomSheet
        isOpen={isFilterOpen}
        definition={filterDefinition}
        value={activeFilters}
        onApply={handleApplyFilter}
        onClose={closeFilter}
      />
    </Layout>
  );
};

export default SearchResultPage;
