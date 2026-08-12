import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import DatePickerPopover from "../DatePickerPopover/DatePickerPopover";

import restoreIcon from "../../../assets/icons/actions/restore.svg";
import {
  countActiveFilters,
  createEmptyFilterSelection,
  FilterDefinition,
  FilterSelection,
  FilterTabKey,
} from "../../../constants/filterOptions";

import "./FilterBottomSheet.css";

interface FilterBottomSheetProps {
  isOpen: boolean;
  definition: FilterDefinition;
  value: FilterSelection;
  onApply: (value: FilterSelection) => void;
  onClose: () => void;
}

const FILTER_TABS: Array<{ key: FilterTabKey; label: string }> = [
  { key: "category", label: "카테고리" },
  { key: "status", label: "상태" },
  { key: "place", label: "장소" },
  { key: "period", label: "기간" },
];

const cloneSelection = (value: FilterSelection): FilterSelection => ({
  ...value,
  category: [...value.category],
  status: [...value.status],
  place: [...value.place],
});

const OpenFilterBottomSheet = ({
  definition,
  value,
  onApply,
  onClose,
}: Omit<FilterBottomSheetProps, "isOpen">) => {
  const [activeTab, setActiveTab] = useState<FilterTabKey>("category");
  const [openDatePicker, setOpenDatePicker] = useState<
    "start" | "end" | null
  >(null);
  const [draftValue, setDraftValue] = useState(() => cloneSelection(value));
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const animationFrame = window.requestAnimationFrame(() => {
      sheetRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (openDatePicker) {
        setOpenDatePicker(null);
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus({ preventScroll: true });
    };
  }, [onClose, openDatePicker]);

  const appRoot = document.querySelector(".app");

  if (!appRoot) return null;

  const activeOptions = definition[activeTab];
  const selectedValues =
    activeTab === "period" ? [] : draftValue[activeTab];
  const isAllSelected =
    activeTab === "period"
      ? draftValue.period.length === 0
      : selectedValues.length === 0;
  const isCustomPeriod = draftValue.period === "custom";

  const selectAll = () => {
    if (activeTab === "period") {
      setOpenDatePicker(null);
      setDraftValue((current) => ({
        ...current,
        period: "",
        startDate: "",
        endDate: "",
      }));
      return;
    }

    setDraftValue((current) => ({
      ...current,
      [activeTab]: [],
    }));
  };

  const toggleOption = (option: string) => {
    if (activeTab === "period") {
      if (option !== "custom") setOpenDatePicker(null);

      setDraftValue((current) => {
        const nextPeriod = current.period === option ? "" : option;

        return {
          ...current,
          period: nextPeriod,
          startDate: nextPeriod === "custom" ? current.startDate : "",
          endDate: nextPeriod === "custom" ? current.endDate : "",
        };
      });
      return;
    }

    setDraftValue((current) => {
      const currentValues = current[activeTab];

      return {
        ...current,
        [activeTab]: currentValues.includes(option)
          ? currentValues.filter((value) => value !== option)
          : [...currentValues, option],
      };
    });
  };

  return createPortal(
    <div
      className="filter-sheet-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="filter-sheet-backdrop"
        aria-hidden="true"
        onMouseDown={onClose}
      />

      <div
        ref={sheetRef}
        className="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        tabIndex={-1}
      >
        <div className="filter-sheet-handle" aria-hidden="true" />

        <h2 id="filter-sheet-title" className="body01 filter-sheet-title">
          필터
        </h2>

        <div
          className="filter-sheet-tabs"
          role="tablist"
          aria-label="필터 항목"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              className={
                activeTab === tab.key
                  ? "body05 filter-sheet-tab active"
                  : "body06 filter-sheet-tab"
              }
              aria-selected={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setOpenDatePicker(null);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={`filter-sheet-options${
            activeTab === "period" ? " period-options" : ""
          }`}
        >
          <label className="filter-sheet-option">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={selectAll}
            />
            <span className="filter-sheet-checkbox" aria-hidden="true" />
            <span className="body06">전체</span>
          </label>

          {activeOptions.map((option) => {
            const isChecked =
              activeTab === "period"
                ? draftValue.period === option.value
                : selectedValues.includes(option.value);

            return (
              <label key={option.value} className="filter-sheet-option">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(option.value)}
                />
                <span className="filter-sheet-checkbox" aria-hidden="true" />
                <span className="body06">{option.label}</span>
              </label>
            );
          })}

          {activeTab === "period" && (
            <div className="filter-sheet-date-range">
              <DatePickerPopover
                label="필터 시작일"
                value={draftValue.startDate}
                max={draftValue.endDate || undefined}
                disabled={!isCustomPeriod}
                isOpen={openDatePicker === "start"}
                onOpenChange={(isOpen) =>
                  setOpenDatePicker(isOpen ? "start" : null)
                }
                onChange={(startDate) =>
                  setDraftValue((current) => ({
                    ...current,
                    period: "custom",
                    startDate,
                  }))
                }
              />
              <span aria-hidden="true">-</span>
              <DatePickerPopover
                label="필터 종료일"
                value={draftValue.endDate}
                min={draftValue.startDate || undefined}
                disabled={!isCustomPeriod}
                align="end"
                isOpen={openDatePicker === "end"}
                onOpenChange={(isOpen) =>
                  setOpenDatePicker(isOpen ? "end" : null)
                }
                onChange={(endDate) =>
                  setDraftValue((current) => ({
                    ...current,
                    period: "custom",
                    endDate,
                  }))
                }
              />
            </div>
          )}
        </div>

        <div className="filter-sheet-actions">
          <button
            type="button"
            className="body05 filter-sheet-reset"
            disabled={countActiveFilters(draftValue) === 0}
            onClick={() => setDraftValue(createEmptyFilterSelection())}
          >
            <img src={restoreIcon} alt="" />
            초기화
          </button>

          <button
            type="button"
            className="body05 filter-sheet-apply"
            onClick={() => {
              onApply(cloneSelection(draftValue));
              onClose();
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    appRoot,
  );
};

const FilterBottomSheet = ({
  isOpen,
  ...props
}: FilterBottomSheetProps) => {
  if (!isOpen) return null;

  return <OpenFilterBottomSheet {...props} />;
};

export default FilterBottomSheet;
