import { apiGet } from "./client";

export interface LocationResponse {
  locationId: number;
  locationCode: string | null;
  locationName: string;
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
}

export interface LostItemOfficeResponse {
  officeId: number;
  officeName: string;
  buildingId: number;
  buildingCode: string | null;
  buildingName: string;
  locationId: number;
  locationName: string;
  floor: string | null;
  departmentName: string;
  operatingHours: string | null;
  guidance: string | null;
  primary: boolean;
}

export const getLocations = () => apiGet<LocationResponse[]>("/api/locations");

export const getFacilityCategories = () =>
  apiGet<CategoryResponse[]>("/api/facility-categories");

export const getItemCategories = () =>
  apiGet<CategoryResponse[]>("/api/item-categories");

export const getLostItemOffices = () =>
  apiGet<LostItemOfficeResponse[]>("/api/lost-item-offices");
