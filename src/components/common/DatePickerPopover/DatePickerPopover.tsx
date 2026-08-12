import { useEffect, useMemo, useRef, useState } from "react";

import calendarIcon from "../../../assets/icons/actions/calendar.svg";

import "./DatePickerPopover.css";

interface DatePickerPopoverProps {
  value: string;
  label: string;
  isOpen: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  align?: "start" | "end";
  onChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateValue = (value: string) => {
  const date = parseDateValue(value);

  if (!date) return "연도. 월. 일.";

  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
};

const getCalendarDays = (visibleMonth: Date) => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
};

const DatePickerPopover = ({
  value,
  label,
  isOpen,
  disabled = false,
  min,
  max,
  align = "start",
  onChange,
  onOpenChange,
}: DatePickerPopoverProps) => {
  const selectedDate = parseDateValue(value);
  const [visibleMonth, setVisibleMonth] = useState(
    () => selectedDate ?? new Date(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setVisibleMonth(selectedDate ?? new Date());

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onOpenChange, value]);

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const todayValue = toDateValue(new Date());

  const isOutsideRange = (dateValue: string) =>
    Boolean((min && dateValue < min) || (max && dateValue > max));

  const moveMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <div ref={containerRef} className="date-picker">
      <button
        type="button"
        className="body06 date-picker-trigger"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className={value ? "" : "date-picker-placeholder"}>
          {formatDateValue(value)}
        </span>
        <img src={calendarIcon} alt="" />
      </button>

      {isOpen && (
        <div
          className={`date-picker-popover ${align === "end" ? "align-end" : ""}`}
          role="dialog"
          aria-label={`${label} 달력`}
        >
          <div className="date-picker-header">
            <strong className="body05">
              {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
            </strong>

            <div className="date-picker-navigation">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => moveMonth(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => moveMonth(1)}
              >
                ›
              </button>
            </div>
          </div>

          <div className="date-picker-weekdays" aria-hidden="true">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="caption02">
                {weekday}
              </span>
            ))}
          </div>

          <div className="date-picker-grid">
            {calendarDays.map((date) => {
              const dateValue = toDateValue(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = dateValue === value;
              const isToday = dateValue === todayValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  className={`caption02 date-picker-day${
                    isCurrentMonth ? "" : " outside-month"
                  }${isSelected ? " selected" : ""}${isToday ? " today" : ""}`}
                  disabled={isOutsideRange(dateValue)}
                  aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(dateValue);
                    onOpenChange(false);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker-footer">
            <button
              type="button"
              className="body06"
              onClick={() => {
                onChange("");
                onOpenChange(false);
              }}
            >
              삭제
            </button>
            <button
              type="button"
              className="body06"
              disabled={isOutsideRange(todayValue)}
              onClick={() => {
                onChange(todayValue);
                onOpenChange(false);
              }}
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePickerPopover;
