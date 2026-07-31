import { ReactNode } from "react";
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

  onBack?: () => void;
  onSearchChange?: (value: string) => void;
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
  onClearSearch,
  onNotificationClick,
}: LayoutProps) => {
  return (
    <div className="app">
      {showAppBar && (
        <AppBar
          variant={appBarVariant}
          title={appBarTitle}
          searchValue={searchValue}
          notificationCount={notificationCount}
          onBack={onBack}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
          onNotificationClick={onNotificationClick}
        />
      )}

      <main
        className={`content ${
          showBottomNavigation ? "content-with-bottom-nav" : ""
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