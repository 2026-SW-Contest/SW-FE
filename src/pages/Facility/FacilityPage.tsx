import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FilterBottomSheet from "../../components/common/FilterBottomSheet/FilterBottomSheet";
import Toast from "../../components/common/Toast/Toast";
import Layout from "../../components/layout/Layout";

import FacilityCard from "../../components/ui/FacilityCard";

import filterActiveIcon from "../../assets/icons/actions/filter-active.svg";
import filterIcon from "../../assets/icons/actions/filter.svg";
import createInquiryFab from "../../assets/icons/actions/create-inquiry-fab.svg";

import {
  countActiveFilters,
  createEmptyFilterSelection,
  FACILITY_FILTER_DEFINITION,
  FilterSelection,
} from "../../constants/filterOptions";
import { useFacilityInquiries } from "../../context/FacilityInquiryContext";
import { matchesFacilityFilters } from "../../utils/listFilters";

import "./FacilityPage.css";

const FacilityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { facilityItems } = useFacilityInquiries();
  const routeToastMessage = (
    location.state as { toastMessage?: string } | null
  )?.toastMessage;
  const [toastMessage] = useState(routeToastMessage ?? "");
  const [showToast, setShowToast] = useState(Boolean(routeToastMessage));

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterSelection>(
    createEmptyFilterSelection,
  );

  const filteredItems = useMemo(
    () =>
      facilityItems.filter((item) =>
        matchesFacilityFilters(item, filters),
      ),
    [facilityItems, filters],
  );

  const closeFilter = useCallback(() => setIsFilterOpen(false), []);
  const activeFilterCount = countActiveFilters(filters);

  useEffect(() => {
    if (!routeToastMessage) return;

    // 새로고침이나 뒤로가기로 성공 토스트가 반복되지 않도록
    // 화면에 전달된 일회성 상태를 즉시 소비한다.
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, navigate, routeToastMessage]);

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
            aria-label={
              activeFilterCount > 0
                ? `시설 필터 열기, ${activeFilterCount}개 적용 중`
                : "시설 필터 열기"
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

        {filteredItems.length > 0 ? (
          <div className="facility-list">

            {filteredItems.map((item) => (
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
            src={createInquiryFab}
            alt="문의하기"
          />
        </button>

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

export default FacilityPage;
