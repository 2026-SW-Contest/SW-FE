import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import FilterBottomSheet from "../../components/common/FilterBottomSheet/FilterBottomSheet";
import Layout from "../../components/layout/Layout";
import FacilityCard from "../../components/ui/FacilityCard";
import LostCard from "../../components/ui/LostCard";

import checkIcon from "../../assets/icons/actions/check.svg";
import closeIcon from "../../assets/icons/actions/close.svg";
import filterActiveIcon from "../../assets/icons/actions/filter-active.svg";
import filterIcon from "../../assets/icons/actions/filter.svg";
import smallBellIcon from "../../assets/icons/notifications/bell-small.svg";

import { facilityListData, lostListData } from "../../mock";
import { searchFacilityRequests, searchLostItems } from "../../api/search";
import { FacilityItem } from "../../types/facility";
import { LostItem } from "../../types/lost";
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
type MultiFilterKey = "category" | "status" | "place";

interface ActiveFilterChip {
  key: string;
  type: MultiFilterKey | "period";
  value: string;
  label: string;
}

const SearchResultPage = () => {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("q") ?? "";

  const [searchValue, setSearchValue] = useState(keyword);
  const [tab, setTab] = useState<SearchTab>("lost");
  const [isAlertOn, setIsAlertOn] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [facilityItems, setFacilityItems] = useState<FacilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lostFilters, setLostFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );
  const [facilityFilters, setFacilityFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );

  const normalizedSearchValue = searchValue.trim().toLowerCase();

  useEffect(() => {
    if (!normalizedSearchValue) {
      setLostItems([]);
      setFacilityItems([]);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void Promise.all([
        searchLostItems(searchValue.trim()),
        searchFacilityRequests(searchValue.trim()),
      ])
        .then(([nextLostItems, nextFacilityItems]) => {
          if (!active) return;
          setLostItems(nextLostItems);
          setFacilityItems(nextFacilityItems);
        })
        .catch(() => {
          if (!active) return;
          // 서버 장애 시 검색 화면 자체가 막히지 않도록 기존 목업만 폴백한다.
          setLostItems(
            lostListData.filter((item) =>
              item.title.toLowerCase().includes(normalizedSearchValue),
            ),
          );
          setFacilityItems(
            facilityListData.filter((item) =>
              item.title.toLowerCase().includes(normalizedSearchValue),
            ),
          );
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [normalizedSearchValue, searchValue]);

  const lostResult = useMemo(() => {
    if (!normalizedSearchValue) return [];

    return lostItems.filter((item) => matchesLostFilters(item, lostFilters));
  }, [lostFilters, lostItems, normalizedSearchValue]);

  const facilityResult = useMemo(() => {
    if (!normalizedSearchValue) return [];

    return facilityItems.filter((item) =>
      matchesFacilityFilters(item, facilityFilters),
    );
  }, [facilityFilters, facilityItems, normalizedSearchValue]);

  const closeFilter = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  const activeFilters = tab === "lost" ? lostFilters : facilityFilters;
  const filterDefinition =
    tab === "lost"
      ? LOST_FILTER_DEFINITION
      : FACILITY_FILTER_DEFINITION;
  const activeFilterCount = countActiveFilters(activeFilters);

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    (["category", "status", "place"] as MultiFilterKey[]).forEach((type) => {
      activeFilters[type].forEach((value) => {
        const option = filterDefinition[type].find(
          (candidate) => candidate.value === value,
        );
        const label = option?.label ?? value;

        chips.push({
          key: `${type}-${value}`,
          type,
          value,
          label: type === "place" ? label.replace(/^S\d+\s+/, "") : label,
        });
      });
    });

    if (activeFilters.period) {
      const periodOption = filterDefinition.period.find(
        (candidate) => candidate.value === activeFilters.period,
      );
      const isCustomPeriod = activeFilters.period === "custom";
      const customPeriodLabel =
        activeFilters.startDate && activeFilters.endDate
          ? `${activeFilters.startDate} ~ ${activeFilters.endDate}`
          : "직접선택";

      chips.push({
        key: `period-${activeFilters.period}`,
        type: "period",
        value: activeFilters.period,
        label: isCustomPeriod
          ? customPeriodLabel
          : `최근 ${periodOption?.label ?? activeFilters.period}`,
      });
    }

    return chips;
  }, [activeFilters, filterDefinition]);

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

  const handleRemoveFilterChip = (chip: ActiveFilterChip) => {
    if (chip.type === "period") {
      handleApplyFilter({
        ...activeFilters,
        period: "",
        startDate: "",
        endDate: "",
      });
      return;
    }

    handleApplyFilter({
      ...activeFilters,
      [chip.type]: activeFilters[chip.type].filter(
        (value) => value !== chip.value,
      ),
    });
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

        {activeFilterChips.length > 0 && (
          <div className="search-active-filters" aria-label="적용된 필터">
            <button
              type="button"
              className="search-active-filter-reset"
              aria-label="적용된 필터 전체 해제"
              onClick={() =>
                handleApplyFilter(createEmptyFilterSelection())
              }
            >
              <img src={closeIcon} alt="" />
            </button>

            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="search-active-filter-chip body06"
                aria-label={`${chip.label} 필터 해제`}
                onClick={() => handleRemoveFilterChip(chip)}
              >
                <span>{chip.label}</span>
                <img src={closeIcon} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="search-result-list" aria-live="polite">
          {isLoading && <div className="search-empty">검색 중...</div>}

          {!isLoading && (
            <>
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
            </>
          )}
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
