import { apiGet, apiRequest } from "./client";

export interface RecentSearchItem {
  recentSearchId: number;
  keyword: string;
  searchedAt: string;
}

export const getRecentSearches = () =>
  apiGet<RecentSearchItem[]>("/api/recent-searches");

export const addRecentSearch = (keyword: string) =>
  apiRequest<RecentSearchItem[]>("/api/recent-searches", {
    method: "POST",
    body: { keyword },
  });

export const deleteRecentSearch = (recentSearchId: number) =>
  apiRequest<void>(`/api/recent-searches/${recentSearchId}`, {
    method: "DELETE",
  });

export const deleteAllRecentSearches = () =>
  apiRequest<void>("/api/recent-searches", { method: "DELETE" });
