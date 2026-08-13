import { AdminStatus } from "../types";

export const toAdminLostStatus = (status: string): AdminStatus =>
  status === "resolved"
    ? "resolved"
    : status === "inProgress"
      ? "inProgress"
      : "waiting";

export const toStoredItemStatus = (status: AdminStatus) =>
  status === "resolved"
    ? ("COMPLETED" as const)
    : status === "inProgress"
      ? ("IN_PROGRESS" as const)
      : ("STORED" as const);
