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
import { useRecoveryRequests } from "../../context/RecoveryRequestContext";
import { matchesLostFilters } from "../../utils/listFilters";

import "./HistoryPage.css";

const RecoveryHistoryPage = () => {
  const { recoveryItems, isLoading, error } = useRecoveryRequests();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );

  const filteredHistory = useMemo(
    () =>
      recoveryItems.filter((item) => matchesLostFilters(item, filters)),
    [filters, recoveryItems],
  );

  const closeFilter = useCallback(() => setIsFilterOpen(false), []);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <Layout current="mypage">
      <div className="mypage-history-page">
        <div className="mypage-history-title-row">
          <h1 className="body01">분실물 회수 내역</h1>
        </div>

        <div className="mypage-history-filter">
          <button
            type="button"
            className="mypage-history-filter-button"
            aria-label={
              activeFilterCount > 0
                ? `분실물 회수 내역 필터 열기, ${activeFilterCount}개 적용 중`
                : "분실물 회수 내역 필터 열기"
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
          <div className="mypage-history-empty">
            <p className="body05">분실물 회수 내역을 불러오는 중입니다.</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="mypage-history-card-list">
            {filteredHistory.map((item) => (
              <LostCard key={item.itemClaimId ?? item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mypage-history-empty">
            <p className="body05">
              {error || "분실물 회수 내역이 없습니다."}
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

export default RecoveryHistoryPage;
