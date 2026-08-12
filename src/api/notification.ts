import { apiGet, apiRequest, toQueryString } from "./client";

export type NotificationType =
  | "FACILITY_REQUEST_UPDATED"
  | "ITEM_CLAIM_DECIDED";
export type NotificationReferenceType =
  | "FACILITY_REQUEST"
  | "STORED_ITEM";

export interface NotificationResponse {
  notificationId: number;
  notificationType: NotificationType;
  title: string;
  content: string;
  referenceType: NotificationReferenceType | null;
  referenceId: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationCursorSlice {
  content: NotificationResponse[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const getNotifications = (
  query: { cursor?: string; size?: number } = {},
) =>
  apiGet<NotificationCursorSlice>(
    `/api/notifications${toQueryString(query)}`,
  );

export const markNotificationAsRead = (notificationId: number) =>
  apiRequest<void>(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsAsRead = () =>
  apiRequest<void>("/api/notifications/read-all", { method: "PATCH" });

export const getUnreadNotificationCount = () =>
  apiGet<{ unreadCount: number }>("/api/notifications/unread-count");

export const getNotificationTargetPath = (
  notification: Pick<
    NotificationResponse,
    "referenceType" | "referenceId"
  >,
) => {
  if (!notification.referenceId) return null;
  if (notification.referenceType === "STORED_ITEM") {
    return `/lost/${notification.referenceId}`;
  }
  if (notification.referenceType === "FACILITY_REQUEST") {
    return `/facility/${notification.referenceId}`;
  }
  return null;
};
