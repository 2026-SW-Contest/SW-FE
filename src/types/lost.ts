export type LostStatus = "stored" | "inProgress" | "resolved";

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
  status: LostStatus;

  storageLocation?: string;
  foundLocation?: string;
  foundDate?: string;

  detailDescription?: string;

  itemClaimId?: number;
  claimStatus?: "WAITING" | "APPROVED" | "REJECTED";
  claimStatusName?: string;
  decisionMessage?: string | null;
  decidedAt?: string | null;
}
