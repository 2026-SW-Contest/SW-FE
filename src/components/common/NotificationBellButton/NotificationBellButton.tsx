import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bellActiveIcon from "../../../assets/icons/notifications/bell-active.svg";
import bellDefaultIcon from "../../../assets/icons/notifications/bell.svg";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import AlertModal from "../AlertModal/AlertModal";

interface NotificationBellButtonProps {
  className: string;
  iconClassName?: string;
  notificationCount?: number;
  onClick?: () => void;
}

const NotificationBellButton = ({
  className,
  iconClassName,
  notificationCount,
  onClick,
}: NotificationBellButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const count = isAuthenticated ? (notificationCount ?? unreadCount) : 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    navigate("/notifications");
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleClick}
        aria-label={count > 0 ? `알림, 읽지 않은 알림 ${count}개` : "알림"}
      >
        <img
          src={count > 0 ? bellActiveIcon : bellDefaultIcon}
          alt=""
          className={iconClassName}
        />
      </button>

      <AlertModal
        open={showLoginModal}
        message={"로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?"}
        cancelLabel="취소"
        confirmLabel="확인"
        onCancel={() => setShowLoginModal(false)}
        onConfirm={() =>
          navigate("/login", {
            state: {
              from: `${location.pathname}${location.search}${location.hash}`,
            },
          })
        }
      />
    </>
  );
};

export default NotificationBellButton;
