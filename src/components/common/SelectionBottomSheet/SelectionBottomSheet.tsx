import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import restoreIcon from "../../../assets/icons/actions/restore.svg";
import { FilterOption } from "../../../constants/filterOptions";

import "./SelectionBottomSheet.css";

interface SelectionBottomSheetProps {
  isOpen: boolean;
  title: string;
  options: FilterOption[];
  value: string[];
  allowMultiple?: boolean;
  onApply: (value: string[]) => void;
  onClose: () => void;
}

const OpenSelectionBottomSheet = ({
  title,
  options,
  value,
  onApply,
  onClose,
  allowMultiple = true,
}: Omit<SelectionBottomSheetProps, "isOpen">) => {
  const [draftValue, setDraftValue] = useState(() => [...value]);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const animationFrame = window.requestAnimationFrame(() => {
      sheetRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const appRoot = document.querySelector(".app");

  if (!appRoot) return null;

  const toggleOption = (optionValue: string) => {
    if (!allowMultiple) {
      setDraftValue((current) =>
        current.includes(optionValue) ? [] : [optionValue],
      );
      return;
    }

    setDraftValue((current) =>
      current.includes(optionValue)
        ? current.filter((value) => value !== optionValue)
        : [...current, optionValue],
    );
  };

  return createPortal(
    <div
      className="selection-sheet-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="selection-sheet-backdrop"
        aria-hidden="true"
        onMouseDown={onClose}
      />

      <div
        ref={sheetRef}
        className="selection-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selection-sheet-title"
        tabIndex={-1}
      >
        <div className="selection-sheet-handle" aria-hidden="true" />

        <h2 id="selection-sheet-title" className="body01 selection-sheet-title">
          {title}
        </h2>

        <div className="selection-sheet-options">
          {options.map((option) => (
            <label key={option.value} className="selection-sheet-option">
              <input
                type="checkbox"
                role={allowMultiple ? undefined : "radio"}
                value={option.value}
                checked={draftValue.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
              <span className="selection-sheet-checkbox" aria-hidden="true" />
              <span className="body06">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="selection-sheet-actions">
          <button
            type="button"
            className="body05 selection-sheet-reset"
            disabled={draftValue.length === 0}
            onClick={() => setDraftValue([])}
          >
            <img src={restoreIcon} alt="" />
            초기화
          </button>
          <button
            type="button"
            className="body05 selection-sheet-apply"
            onClick={() => {
              onApply([...draftValue]);
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

const SelectionBottomSheet = ({
  isOpen,
  ...props
}: SelectionBottomSheetProps) => {
  if (!isOpen) return null;

  return <OpenSelectionBottomSheet {...props} />;
};

export default SelectionBottomSheet;
