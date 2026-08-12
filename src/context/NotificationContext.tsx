import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { notificationData, NotificationItem } from "../mock/notification";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (notificationId: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const READ_NOTIFICATION_IDS_KEY = "readNotificationIds";

const getInitialNotifications = () => {
  let readIds = new Set<number>();

  try {
    readIds = new Set<number>(
      JSON.parse(localStorage.getItem(READ_NOTIFICATION_IDS_KEY) ?? "[]"),
    );
  } catch {
    localStorage.removeItem(READ_NOTIFICATION_IDS_KEY);
  }

  return notificationData.map((notification) => ({
    ...notification,
    read: notification.read || readIds.has(notification.id),
  }));
};

const saveReadNotificationIds = (notifications: NotificationItem[]) => {
  localStorage.setItem(
    READ_NOTIFICATION_IDS_KEY,
    JSON.stringify(
      notifications
        .filter((notification) => notification.read)
        .map((notification) => notification.id),
    ),
  );
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState(getInitialNotifications);

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications((current) => {
      const nextNotifications = current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      );

      saveReadNotificationIds(nextNotifications);
      return nextNotifications;
    });
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read)
        .length,
      markAsRead,
    }),
    [markAsRead, notifications],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
};
