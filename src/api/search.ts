import { FacilityRequestResponse, mapFacilityItem } from "./facility";
import { apiGet, toQueryString } from "./client";
import emptyImage from "../assets/icons/placeholders/image-placeholder.svg";
import storedStatusIcon from "../assets/icons/status/stored.svg";
import inProgressStatusIcon from "../assets/icons/status/in-progress.svg";
import resolvedStatusIcon from "../assets/icons/status/resolved.svg";
import { LostItem, LostStatus } from "../types/lost";

export interface SearchSuggestions {
  lostItemSuggestions: string[];
  facilityRequestSuggestions: string[];
}

export interface SearchSummary {
  keyword: string;
  lostItemCount: number;
  facilityRequestCount: number;
}

interface CursorResponse<T> {
  content: T[];
  nextCursor: string | number | null;
  hasNext: boolean;
}

interface LostItemSearchResponse {
  storedItemId?: number;
  lostItemId?: number;
  id?: number;
  title?: string;
  itemName?: string;
  description?: string;
  categoryName?: string;
  categoryPath?: string;
  locationName?: string;
  foundLocationName?: string;
  foundLocation?: string;
  foundDate?: string;
  createdAt?: string;
  status?: string;
  publicStatus?: string;
  thumbnailUrl?: string | null;
  imageUrl?: string;
  imageUrls?: string[];
}

const mapLostStatus = (value?: string): LostStatus => {
  switch (value?.toUpperCase()) {
    case "IN_PROGRESS":
    case "CLAIMING":
      return "inProgress";
    case "RESOLVED":
    case "RETURNED":
    case "COMPLETED":
      return "resolved";
    default:
      return "stored";
  }
};

const mapLostItem = (item: LostItemSearchResponse): LostItem => {
  const status = mapLostStatus(item.publicStatus ?? item.status);
  const primaryImage = item.thumbnailUrl ?? item.imageUrl;
  const images = item.imageUrls ?? (primaryImage ? [primaryImage] : undefined);

  return {
    id: item.storedItemId ?? item.lostItemId ?? item.id ?? 0,
    image: images?.[0] ?? emptyImage,
    images,
    category: item.categoryPath ?? item.categoryName ?? "기타",
    time: "",
    title: item.title ?? item.itemName ?? "분실물",
    description: item.description ?? "",
    detailDescription: item.description ?? "",
    location:
      item.foundLocationName ?? item.locationName ?? item.foundLocation ?? "",
    foundLocation:
      item.foundLocationName ?? item.foundLocation ?? item.locationName,
    date: item.foundDate ?? item.createdAt ?? "",
    foundDate: item.foundDate,
    status,
    statusIcon:
      status === "resolved"
        ? resolvedStatusIcon
        : status === "inProgress"
          ? inProgressStatusIcon
          : storedStatusIcon,
  };
};

export const getSearchSuggestions = (query: string) =>
  apiGet<SearchSuggestions>(
    `/api/search/suggestions${toQueryString({ query })}`,
  );

export const getSearchSummary = (keyword: string) =>
  apiGet<SearchSummary>(`/api/search/summary${toQueryString({ keyword })}`);

export const searchFacilityRequests = async (keyword: string) => {
  const response = await apiGet<CursorResponse<FacilityRequestResponse>>(
    `/api/search/facility-requests${toQueryString({ keyword })}`,
  );
  return response.content.map(mapFacilityItem);
};

export const searchLostItems = async (keyword: string) => {
  const response = await apiGet<CursorResponse<LostItemSearchResponse>>(
    `/api/search/lost-items${toQueryString({ keyword })}`,
  );
  return response.content.map(mapLostItem);
};
