export interface LostItem {
  id: number;

  image: string;
  images?: string[];

  category: string;
  time: string;

  title: string;
  description: string;

  location: string;
  date: string;

  statusIcon: string;

  storageLocation?: string;
  foundLocation?: string;
  foundDate?: string;

  detailDescription?: string;
}