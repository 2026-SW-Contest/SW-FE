import emptyImage from "../assets/icons/placeholders/image-placeholder.svg";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../assets/icons/status/resolved.svg";
import storedStatusIcon from "../assets/icons/status/stored.svg";
import { LostItem, LostStatus } from "../types/lost";
import { apiGet, apiRequest, toQueryString } from "./client";
import { getPublicFileUrl } from "./file";

interface CursorSlice<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

interface StoredItemSummaryResponse {
  storedItemId: number;
  itemName: string;
  description: string;
  categoryName: string;
  foundLocationName: string;
  foundDate: string;
  publicStatus: string;
  publicStatusName: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface StoredItemDetailResponse {
  storedItemId: number;
  itemName: string;
  description: string;
  category: { categoryId: number; name: string };
  foundLocation: { locationId: number | null; name: string };
  foundDate: string;
  publicStatus: string;
  publicStatusName: string;
  office: { officeId: number; name: string };
  attachments: Array<{
    fileId: number;
    originalFilename: string;
    fileUrl?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredItemQuery {
  categoryId?: number;
  locationId?: number;
  status?: string;
  from?: string;
  to?: string;
  cursor?: string;
  size?: number;
}

export interface CreateItemClaimResponse {
  itemClaimId: number;
  storedItemId: number;
  claimantName: string;
  studentNumber: string;
  claimStatus: string;
  attachmentCount: number;
  createdAt: string;
}

export interface MyItemClaimSummary {
  itemClaimId: number;
  storedItemId: number;
  itemName: string;
  categoryName: string;
  foundLocationName: string;
  foundDate: string;
  requestMethod: string;
  claimStatus: "WAITING" | "APPROVED" | "REJECTED";
  claimStatusName: string;
  thumbnailUrl: string | null;
  decisionMessage: string | null;
  createdAt: string;
  decidedAt: string | null;
}

const normalizeLostStatus = (value?: string): LostStatus => {
  if (value === "IN_PROGRESS") return "inProgress";
  if (value === "COMPLETED") return "resolved";
  return "stored";
};

const getStatusIcon = (status: LostStatus) => {
  if (status === "inProgress") return inProgressStatusIcon;
  if (status === "resolved") return resolvedStatusIcon;
  return storedStatusIcon;
};

const normalizeClaimStatus = (
  status: MyItemClaimSummary["claimStatus"],
): LostStatus => status === "APPROVED" ? "resolved" : "inProgress";

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace(/-/g, ".");
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\.\s?/g, ".")
    .replace(/\.$/, "");
};

const formatRelativeTime = (value?: string) => {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const elapsed = Math.max(0, Date.now() - timestamp);
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  if (elapsed < hour) return `${Math.max(1, Math.floor(elapsed / 60000))}분 전`;
  if (elapsed < day) return `${Math.floor(elapsed / hour)}시간 전`;
  if (elapsed < 7 * day) return `${Math.floor(elapsed / day)}일 전`;
  return formatDate(value);
};

const mapStoredItemSummary = (item: StoredItemSummaryResponse): LostItem => {
  const status = normalizeLostStatus(item.publicStatus);
  return {
    id: item.storedItemId,
    image: item.thumbnailUrl ?? emptyImage,
    images: item.thumbnailUrl ? [item.thumbnailUrl] : undefined,
    category: item.categoryName,
    time: formatRelativeTime(item.createdAt),
    title: item.itemName,
    description: item.description,
    location: item.foundLocationName,
    date: formatDate(item.foundDate),
    status,
    statusIcon: getStatusIcon(status),
    foundLocation: item.foundLocationName,
    foundDate: formatDate(item.foundDate),
    detailDescription: item.description,
  };
};

const mapStoredItemDetail = (item: StoredItemDetailResponse): LostItem => {
  const status = normalizeLostStatus(item.publicStatus);
  const images = item.attachments.map(
    (attachment) => attachment.fileUrl ?? getPublicFileUrl(attachment.fileId),
  );
  return {
    id: item.storedItemId,
    image: images[0] ?? emptyImage,
    images,
    category: item.category.name,
    time: formatRelativeTime(item.createdAt),
    title: item.itemName,
    description: item.description,
    location: item.foundLocation.name,
    date: formatDate(item.foundDate),
    status,
    statusIcon: getStatusIcon(status),
    storageLocation: item.office.name,
    foundLocation: item.foundLocation.name,
    foundDate: formatDate(item.foundDate),
    detailDescription: item.description,
  };
};

export const mapMyItemClaim = (claim: MyItemClaimSummary): LostItem => {
  const status = normalizeClaimStatus(claim.claimStatus);
  return {
    id: claim.storedItemId,
    image: claim.thumbnailUrl ?? emptyImage,
    images: claim.thumbnailUrl ? [claim.thumbnailUrl] : undefined,
    category: claim.categoryName,
    time: formatRelativeTime(claim.createdAt),
    title: claim.itemName,
    description:
      claim.decisionMessage ??
      (claim.claimStatus === "REJECTED"
        ? "소유자 확인 요청이 반려되었습니다."
        : "소유자 확인 요청을 처리 중입니다."),
    location: claim.foundLocationName,
    date: formatDate(claim.foundDate),
    status,
    statusIcon: getStatusIcon(status),
    foundLocation: claim.foundLocationName,
    foundDate: formatDate(claim.foundDate),
    detailDescription: claim.decisionMessage ?? undefined,
    itemClaimId: claim.itemClaimId,
    claimStatus: claim.claimStatus,
    claimStatusName: claim.claimStatusName,
    decisionMessage: claim.decisionMessage,
    decidedAt: claim.decidedAt,
  };
};

export const getStoredItems = async (query: StoredItemQuery = {}) => {
  const response = await apiGet<CursorSlice<StoredItemSummaryResponse>>(
    `/api/stored-items${toQueryString({
      categoryId: query.categoryId,
      locationId: query.locationId,
      status: query.status,
      from: query.from,
      to: query.to,
      cursor: query.cursor,
      size: query.size,
    })}`,
  );

  return { ...response, content: response.content.map(mapStoredItemSummary) };
};

export const getStoredItem = async (storedItemId: number) =>
  mapStoredItemDetail(
    await apiGet<StoredItemDetailResponse>(`/api/stored-items/${storedItemId}`),
  );

export const createItemClaim = (
  storedItemId: number,
  ownershipDescription: string,
  files: File[],
) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify({ ownershipDescription })], {
      type: "application/json",
    }),
  );
  files.forEach((file) => formData.append("files", file));

  return apiRequest<CreateItemClaimResponse>(
    `/api/stored-items/${storedItemId}/claims`,
    { method: "POST", body: formData },
  );
};

export const getMyItemClaims = (
  query: { cursor?: string; size?: number } = {},
) =>
  apiGet<CursorSlice<MyItemClaimSummary>>(
    `/api/users/me/item-claims${toQueryString(query)}`,
  );
