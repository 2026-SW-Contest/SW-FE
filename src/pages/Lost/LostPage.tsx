import { useCallback, useMemo, useState } from "react";

import FilterBottomSheet from "../../components/common/FilterBottomSheet/FilterBottomSheet";
import Layout from "../../components/layout/Layout";

import LostCard from "../../components/ui/LostCard";

import filterActiveIcon from "../../assets/icons/actions/filter-active.svg";
import filterIcon from "../../assets/icons/actions/filter.svg";

import {
  countActiveFilters,
  createEmptyFilterSelection,
  FilterSelection,
  LOST_FILTER_DEFINITION,
} from "../../constants/filterOptions";
import { useLostItems } from "../../context/LostItemContext";
import { matchesLostFilters } from "../../utils/listFilters";

import "./LostPage.css";

const LostPage = () => {
  const { lostItems, isLoading } = useLostItems();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );

  const filteredItems = useMemo(
    () => lostItems.filter((item) => matchesLostFilters(item, filters)),
    [filters, lostItems],
  );

  const closeFilter = useCallback(() => setIsFilterOpen(false), []);
  const activeFilterCount = countActiveFilters(filters);

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
            aria-label={
              activeFilterCount > 0
                ? `분실물 필터 열기, ${activeFilterCount}개 적용 중`
                : "분실물 필터 열기"
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
        </div>

        {isLoading ? (
          <div className="lost-empty"><p className="body05">불러오는 중...</p></div>
        ) : filteredItems.length > 0 ? (
          <div className="lost-list">

            {filteredItems.map((item) => (
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

      <FilterBottomSheet
        isOpen={isFilterOpen}
        definition={LOST_FILTER_DEFINITION}
        value={filters}
        onApply={setFilters}
        onClose={closeFilter}
      />
    </Layout>
  );
};

export default LostPage;
