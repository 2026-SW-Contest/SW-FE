import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import logoSymbol from "../../assets/icons/brand/logo-symbol.svg";
import AlertModal from "../../components/common/AlertModal/AlertModal";
import Layout from "../../components/layout/Layout";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

import "./NotificationPage.css";

const NotificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    isLoading,
    error,
  } = useNotifications();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  return (
    <Layout
      appBarVariant="detail"
      showBottomNavigation={false}
      scrollable={false}
    >
      <div className="notification-page">
        <div className="notification-heading">
          <h1 className="notification-title">알림</h1>
          {isAuthenticated && unreadCount > 0 ? (
            <button
              type="button"
              className="notification-read-all"
              onClick={() => void markAllAsRead().catch(() => undefined)}
            >
              모두 읽음
            </button>
          ) : null}
        </div>

        {isAuthenticated && isLoading ? (
          <div className="notification-empty">
            <p className="body05">알림을 불러오는 중입니다.</p>
          </div>
        ) : isAuthenticated && notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-list-item${
                  notification.read ? " read" : " unread"
                }`}
              >
                <button
                  type="button"
                  className="notification-item"
                  onClick={async () => {
                    try {
                      await markAsRead(notification.id);
                      if (notification.targetPath) {
                        navigate(notification.targetPath);
                      }
                    } catch {
                      // API 실패 시 읽음 상태와 화면 이동을 유지하지 않는다.
                    }
                  }}
                >
                  <img
                    src={logoSymbol}
                    alt=""
                    className="notification-item-icon"
                  />

                  <span className="notification-item-content">
                    <strong className="body06 notification-item-title">
                      {notification.title}
                    </strong>
                    <span className="body06 notification-item-description">
                      {notification.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : isAuthenticated ? (
          <div className="notification-empty">
            <p className="body05">
              {error || "도착한 알림이 없습니다."}
            </p>
          </div>
        ) : null}
      </div>

      <AlertModal
        open={showLoginModal}
        message={"로그인이 필요한 서비스입니다.\n로그인 하시겠습니까?"}
        onCancel={() => {
          setShowLoginModal(false);
          navigate(-1);
        }}
        onConfirm={() =>
          navigate("/login", {
            replace: true,
            state: {
              from: `${location.pathname}${location.search}${location.hash}`,
            },
          })
        }
      />
    </Layout>
  );
};

export default NotificationPage;
