export interface FacilityItem {
  id: number;

  image: string;
  images?: string[];

  title: string;
  description: string;

  date: string;

  type: string;

  statusIcon: string;

  location: string;

  detailDescription?: string;
}