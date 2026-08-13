import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import "./Layout.css";

import AppBar from "./AppBar";
import BottomNavigation from "./BottomNavigation";

type NavigationKey =
  | "home"
  | "search"
  | "lost"
  | "repair"
  | "mypage";

type AppBarVariant =
  | "main"
  | "search"
  | "detail";

interface LayoutProps {
  children: ReactNode;

  current?: NavigationKey;

  appBarVariant?: AppBarVariant;
  appBarTitle?: string;

  rightIcon?: "none" | "close";

  searchValue?: string;
  notificationCount?: number;

  showAppBar?: boolean;
  showBottomNavigation?: boolean;
  scrollable?: boolean;

  onBack?: () => void;
  onClose?: () => void;

  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch?: () => void;
  onSearchFocus?: () => void;
  searchAutoFocus?: boolean;
  onNotificationClick?: () => void;
}

const Layout = ({
  children,

  current = "home",

  appBarVariant = "main",
  appBarTitle = "",

  rightIcon = "none",

  searchValue = "",
  notificationCount,

  showAppBar = true,
  showBottomNavigation = true,
  scrollable = true,

  onBack,
  onClose,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onSearchFocus,
  searchAutoFocus,
  onNotificationClick,
}: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="app">
      {showAppBar && (
        <AppBar
          variant={appBarVariant}
          title={appBarTitle}
          rightIcon={rightIcon}
          searchValue={searchValue}
          notificationCount={notificationCount}
          onBack={onBack ?? (() => navigate(-1))}
          onClose={onClose ?? (() => navigate("/"))}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onClearSearch={onClearSearch}
          onSearchFocus={onSearchFocus}
          searchAutoFocus={searchAutoFocus}
          onNotificationClick={onNotificationClick}
        />
      )}

      <main
        className={`
          content
          ${scrollable ? "content-scrollable" : "content-fixed"}
          ${showBottomNavigation ? "" : "content-no-bottom-nav"}
        `}
      >
        {children}
      </main>

      {showBottomNavigation && (
        <BottomNavigation current={current} />
      )}
    </div>
  );
};

export default Layout;
