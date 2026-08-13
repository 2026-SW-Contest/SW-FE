import { useNavigate } from "react-router-dom";

import logoIcon from "../../assets/icons/brand/logo-horizontal.svg";
import { useAuth } from "../../context/AuthContext";
import NotificationBellButton from "../common/NotificationBellButton/NotificationBellButton";

import "./DesktopNavigation.css";

type NavigationKey = "home" | "search" | "lost" | "repair" | "mypage";

interface DesktopNavigationProps {
  current: NavigationKey;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const DesktopNavigation = ({
  current,
  notificationCount,
  onNotificationClick,
}: DesktopNavigationProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const navigationItems: Array<{
    key: NavigationKey;
    label: string;
    path: string;
  }> = [
    { key: "home", label: "홈", path: "/" },
    { key: "search", label: "검색", path: "/search" },
    { key: "lost", label: "분실물", path: "/lost" },
    { key: "repair", label: "수리·개선", path: "/facility" },
    {
      key: "mypage",
      label: "마이",
      path: isAuthenticated ? "/mypage" : "/login",
    },
  ];

  return (
    <header className="desktop-navigation">
      <button
        type="button"
        className="desktop-navigation-logo"
        onClick={() => navigate("/")}
        aria-label="Connecthing 홈"
      >
        <img src={logoIcon} alt="Connecthing" />
      </button>

      <nav className="desktop-navigation-menu" aria-label="주요 메뉴">
        {navigationItems.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`desktop-navigation-item ${
              current === item.key ? "active" : ""
            }`}
            aria-current={current === item.key ? "page" : undefined}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <NotificationBellButton
        className="desktop-navigation-notification"
        iconClassName="desktop-navigation-notification-icon"
        notificationCount={notificationCount}
        onClick={onNotificationClick}
      />
    </header>
  );
};

export default DesktopNavigation;
