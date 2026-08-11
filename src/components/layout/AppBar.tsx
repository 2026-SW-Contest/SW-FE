import "./AppBar.css";

import backIcon from "../../assets/icons/actions/arrow-left.svg";
import closeIcon from "../../assets/icons/actions/close.svg";
import clearInputIcon from "../../assets/icons/actions/clear-input.svg";
import searchIcon from "../../assets/icons/actions/search.svg";
import logoIcon from "../../assets/icons/brand/logo-horizontal.svg";
import bellActiveIcon from "../../assets/icons/notifications/bell-active.svg";
import bellDefaultIcon from "../../assets/icons/notifications/bell.svg";

import { useNavigate } from "react-router-dom";

type AppBarVariant = "main" | "search" | "detail";

interface AppBarProps {
  variant?: AppBarVariant;

  title?: string;

  searchValue?: string;
  notificationCount?: number;

  rightIcon?: "none" | "close";

  onBack?: () => void;
  onClose?: () => void;

  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch?: () => void;
  onNotificationClick?: () => void;
}

const AppBar = ({
  variant = "main",
  title = "",
  searchValue = "",
  notificationCount = 0,
  rightIcon = "none",

  onBack,
  onClose,

  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onNotificationClick,
}: AppBarProps) => {
  const navigate = useNavigate();

  const hasNotification = notificationCount > 0;

  /* ---------- Search ---------- */

  if (variant === "search") {
    return (
      <header className="app-bar app-bar-search">
        <button
          type="button"
          className="app-bar-icon-button"
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>

        <div className="app-bar-search-box">
          <img
            src={searchIcon}
            alt=""
            className="app-bar-search-icon"
          />

          <input
            type="text"
            value={searchValue}
            placeholder="검색어 입력"
            onChange={(event) =>
              onSearchChange?.(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearchSubmit?.();
              }
            }}
          />

          {searchValue && (
            <button
              type="button"
              className="app-bar-clear-button"
              onClick={onClearSearch}
              aria-label="검색어 지우기"
            >
              <img src={clearInputIcon} alt="" />
            </button>
          )}
        </div>
      </header>
    );
  }

  /* ---------- Detail ---------- */

  if (variant === "detail") {
    return (
      <header className="app-bar app-bar-detail">
        {rightIcon === "close" ? (
          <div className="app-bar-detail-placeholder" />
        ) : (
          <button
            type="button"
            className="app-bar-icon-button"
            onClick={onBack}
            aria-label="뒤로가기"
          >
            <img src={backIcon} alt="" />
          </button>
        )}

        <h1 className="body04 app-bar-detail-title">
          {title}
        </h1>

        {rightIcon === "close" ? (
          <button
            type="button"
            className="app-bar-icon-button"
            onClick={onClose ?? (() => navigate("/"))}
            aria-label="닫기"
          >
            <img src={closeIcon} alt="닫기" />
          </button>
        ) : (
          <div className="app-bar-detail-placeholder" />
        )}
      </header>
    );
  }

  /* ---------- Main ---------- */

  return (
    <header className="app-bar app-bar-main">
      <div
        className="app-bar-logo"
        onClick={() => navigate("/")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            navigate("/");
          }
        }}
      >
        <img src={logoIcon} alt="Connecthing" />
      </div>

      <button
        type="button"
        className="app-bar-notification-button"
        onClick={onNotificationClick}
        aria-label="알림"
      >
        <img
          src={
            hasNotification
              ? bellActiveIcon
              : bellDefaultIcon
          }
          alt=""
          className="app-bar-notification-icon"
        />
      </button>
    </header>
  );
};

export default AppBar;
