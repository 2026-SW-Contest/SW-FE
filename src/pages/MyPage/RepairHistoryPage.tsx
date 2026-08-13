import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FilterBottomSheet from "../../components/common/FilterBottomSheet/FilterBottomSheet";
import Toast from "../../components/common/Toast/Toast";
import Layout from "../../components/layout/Layout";
import FacilityCard from "../../components/ui/FacilityCard";
import filterActiveIcon from "../../assets/icons/actions/filter-active.svg";
import filterIcon from "../../assets/icons/actions/filter.svg";
import {
  countActiveFilters,
  createEmptyFilterSelection,
  FACILITY_FILTER_DEFINITION,
  FilterSelection,
} from "../../constants/filterOptions";
import { useFacilityInquiries } from "../../context/FacilityInquiryContext";
import { matchesFacilityFilters } from "../../utils/listFilters";

import "./HistoryPage.css";

const RepairHistoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submittedItems } = useFacilityInquiries();
  const routeToastMessage = (
    location.state as { toastMessage?: string } | null
  )?.toastMessage;
  const [toastMessage] = useState(routeToastMessage ?? "");
  const [showToast, setShowToast] = useState(Boolean(routeToastMessage));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );

  const filteredHistory = useMemo(
    () =>
      submittedItems.filter((item) => matchesFacilityFilters(item, filters)),
    [submittedItems, filters],
  );

  const closeFilter = useCallback(() => setIsFilterOpen(false), []);
  const activeFilterCount = countActiveFilters(filters);

  useEffect(() => {
    if (!routeToastMessage) return;

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, navigate, routeToastMessage]);

  return (
    <Layout current="mypage">
      <div className="mypage-history-page">
        <div className="mypage-history-title-row">
          <h1 className="body01">수리·개선 문의 내역</h1>
        </div>

        <div className="mypage-history-filter">
          <button
            type="button"
            className="mypage-history-filter-button"
            aria-label={
              activeFilterCount > 0
                ? `수리·개선 문의 내역 필터 열기, ${activeFilterCount}개 적용 중`
                : "수리·개선 문의 내역 필터 열기"
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

        {filteredHistory.length > 0 ? (
          <div className="mypage-history-card-list">
            {filteredHistory.map((item) => (
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

      <FilterBottomSheet
        isOpen={isFilterOpen}
        definition={FACILITY_FILTER_DEFINITION}
        value={filters}
        onApply={setFilters}
        onClose={closeFilter}
      />

      <Toast
        visible={showToast}
        message={toastMessage}
        placement="above-navigation"
        onClose={() => setShowToast(false)}
      />
    </Layout>
  );
};

export default RepairHistoryPage;
