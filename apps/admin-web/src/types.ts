export type AdminStatus = "waiting" | "inProgress" | "resolved";
export type AdminSection =
  | "dashboard"
  | "lost"
  | "requests"
  | "facility"
  | "account";

export interface AdminAccount {
  userId: number;
  email: string;
  name?: string;
  studentNumber?: string;
  roles: string[];
}

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
  requesterId?: number;
  requesterName?: string;
  studentNumber?: string;
  requesterEmail?: string;
  category: string;
  categoryId?: number;
  location: string;
  locationId?: number;
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
  description: string;
  status: AdminStatus;
  statusName?: string;
  thumbnailUrl?: string | null;
  imageUrls?: string[];
  attachments?: Array<{
    fileId: number;
    originalFilename: string;
    fileUrl: string;
  }>;
  adminResponses?: Array<{
    responseId: number;
    content: string;
    createdAt: string;
  }>;
  answer?: string;
}
