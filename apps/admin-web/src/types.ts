export type AdminStatus = "waiting" | "inProgress" | "resolved";
export type AdminSection = "dashboard" | "lost" | "requests" | "facility";

export interface AdminLostItem {
  id: number;
  title: string;
  category: string;
  location: string;
  storageLocation: string;
  foundDate: string;
  status: AdminStatus;
}

export interface OwnerRequest {
  id: number;
  lostItemId: number;
  itemTitle: string;
  applicant: string;
  studentNumber: string;
  submittedAt: string;
  evidence: string;
  status: AdminStatus;
  result?: "approved" | "rejected";
  resultMessage?: string;
}

export interface AdminFacilityItem {
  id: number;
  title: string;
  category: string;
  location: string;
  submittedAt: string;
  description: string;
  status: AdminStatus;
  answer?: string;
}
