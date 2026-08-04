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

  searchValue?: string;
  notificationCount?: number;

  showAppBar?: boolean;
  showBottomNavigation?: boolean;
  scrollable?: boolean;

  onBack?: () => void;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch?: () => void;
  onNotificationClick?: () => void;
}

const Layout = ({
  children,

  current = "home",

  appBarVariant = "main",
  appBarTitle = "",

  searchValue = "",
  notificationCount = 0,

  showAppBar = true,
  showBottomNavigation = true,

  onBack,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onNotificationClick,
}: LayoutProps) => {

  const navigate = useNavigate();

  return (
    <div className="app">

      {showAppBar && (
        <AppBar
          variant={appBarVariant}
          title={appBarTitle}
          searchValue={searchValue}
          notificationCount={notificationCount}
          onBack={
            onBack ??
            (() => navigate(-1))
          }
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          onClearSearch={onClearSearch}
          onNotificationClick={onNotificationClick}
        />
      )}

      <main
        className={`content ${
          showBottomNavigation
            ? "content-with-bottom-nav"
            : ""
        }`}
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
