export interface FacilityItem {
  id: number;

  image: string;
  images?: string[];

  title: string;
  description: string;

  date: string;

  status?: string;

  location?: string;

  detailDescription?: string;
}