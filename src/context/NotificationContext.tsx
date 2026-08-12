import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getNotifications,
  getNotificationTargetPath,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationResponse,
} from "../api/notification";
import { useAuth } from "./AuthContext";

export interface NotificationItem {
  id: number;
  type: NotificationResponse["notificationType"];
  title: string;
  description: string;
  targetPath: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const mapNotification = (
  notification: NotificationResponse,
): NotificationItem => ({
  id: notification.notificationId,
  type: notification.notificationType,
  title: notification.title,
  description: notification.content,
  targetPath: getNotificationTargetPath(notification),
  read: notification.read,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const items: NotificationResponse[] = [];
      let cursor: string | undefined;

      do {
        const response = await getNotifications({ cursor, size: 50 });
        items.push(...response.content);
        const nextCursor = response.nextCursor ?? undefined;
        if (!response.hasNext || !nextCursor || nextCursor === cursor) break;
        cursor = nextCursor;
      } while (true);

      const countResponse = await getUnreadNotificationCount();
      setNotifications(items.map(mapNotification));
      setUnreadCount(countResponse.unreadCount);
    } catch (requestError) {
      setNotifications([]);
      setUnreadCount(0);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "알림을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    void refreshNotifications();
  }, [isAuthenticated, refreshNotifications, user?.userId]);

  const markAsRead = useCallback(async (notificationId: number) => {
    const target = notifications.find((item) => item.id === notificationId);
    if (!target || target.read) return;

    await markNotificationAsRead(notificationId);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
    setUnreadCount(0);
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
    }),
    [
      error,
      isLoading,
      markAllAsRead,
      markAsRead,
      notifications,
      refreshNotifications,
      unreadCount,
    ],
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
