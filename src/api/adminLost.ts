import { apiGet, apiRequest, toQueryString } from "./client";

export type StoredItemStatus = "STORED" | "IN_PROGRESS" | "COMPLETED";
export type ItemClaimStatus = "WAITING" | "APPROVED" | "REJECTED";

export interface StoredItemMutationRequest {
  officeId?: number;
  categoryId?: number;
  foundLocationId?: number;
  foundLocationText?: string;
  itemName?: string;
  description?: string;
  privateDescription?: string | null;
  foundDate?: string;
  keepFileIds?: number[];
}

export interface StoredItemMutationResponse {
  storedItemId: number;
  publicStatus: StoredItemStatus;
  attachmentCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemClaimSummary {
  itemClaimId: number;
  storedItemId: number;
  itemName: string;
  claimantName: string;
  studentNumber: string | null;
  requestMethod: string;
  claimStatus: ItemClaimStatus;
  claimStatusName: string;
  thumbnailUrl: string | null;
  attachmentCount: number;
  createdAt: string;
}

export interface ItemClaimDetail {
  itemClaimId: number;
  storedItemId: number;
  claimantName: string;
  studentNumber: string;
  requestMethod: string;
  ownershipDescription: string;
  claimStatus: ItemClaimStatus;
  claimStatusName: string;
  attachments: Array<{
    fileId: number;
    originalFilename: string;
    fileUrl: string;
  }>;
  statusHistories: Array<{
    claimStatusHistoryId: number;
    previousStatus: ItemClaimStatus | null;
    previousStatusName: string | null;
    newStatus: ItemClaimStatus;
    newStatusName: string;
    changedByName: string;
    changeReason: string | null;
    changedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OffsetPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

const toMultipartBody = (request: StoredItemMutationRequest | undefined, files: File[]) => {
  const formData = new FormData();
  if (request) {
    formData.append(
      "request",
      new Blob([JSON.stringify(request)], { type: "application/json" }),
    );
  }
  files.forEach((file) => formData.append("files", file));
  return formData;
};

export const createStoredItem = (
  request: Required<
    Pick<
      StoredItemMutationRequest,
      "officeId" | "categoryId" | "itemName" | "description" | "foundDate"
    >
  > &
    Pick<
      StoredItemMutationRequest,
      "foundLocationId" | "foundLocationText" | "privateDescription"
    >,
  files: File[],
) =>
  apiRequest<StoredItemMutationResponse>("/api/lost-item", {
    method: "POST",
    body: toMultipartBody(request, files),
  });

export const updateStoredItem = (
  storedItemId: number,
  request?: StoredItemMutationRequest,
  files: File[] = [],
) =>
  apiRequest<StoredItemMutationResponse>(`/api/stored-items/${storedItemId}`, {
    method: "PATCH",
    body: toMultipartBody(request, files),
  });

export const updateStoredItemStatus = (
  storedItemId: number,
  status: StoredItemStatus,
  changeReason?: string,
) =>
  apiRequest<{
    storedItemId: number;
    previousStatus: StoredItemStatus;
    publicStatus: StoredItemStatus;
    publicStatusName: string;
    changed: boolean;
    changedAt: string;
  }>(`/api/stored-items/${storedItemId}/status`, {
    method: "PATCH",
    body: { status, changeReason },
  });

export const deleteStoredItem = (storedItemId: number) =>
  apiRequest<void>(`/api/stored-items/${storedItemId}`, { method: "DELETE" });

export const getStoredItemClaims = (
  storedItemId: number,
  query: { status?: ItemClaimStatus; page?: number; size?: number } = {},
) =>
  apiGet<OffsetPage<ItemClaimSummary>>(
    `/api/stored-items/${storedItemId}/claims${toQueryString(query)}`,
  );

export const getOfficeItemClaims = (
  officeId: number,
  query: { status?: ItemClaimStatus; page?: number; size?: number } = {},
) =>
  apiGet<OffsetPage<ItemClaimSummary>>(
    `/api/lost-item-offices/${officeId}/claims${toQueryString(query)}`,
  );

const collectClaimPages = async (
  getPage: (page: number, size: number) => Promise<OffsetPage<ItemClaimSummary>>,
  size = 50,
) => {
  const content: ItemClaimSummary[] = [];
  let page = 0;

  while (true) {
    const response = await getPage(page, size);
    content.push(...response.content);

    if (!response.hasNext || page + 1 >= response.totalPages) break;
    page += 1;
  }

  return content;
};

export const getAllStoredItemClaims = (
  storedItemId: number,
  query: { status?: ItemClaimStatus; size?: number } = {},
) =>
  collectClaimPages(
    (page, size) => getStoredItemClaims(storedItemId, { ...query, page, size }),
    query.size,
  );

export const getAllOfficeItemClaims = (
  officeId: number,
  query: { status?: ItemClaimStatus; size?: number } = {},
) =>
  collectClaimPages(
    (page, size) => getOfficeItemClaims(officeId, { ...query, page, size }),
    query.size,
  );

export const getItemClaim = (itemClaimId: number) =>
  apiGet<ItemClaimDetail>(`/api/item-claims/${itemClaimId}`);

export const decideItemClaim = (
  itemClaimId: number,
  decision: "APPROVED" | "REJECTED",
  message?: string,
) =>
  apiRequest<{
    itemClaimId: number;
    storedItemId: number;
    decision: "APPROVED" | "REJECTED";
    decisionName: string;
    message: string | null;
    decidedAt: string;
  }>(`/api/item-claims/${itemClaimId}/decision`, {
    method: "PATCH",
    body: { decision, message },
  });
