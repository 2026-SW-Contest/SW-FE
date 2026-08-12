export type FacilityStatus = "waiting" | "inProgress" | "resolved";

export interface FacilityItem {
  id: number;

  image: string;
  images?: string[];

  title: string;
  description: string;

  date: string;

  type: string;

  statusIcon: string;
  status: FacilityStatus;

  location: string;

  detailDescription?: string;
}
