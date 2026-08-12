export type FacilityStatus = "waiting" | "inProgress" | "resolved";

export interface FacilityAdminResponse {
  responseId: number;
  content: string;
  createdAt: string;
}

export interface FacilityItem {
  id: number;

  image: string;
  images?: string[];

  title: string;
  description: string;

  date: string;

  type: string;
  categoryId?: number;

  statusIcon: string;
  status: FacilityStatus;

  location: string;
  locationId?: number;

  detailDescription?: string;

  adminResponses?: FacilityAdminResponse[];

  ownedByCurrentUser?: boolean;
  editable?: boolean;
  deletable?: boolean;
}
